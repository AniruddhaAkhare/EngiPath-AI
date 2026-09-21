"""
Tests: Class comparison — validates 2/3 class count enforcement
"""
import pytest
from unittest.mock import patch, MagicMock
import uuid


class TestComparisonValidation:
    """Count validation for class comparison."""

    def test_compare_with_zero_classes_returns_400(self, client):
        resp = client.post("/api/v1/classes/compare", json={"class_ids": []})
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False

    def test_compare_with_one_class_returns_400(self, client):
        resp = client.post("/api/v1/classes/compare", json={"class_ids": ["id1"]})
        assert resp.status_code == 400

    def test_compare_with_four_classes_returns_400(self, client):
        resp = client.post("/api/v1/classes/compare", json={"class_ids": ["id1", "id2", "id3", "id4"]})
        assert resp.status_code == 400

    def test_compare_with_duplicate_ids_returns_400(self, client):
        resp = client.post("/api/v1/classes/compare", json={"class_ids": ["id1", "id1"]})
        assert resp.status_code == 400

    def test_compare_with_two_classes_accepted(self, client):
        """Two valid class IDs — should be accepted (may fail at DB level in test)."""
        resp = client.post("/api/v1/classes/compare", json={"class_ids": ["id1", "id2"]})
        # Accepts 2 IDs at validation level — may fail with 404 (not found) but not 400
        assert resp.status_code != 400 or "VALIDATION" not in resp.get_json().get("error", {}).get("code", "")

    def test_compare_with_three_classes_accepted(self, client):
        """Three valid class IDs — should be accepted at validation level."""
        resp = client.post("/api/v1/classes/compare", json={"class_ids": ["id1", "id2", "id3"]})
        assert resp.status_code != 400 or "VALIDATION" not in resp.get_json().get("error", {}).get("code", "")

    def test_compare_missing_class_ids_returns_400(self, client):
        resp = client.post("/api/v1/classes/compare", json={})
        assert resp.status_code == 400


class TestComparisonService:
    """Test comparison service logic."""

    def test_compare_returns_not_found_for_missing_ids(self, app):
        with app.app_context():
            from app.services.classes.class_comparison_service import ClassComparisonService
            svc = ClassComparisonService()
            result = svc.compare(["nonexistent-1", "nonexistent-2"])
            assert result["success"] is False
            assert "NOT_FOUND" in result["error"]["code"]

    def test_compare_too_few_classes(self, app):
        with app.app_context():
            from app.services.classes.class_comparison_service import ClassComparisonService
            svc = ClassComparisonService()
            result = svc.compare(["only-one"])
            assert result["success"] is False

    def test_compare_too_many_classes(self, app):
        with app.app_context():
            from app.services.classes.class_comparison_service import ClassComparisonService
            svc = ClassComparisonService()
            result = svc.compare(["id1", "id2", "id3", "id4"])
            assert result["success"] is False

    def test_compare_uses_classes_gemini_only(self, app):
        """ClassComparisonService must use ClassesGeminiService, not InternshipGeminiService."""
        with app.app_context():
            from app.services.classes.class_comparison_service import ClassComparisonService
            # Verify at import level
            import inspect
            source = inspect.getsource(ClassComparisonService)
            assert "ClassesGeminiService" in source
            assert "InternshipGeminiService" not in source

    def test_compare_two_real_classes(self, app, db):
        """Test comparison with two actual DB records."""
        with app.app_context():
            from app.models.class_listing import ClassListing
            from app.services.classes.class_comparison_service import ClassComparisonService

            # Create two real listings
            id1, id2 = str(uuid.uuid4()), str(uuid.uuid4())
            c1 = ClassListing(id=id1, institute_name="Inst A", course_name="Python", fees=10000, mode="offline", city="Pune")
            c2 = ClassListing(id=id2, institute_name="Inst B", course_name="Python", fees=8000, mode="online", city="Mumbai")
            db.session.add_all([c1, c2])
            db.session.commit()

            # Mock Gemini
            with patch("app.services.classes.class_comparison_service.ClassesGeminiService.compare_classes") as mock_compare:
                mock_compare.return_value = {
                    "comparison_table": [{"attribute": "Fees", "values": ["₹10,000", "₹8,000"]}],
                    "best_value": "Inst B",
                    "best_curriculum": None,
                    "best_location": None,
                    "overall_recommendation": "Inst B offers better value",
                    "reasoning": "Lower fees with online flexibility",
                }
                svc = ClassComparisonService()
                result = svc.compare([id1, id2])

            assert result["success"] is True
            assert "comparison_table" in result["data"]
            assert result["data"]["best_value"] == "Inst B"

    def test_compare_three_real_classes(self, app, db):
        """Test comparison with three DB records."""
        with app.app_context():
            from app.models.class_listing import ClassListing
            from app.services.classes.class_comparison_service import ClassComparisonService

            ids = [str(uuid.uuid4()) for _ in range(3)]
            for i, cid in enumerate(ids):
                c = ClassListing(id=cid, institute_name=f"Inst {i}", course_name="ML", fees=float(10000 + i*2000))
                db.session.add(c)
            db.session.commit()

            with patch("app.services.classes.class_comparison_service.ClassesGeminiService.compare_classes") as mock_compare:
                mock_compare.return_value = {
                    "comparison_table": [],
                    "best_value": "Inst 0",
                    "overall_recommendation": "Inst 0 is cheapest",
                    "reasoning": "Lowest fee",
                }
                svc = ClassComparisonService()
                result = svc.compare(ids)

            assert result["success"] is True
            assert len(result["data"]["classes"]) == 3
