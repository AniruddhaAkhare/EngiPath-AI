"""
Tests: Resume upload, validation, and extraction
"""
import io
import os
import pytest
from unittest.mock import patch, MagicMock


class TestResumeUploadValidation:
    """File validation tests."""

    def test_upload_no_file_returns_400(self, client):
        resp = client.post("/api/v1/resume/upload")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False

    def test_upload_exe_file_rejected(self, client):
        data = {"resume": (io.BytesIO(b"MZ\x90\x00"), "malware.exe", "application/octet-stream")}
        resp = client.post("/api/v1/resume/upload", data=data, content_type="multipart/form-data")
        assert resp.status_code == 400
        result = resp.get_json()
        assert result["success"] is False

    def test_upload_sh_file_rejected(self, client):
        data = {"resume": (io.BytesIO(b"#!/bin/bash\nrm -rf /"), "hack.sh", "text/x-shellscript")}
        resp = client.post("/api/v1/resume/upload", data=data, content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_upload_js_file_rejected(self, client):
        data = {"resume": (io.BytesIO(b"console.log('evil')"), "evil.js", "application/javascript")}
        resp = client.post("/api/v1/resume/upload", data=data, content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_upload_zip_file_rejected(self, client):
        data = {"resume": (io.BytesIO(b"PK\x03\x04"), "archive.zip", "application/zip")}
        resp = client.post("/api/v1/resume/upload", data=data, content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_upload_pdf_accepted(self, client):
        # Minimal PDF bytes
        pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF"
        data = {"resume": (io.BytesIO(pdf_bytes), "resume.pdf", "application/pdf")}
        resp = client.post("/api/v1/resume/upload", data=data, content_type="multipart/form-data")
        assert resp.status_code == 200
        result = resp.get_json()
        assert result["success"] is True
        assert "file_id" in result["data"]

    def test_upload_docx_accepted(self, client, mock_docx_file):
        buf, filename, mime = mock_docx_file
        data = {"resume": (buf, filename, mime)}
        resp = client.post("/api/v1/resume/upload", data=data, content_type="multipart/form-data")
        assert resp.status_code == 200
        result = resp.get_json()
        assert result["success"] is True


class TestResumeAnalysis:
    """Resume analysis tests."""

    def test_analyze_missing_branch_returns_400(self, client, mock_docx_file):
        buf, filename, mime = mock_docx_file
        data = {
            "resume": (buf, filename, mime),
            "year": "2nd Year",
        }
        resp = client.post("/api/v1/resume/analyze", data=data, content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_analyze_missing_year_returns_400(self, client, mock_docx_file):
        buf, filename, mime = mock_docx_file
        data = {
            "resume": (buf, filename, mime),
            "branch": "Computer Science",
        }
        resp = client.post("/api/v1/resume/analyze", data=data, content_type="multipart/form-data")
        assert resp.status_code == 400

    def test_analyze_docx_returns_profile(self, client, mock_docx_file):
        """Full DOCX analysis with mocked Gemini."""
        buf, filename, mime = mock_docx_file

        mock_profile = {
            "branch": "Computer Science",
            "year": "2nd Year",
            "skills": [],
            "resume_skills": ["Python", "Machine Learning"],
            "technologies": ["Python", "BERT"],
            "projects": [{"title": "Sentiment Analysis", "technologies": ["BERT"]}],
            "experience": [],
            "domains": ["AI", "NLP"],
            "interests": [],
            "education": [{"degree": "B.Tech", "institution": "Test University"}],
        }

        with patch("app.api.resume.routes.InternshipGeminiService.analyze_resume") as mock_analyze:
            mock_analyze.return_value = mock_profile
            data = {
                "resume": (buf, filename, mime),
                "branch": "Computer Science",
                "year": "2nd Year",
                "skills": "Python,SQL",
                "interests": "AI,Data Science",
            }
            resp = client.post("/api/v1/resume/analyze", data=data, content_type="multipart/form-data")

        assert resp.status_code == 200
        result = resp.get_json()
        assert result["success"] is True
        assert "analysis_id" in result["data"]
        assert "profile" in result["data"]
        profile = result["data"]["profile"]
        assert "resume_skills" in profile
        assert "technologies" in profile
        assert "projects" in profile
        assert "experience" in profile
        assert "education" in profile

    def test_analyze_extracts_text_length(self, client, mock_docx_file):
        """Response includes extracted_text_length."""
        buf, filename, mime = mock_docx_file
        with patch("app.api.resume.routes.InternshipGeminiService.analyze_resume") as mock_analyze:
            mock_analyze.return_value = {"branch": "CS", "year": "1st", "skills": [], "resume_skills": [], "technologies": [], "projects": [], "experience": [], "domains": [], "interests": [], "education": []}
            data = {"resume": (buf, filename, mime), "branch": "CS", "year": "1st Year"}
            resp = client.post("/api/v1/resume/analyze", data=data, content_type="multipart/form-data")
        result = resp.get_json()
        assert "extracted_text_length" in result["data"]
        assert result["data"]["extracted_text_length"] > 0


class TestResumeProcessor:
    """Unit tests for ResumeProcessorService."""

    def test_validate_allowed_extensions(self, app):
        with app.app_context():
            from app.services.resume.resume_processor import ResumeProcessorService
            svc = ResumeProcessorService()
            # PDF
            mock_file = MagicMock()
            mock_file.filename = "test.pdf"
            mock_file.content_type = "application/pdf"
            valid, msg = svc.validate_file(mock_file)
            assert valid is True

    def test_validate_rejects_exe(self, app):
        with app.app_context():
            from app.services.resume.resume_processor import ResumeProcessorService
            svc = ResumeProcessorService()
            mock_file = MagicMock()
            mock_file.filename = "test.exe"
            mock_file.content_type = "application/octet-stream"
            valid, msg = svc.validate_file(mock_file)
            assert valid is False

    def test_validate_rejects_no_filename(self, app):
        with app.app_context():
            from app.services.resume.resume_processor import ResumeProcessorService
            svc = ResumeProcessorService()
            mock_file = MagicMock()
            mock_file.filename = ""
            valid, msg = svc.validate_file(mock_file)
            assert valid is False
