"""
EngiPath AI — Internships API Routes

Handles:
- POST /recommend — skill-based + resume-based recommendations + live discovery
- POST /search — live internship search only
- GET /<id> — retrieve single internship listing
"""
import logging
from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from ...schemas.internships import InternshipRecommendRequest, LiveInternshipSearchRequest
from ...services.internships.recommendation_service import RecommendationService
from ...services.internships.live_search_service import LiveInternshipSearchService
from ...extensions import db
from ...models.internship_listing import InternshipListing

logger = logging.getLogger(__name__)

internships_bp = Blueprint("internships", __name__)


@internships_bp.post("/recommend")
def recommend_internships():
    """
    Internship Recommendations
    ---
    tags:
      - Internships
    summary: Get AI-powered internship recommendations + live discovery
    description: |
      Returns THREE separate lists:
      1. skill_based_recommendations — based on manually entered skills ONLY
      2. resume_based_recommendations — based on resume analysis + interests
      3. live_internships — currently available internships from the web
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - branch
            - year
            - skills
          properties:
            branch:
              type: string
              example: "Computer Science"
            year:
              type: string
              example: "2nd Year"
            skills:
              type: array
              items:
                type: string
              example: ["Python", "Machine Learning"]
              description: "Manually entered skills — used ONLY for skill-based recommendations"
            interests:
              type: array
              items:
                type: string
              example: ["AI", "Data Science"]
            resume_analysis_id:
              type: string
              description: "Optional ID from POST /resume/analyze"
    responses:
      200:
        description: Three separate recommendation/discovery lists
      400:
        description: Validation error
    """
    data = request.get_json(silent=True) or {}

    try:
        req = InternshipRecommendRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    try:
        # Recommendations (AI-based — two separate lists)
        rec_service = RecommendationService()
        rec_result = rec_service.generate_recommendations(
            branch=req.branch,
            year=req.year,
            skills=req.skills,
            interests=req.interests,
            resume_analysis_id=req.resume_analysis_id,
        )

        # Live internship discovery (separate from recommendations)
        live_service = LiveInternshipSearchService()
        live_result = live_service.search(
            branch=req.branch,
            skills=req.skills,
            interests=req.interests,
        )

        skill_based = rec_result.get("skill_based_recommendations", [])
        resume_based = rec_result.get("resume_based_recommendations", [])
        live_internships = live_result.get("live_internships", [])

        return jsonify({
            "success": True,
            "data": {
                "skill_based_recommendations": skill_based,
                "resume_based_recommendations": resume_based,
                "live_internships": live_internships,
            },
            "meta": {
                "branch": req.branch,
                "year": req.year,
                "skill_based_count": len(skill_based),
                "resume_based_count": len(resume_based),
                "live_count": len(live_internships),
            },
        }), 200

    except RuntimeError as exc:
        # Gemini not configured
        return jsonify({"success": False, "error": {"code": "GEMINI_NOT_CONFIGURED", "message": str(exc)}}), 503
    except Exception as exc:
        logger.error("Internship recommend error: %s", exc, exc_info=True)
        return _server_error("RECOMMEND_FAILED", "Unable to generate internship recommendations at this time.")


@internships_bp.post("/search")
def search_internships():
    """
    Live Internship Search
    ---
    tags:
      - Internships
    summary: Search for currently available internship opportunities
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - branch
          properties:
            branch:
              type: string
              example: "Mechanical Engineering"
            skills:
              type: array
              items:
                type: string
            interests:
              type: array
              items:
                type: string
            location:
              type: string
              example: "Mumbai"
    responses:
      200:
        description: Live internship listings from the web
    """
    data = request.get_json(silent=True) or {}

    try:
        req = LiveInternshipSearchRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    try:
        service = LiveInternshipSearchService()
        result = service.search(
            branch=req.branch,
            skills=req.skills,
            interests=req.interests,
            location=req.location,
        )
        return jsonify({"success": True, **result}), 200
    except Exception as exc:
        logger.error("Live internship search error: %s", exc, exc_info=True)
        return _server_error("SEARCH_FAILED", "Unable to retrieve live internship data at this time.")


@internships_bp.get("/<string:internship_id>")
def get_internship(internship_id: str):
    """
    Get Internship by ID
    ---
    tags:
      - Internships
    summary: Retrieve a specific internship listing by ID
    parameters:
      - in: path
        name: internship_id
        type: string
        required: true
    responses:
      200:
        description: Internship listing details
      404:
        description: Not found
    """
    listing = db.session.get(InternshipListing, internship_id)
    if not listing:
        return jsonify({
            "success": False,
            "error": {"code": "NOT_FOUND", "message": f"Internship {internship_id!r} not found."},
        }), 404
    return jsonify({"success": True, "data": listing.to_dict()}), 200


def _validation_error(exc: ValidationError):
    raw_errors = exc.errors(include_url=False)
    safe_errors = []
    for err in raw_errors:
        clean = {k: v for k, v in err.items() if k != "ctx"}
        if "ctx" in err:
            clean["ctx"] = {k: str(v) for k, v in err["ctx"].items()}
        safe_errors.append(clean)
    messages = [f"{'.'.join(str(l) for l in e['loc'])}: {e['msg']}" for e in safe_errors]
    return jsonify({
        "success": False,
        "error": {"code": "VALIDATION_ERROR", "message": "; ".join(messages), "details": safe_errors},
    }), 400


def _server_error(code: str, message: str):
    return jsonify({"success": False, "error": {"code": code, "message": message}}), 500
