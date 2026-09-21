"""
Tests: Gemini Key Separation

CRITICAL: Verifies that CLASSES_GEMINI_API_KEY and INTERNSHIP_GEMINI_API_KEY
are NEVER shared, crossed, or used interchangeably.

This is the most important security/architecture test in the test suite.
"""
import os
import ast
import pathlib
import pytest


BACKEND_ROOT = pathlib.Path(__file__).parent.parent / "app"
AI_GEMINI_DIR = BACKEND_ROOT / "ai" / "gemini"
CLASSES_GEMINI_FILE = AI_GEMINI_DIR / "classes_gemini.py"
INTERNSHIP_GEMINI_FILE = AI_GEMINI_DIR / "internship_gemini.py"

# All service/route files that should use ONLY the classes key
CLASSES_ONLY_FILES = [
    BACKEND_ROOT / "ai" / "gemini" / "classes_gemini.py",
    BACKEND_ROOT / "ai" / "classes" / "class_analyzer.py" if (BACKEND_ROOT / "ai" / "classes" / "class_analyzer.py").exists() else None,
    BACKEND_ROOT / "services" / "classes" / "class_search_service.py",
    BACKEND_ROOT / "services" / "classes" / "class_comparison_service.py",
    BACKEND_ROOT / "api" / "classes" / "routes.py",
]

# All service/route files that should use ONLY the internship key
INTERNSHIP_ONLY_FILES = [
    BACKEND_ROOT / "ai" / "gemini" / "internship_gemini.py",
    BACKEND_ROOT / "ai" / "internships" / "internship_analyzer.py" if (BACKEND_ROOT / "ai" / "internships" / "internship_analyzer.py").exists() else None,
    BACKEND_ROOT / "services" / "internships" / "recommendation_service.py",
    BACKEND_ROOT / "services" / "internships" / "live_search_service.py",
    BACKEND_ROOT / "api" / "internships" / "routes.py",
    BACKEND_ROOT / "api" / "resume" / "routes.py",
]


