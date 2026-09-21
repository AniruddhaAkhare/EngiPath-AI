"""
Tests: Class search, validation, and pipeline
"""
import pytest
from unittest.mock import patch, MagicMock


class TestClassSearchValidation:
    """Input validation for class search."""

    def test_missing_course_returns_400(self, client):
        resp = client.post("/api/v1/classes/search", json={"location": "Pune"})
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "VALIDATION_ERROR" in data["error"]["code"]

    def test_missing_location_returns_400(self, client):
        resp = client.post("/api/v1/classes/search", json={"course": "Python"})
        assert resp.status_code == 400

    def test_empty_course_returns_400(self, client):
        resp = client.post("/api/v1/classes/search", json={"course": "   ", "location": "Pune"})
        assert resp.status_code == 400

    def test_empty_body_returns_400(self, client):
        resp = client.post("/api/v1/classes/search", json={})
        assert resp.status_code == 400

    def test_no_json_returns_400(self, client):
        resp = client.post("/api/v1/classes/search", data="not json")
        assert resp.status_code == 400


class TestClassSearchPipeline:
    """Test the class search pipeline with mocked external services."""

    @patch("app.services.classes.class_search_service.WebSearchService")
    @patch("app.services.classes.class_search_service.PageScraperService")
    @patch("app.services.classes.class_search_service.ClassesGeminiService")
    @patch("app.services.classes.class_search_service.GeocodingService")
    def test_search_returns_success_structure(
        self, mock_geo, mock_gemini, mock_scraper, mock_search, client
    ):
        # Mock web search
        mock_search_instance = MagicMock()
        mock_search_instance.search_classes.return_value = [
            MagicMock(url="https://example.com", title="Test", snippet="Test snippet")
        ]
        mock_search.return_value = mock_search_instance

        # Mock scraper
        mock_scraper_instance = MagicMock()
        mock_scraper_instance.scrape_batch.return_value = "Sample institute content Python course Pune fees 15000"
        mock_scraper.return_value = mock_scraper_instance

        # Mock Gemini
        mock_gemini.extract_classes.return_value = [
            {
                "institute_name": "Test Institute",
                "course_name": "Python Programming",
                "city": "Pune",
                "fees": 15000.0,
                "currency": "INR",
                "mode": "offline",
                "source_url": "https://example.com",
            }
        ]

        # Mock geocoder
        mock_geo_instance = MagicMock()
        mock_geo_instance.geocode_class_listing.return_value = (18.52, 73.85, "https://maps.google.com/?q=18.52,73.85")
        mock_geo.return_value = mock_geo_instance

        resp = client.post("/api/v1/classes/search", json={"course": "Python", "location": "Pune"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "data" in data
        assert "meta" in data
        assert isinstance(data["data"], list)

    def test_get_class_not_found(self, client):
        resp = client.get("/api/v1/classes/nonexistent-id-12345")
        assert resp.status_code == 404
        data = resp.get_json()
        assert data["success"] is False

    def test_search_meta_contains_course_and_location(self, client):
        """Meta must reflect the actual user query."""
        with patch("app.services.classes.class_search_service.ClassSearchService.search") as mock:
            mock.return_value = {
                "success": True,
                "data": [],
                "meta": {"course": "AI", "location": "Mumbai", "total_results": 0, "status": "no_results"}
            }
            resp = client.post("/api/v1/classes/search", json={"course": "AI", "location": "Mumbai"})
            assert resp.status_code == 200
            data = resp.get_json()
            assert data["meta"]["course"] == "AI"
            assert data["meta"]["location"] == "Mumbai"


class TestClassDeduplication:
    """Test deduplication logic."""

    def test_deduplicate_removes_exact_duplicates(self, app):
        with app.app_context():
            from app.services.classes.class_search_service import ClassSearchService
            from unittest.mock import MagicMock
            # Instantiate with mocked config
            with patch("app.services.classes.class_search_service.WebSearchService"), \
                 patch("app.services.classes.class_search_service.PageScraperService"), \
                 patch("app.services.classes.class_search_service.GeocodingService"):
                svc = ClassSearchService()
                classes = [
                    {"institute_name": "Institute A", "course_name": "Python"},
                    {"institute_name": "Institute A", "course_name": "Python"},  # duplicate
                    {"institute_name": "Institute B", "course_name": "Python"},
                ]
                result = svc._deduplicate(classes)
                assert len(result) == 2

    def test_deduplicate_case_insensitive(self, app):
        with app.app_context():
            from app.services.classes.class_search_service import ClassSearchService
            with patch("app.services.classes.class_search_service.WebSearchService"), \
                 patch("app.services.classes.class_search_service.PageScraperService"), \
                 patch("app.services.classes.class_search_service.GeocodingService"):
                svc = ClassSearchService()
                classes = [
                    {"institute_name": "INSTITUTE A", "course_name": "python"},
                    {"institute_name": "institute a", "course_name": "PYTHON"},
                ]
                result = svc._deduplicate(classes)
                assert len(result) == 1
