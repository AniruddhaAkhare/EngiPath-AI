"""
EngiPath AI — Resume API Routes

Handles secure resume upload and analysis.
"""
import logging
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from pydantic import ValidationError

from ...services.resume.resume_processor import ResumeProcessorService
from ...ai.gemini.internship_gemini import InternshipGeminiService
from ...extensions import db
from ...models.candidate_profile import CandidateProfile
from ...models.resume_analysis import ResumeAnalysis

logger = logging.getLogger(__name__)

resume_bp = Blueprint("resume", __name__)


@resume_bp.post("/upload")
def upload_resume():
    """
    Upload Resume
    ---
    tags:
      - Resume
    summary: Upload a resume file (PDF or DOCX) for validation
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: resume
        type: file
        required: true
        description: "Resume file (.pdf or .docx only, max 10MB)"
    responses:
      200:
        description: File uploaded and validated successfully
      400:
        description: Invalid file type or size
    """
    if "resume" not in request.files:
        return jsonify({
            "success": False,
            "error": {"code": "NO_FILE", "message": "No resume file provided. Use multipart/form-data with key 'resume'."},
        }), 400

    file = request.files["resume"]
    processor = ResumeProcessorService()

    # Validate
    is_valid, error_msg = processor.validate_file(file)
    if not is_valid:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_FILE", "message": error_msg},
        }), 400

    # Save
    try:
        file_id, save_path, ext = processor.save_file(file)
        file_size = 0
        import os
        if os.path.exists(save_path):
            file_size = os.path.getsize(save_path)

        return jsonify({
            "success": True,
            "data": {
                "file_id": file_id,
                "filename": file.filename,
                "file_type": ext,
                "size_bytes": file_size,
                "message": f"Resume uploaded successfully. Use file_id in /analyze.",
                "save_path": save_path,  # internal — used by /analyze
            },
        }), 200
    except Exception as exc:
        logger.error("Resume upload error: %s", exc, exc_info=True)
        return jsonify({
            "success": False,
            "error": {"code": "UPLOAD_FAILED", "message": "Failed to save resume file."},
        }), 500


@resume_bp.post("/analyze")
def analyze_resume():
    """
    Analyze Resume
    ---
    tags:
      - Resume
    summary: Extract structured candidate profile from resume + user inputs
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: resume
        type: file
        required: true
        description: "Resume file (.pdf or .docx)"
      - in: formData
        name: branch
        type: string
        required: true
        example: "Computer Science"
      - in: formData
        name: year
        type: string
        required: true
        example: "2nd Year"
      - in: formData
        name: skills
        type: string
        required: false
        example: "Python,Machine Learning,SQL"
        description: "Comma-separated skills"
      - in: formData
        name: interests
        type: string
        required: false
        example: "AI,Data Science"
        description: "Comma-separated interests"
    responses:
      200:
        description: Structured candidate profile extracted
      400:
        description: Invalid file or missing required fields
      500:
        description: Analysis failed
    """
    # Get form fields
    branch = request.form.get("branch", "").strip()
    year = request.form.get("year", "").strip()
    skills_raw = request.form.get("skills", "")
    interests_raw = request.form.get("interests", "")

    if not branch:
        return jsonify({"success": False, "error": {"code": "MISSING_FIELD", "message": "'branch' is required."}}), 400
    if not year:
        return jsonify({"success": False, "error": {"code": "MISSING_FIELD", "message": "'year' is required."}}), 400

    skills = [s.strip() for s in skills_raw.split(",") if s.strip()] if skills_raw else []
    interests = [i.strip() for i in interests_raw.split(",") if i.strip()] if interests_raw else []

    # Get file
    if "resume" not in request.files:
        return jsonify({"success": False, "error": {"code": "NO_FILE", "message": "No resume file provided."}}), 400

    file = request.files["resume"]
    processor = ResumeProcessorService()

    # Validate
    is_valid, error_msg = processor.validate_file(file)
    if not is_valid:
        return jsonify({"success": False, "error": {"code": "INVALID_FILE", "message": error_msg}}), 400

    # Save
    try:
        file_id, save_path, ext = processor.save_file(file)
    except Exception as exc:
        logger.error("Failed to save resume for analysis: %s", exc)
        return jsonify({"success": False, "error": {"code": "UPLOAD_FAILED", "message": "Failed to save resume."}}), 500

    # Extract text
    text, error = processor.extract_text(save_path, ext)

    # Cleanup
    processor.cleanup(save_path)

    if error or not text:
        # Record failed analysis
        _record_analysis(file_id, file.filename, ext, None, status="failed", error=error)
        return jsonify({
            "success": False,
            "error": {"code": "EXTRACTION_FAILED", "message": error or "Text extraction returned empty result."},
        }), 422

    # Hash for deduplication
    text_hash = processor.compute_text_hash(text)

    # Analyze with InternshipGemini
    try:
        profile = InternshipGeminiService.analyze_resume(text, branch, year, skills, interests)
    except RuntimeError as exc:
        return jsonify({"success": False, "error": {"code": "GEMINI_NOT_CONFIGURED", "message": str(exc)}}), 503
    except Exception as exc:
        logger.error("Resume analysis error: %s", exc, exc_info=True)
        return jsonify({"success": False, "error": {"code": "ANALYSIS_FAILED", "message": "AI analysis failed."}}), 500

    # Save candidate profile
    analysis_id = _save_profile_and_analysis(file_id, file.filename, ext, profile, text_hash)

    return jsonify({
        "success": True,
        "data": {
            "analysis_id": analysis_id,
            "profile": profile,
            "extracted_text_length": len(text),
        },
    }), 200


def _record_analysis(file_id, filename, ext, profile_id, status="success", error=None):
    try:
        analysis = ResumeAnalysis(
            id=file_id,
            original_filename=filename,
            file_type=ext,
            status=status,
            error_message=error,
            candidate_profile_id=profile_id,
        )
        db.session.add(analysis)
        db.session.commit()
        return file_id
    except Exception as exc:
        logger.error("Failed to record analysis: %s", exc)
        db.session.rollback()
        return file_id


def _save_profile_and_analysis(file_id, filename, ext, profile, text_hash) -> str:
    try:
        candidate = CandidateProfile(
            branch=profile.get("branch"),
            year=profile.get("year"),
            skills=profile.get("skills", []),
            interests=profile.get("interests", []),
            resume_skills=profile.get("resume_skills", []),
            technologies=profile.get("technologies", []),
            projects=profile.get("projects", []),
            experience=profile.get("experience", []),
            domains=profile.get("domains", []),
            education=profile.get("education", []),
            original_filename=filename,
            resume_text_hash=text_hash,
        )
        db.session.add(candidate)
        db.session.flush()

        analysis = ResumeAnalysis(
            id=file_id,
            candidate_profile_id=candidate.id,
            original_filename=filename,
            file_type=ext,
            status="success",
            extracted_profile=profile,
        )
        db.session.add(analysis)
        db.session.commit()
        return file_id
    except Exception as exc:
        logger.error("Failed to save profile/analysis: %s", exc)
        db.session.rollback()
        return file_id