class TestGeminiKeySeparation:
    """Verify complete isolation of the two Gemini API keys."""

    def test_classes_gemini_uses_only_classes_key(self):
        """classes_gemini.py must reference CLASSES_GEMINI_API_KEY, never INTERNSHIP_GEMINI_API_KEY."""
        content = CLASSES_GEMINI_FILE.read_text(encoding="utf-8")
        assert "CLASSES_GEMINI_API_KEY" in content, "ClassesGeminiService must use CLASSES_GEMINI_API_KEY"
        assert "INTERNSHIP_GEMINI_API_KEY" not in content, \
            "ClassesGeminiService MUST NOT reference INTERNSHIP_GEMINI_API_KEY"

    def test_internship_gemini_uses_only_internship_key(self):
        """internship_gemini.py must reference INTERNSHIP_GEMINI_API_KEY, never CLASSES_GEMINI_API_KEY."""
        content = INTERNSHIP_GEMINI_FILE.read_text(encoding="utf-8")
        assert "INTERNSHIP_GEMINI_API_KEY" in content, "InternshipGeminiService must use INTERNSHIP_GEMINI_API_KEY"
        assert "CLASSES_GEMINI_API_KEY" not in content, \
            "InternshipGeminiService MUST NOT reference CLASSES_GEMINI_API_KEY"

    def test_classes_routes_do_not_import_internship_gemini(self):
        """Classes route files must not import InternshipGeminiService."""
        classes_route = BACKEND_ROOT / "api" / "classes" / "routes.py"
        content = classes_route.read_text(encoding="utf-8")
        assert "InternshipGeminiService" not in content, \
            "Classes routes must not import InternshipGeminiService"
        assert "internship_gemini" not in content, \
            "Classes routes must not import from internship_gemini module"

    def test_internship_routes_do_not_import_classes_gemini(self):
        """Internship route files must not import ClassesGeminiService."""
        internship_route = BACKEND_ROOT / "api" / "internships" / "routes.py"
        content = internship_route.read_text(encoding="utf-8")
        assert "ClassesGeminiService" not in content, \
            "Internship routes must not import ClassesGeminiService"
        assert "classes_gemini" not in content, \
            "Internship routes must not import from classes_gemini module"

    def test_class_search_service_does_not_use_internship_gemini(self):
        """ClassSearchService must only import from classes_gemini."""
        svc = BACKEND_ROOT / "services" / "classes" / "class_search_service.py"
        content = svc.read_text(encoding="utf-8")
        assert "ClassesGeminiService" in content
        assert "InternshipGeminiService" not in content
        assert "internship_gemini" not in content

    def test_class_comparison_service_does_not_use_internship_gemini(self):
        """ClassComparisonService must only use ClassesGeminiService."""
        svc = BACKEND_ROOT / "services" / "classes" / "class_comparison_service.py"
        content = svc.read_text(encoding="utf-8")
        assert "ClassesGeminiService" in content
        assert "InternshipGeminiService" not in content

    def test_recommendation_service_does_not_use_classes_gemini(self):
        """RecommendationService must only use InternshipGeminiService."""
        svc = BACKEND_ROOT / "services" / "internships" / "recommendation_service.py"
        content = svc.read_text(encoding="utf-8")
        assert "InternshipGeminiService" in content
        assert "ClassesGeminiService" not in content
        assert "classes_gemini" not in content

    def test_live_search_service_does_not_use_classes_gemini(self):
        """LiveInternshipSearchService must only use InternshipGeminiService."""
        svc = BACKEND_ROOT / "services" / "internships" / "live_search_service.py"
        content = svc.read_text(encoding="utf-8")
        assert "InternshipGeminiService" in content
        assert "ClassesGeminiService" not in content

    def test_resume_routes_do_not_use_classes_gemini(self):
        """Resume analysis must only use InternshipGeminiService."""
        route = BACKEND_ROOT / "api" / "resume" / "routes.py"
        content = route.read_text(encoding="utf-8")
        assert "InternshipGeminiService" in content
        assert "ClassesGeminiService" not in content

    def test_config_has_separate_keys(self, app):
        """Both Gemini key configs exist and are separate in app config."""
        with app.app_context():
            from flask import current_app
            classes_key = current_app.config.get("CLASSES_GEMINI_API_KEY")
            internship_key = current_app.config.get("INTERNSHIP_GEMINI_API_KEY")
            assert classes_key is not None, "CLASSES_GEMINI_API_KEY must be configured"
            assert internship_key is not None, "INTERNSHIP_GEMINI_API_KEY must be configured"
            assert classes_key != internship_key, \
                "CLASSES_GEMINI_API_KEY and INTERNSHIP_GEMINI_API_KEY must be different values"

    def test_no_shared_gemini_client_exists(self):
        """There must be no generic/shared 'GeminiService' or 'gemini_client.py'."""
        gemini_dir = BACKEND_ROOT / "ai" / "gemini"
        files = list(gemini_dir.glob("*.py"))
        filenames = [f.name for f in files if f.name != "__init__.py"]
        assert "shared_gemini.py" not in filenames, "No shared Gemini client should exist"
        assert "gemini_client.py" not in filenames, "No generic Gemini client should exist"
        # Ensure ONLY the two isolated service files exist
        for fname in filenames:
            assert fname in ("classes_gemini.py", "internship_gemini.py"), \
                f"Unexpected Gemini file: {fname}"

    def test_no_deprecated_sdk_used(self):
        """Verify google-generativeai (deprecated) is not imported anywhere."""
        for py_file in BACKEND_ROOT.rglob("*.py"):
            content = py_file.read_text(encoding="utf-8", errors="ignore")
            assert "google.generativeai" not in content, \
                f"Deprecated google-generativeai imported in {py_file}"
            assert "import google.generativeai" not in content, \
                f"Deprecated google-generativeai imported in {py_file}"

    def test_correct_sdk_used(self):
        """Verify google-genai (current) SDK is used."""
        content = CLASSES_GEMINI_FILE.read_text()
        assert "from google import genai" in content or "from google.genai" in content, \
            "ClassesGeminiService must use google-genai SDK"

        content = INTERNSHIP_GEMINI_FILE.read_text()
        assert "from google import genai" in content or "from google.genai" in content, \
            "InternshipGeminiService must use google-genai SDK"
