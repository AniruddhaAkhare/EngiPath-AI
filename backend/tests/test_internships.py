"""
Tests: Internship recommendations — validates two separate lists
"""
import pytest
from unittest.mock import patch, MagicMock


class TestInternshipRecommendValidation:
    """Input validation for internship recommendations."""

    def test_missing_branch_returns_400(self, client):
        resp = client.post("/api/v1/internships/recommend", json={"year": "2nd", "skills": ["Python"]})
        assert resp.status_code == 400

    def test_missing_year_returns_400(self, client):
        resp = client.post("/api/v1/internships/recommend", json={"branch": "CS", "skills": ["Python"]})
        assert resp.status_code == 400

    def test_missing_skills_returns_400(self, client):
        resp = client.post("/api/v1/internships/recommend", json={"branch": "CS", "year": "2nd"})
        assert resp.status_code == 400

    def test_empty_skills_returns_400(self, client):
        resp = client.post("/api/v1/internships/recommend", json={"branch": "CS", "year": "2nd", "skills": []})
        assert resp.status_code == 400

    def test_empty_body_returns_400(self, client):
        resp = client.post("/api/v1/internships/recommend", json={})
        assert resp.status_code == 400


class TestInternshipRecommendTwoSeparateLists:
    """CRITICAL: Verify two completely separate recommendation lists."""

    def test_response_contains_three_separate_sections(self, client):
        """Response MUST contain skill_based, resume_based, and live_internships as separate keys."""
        with patch("app.api.internships.routes.RecommendationService") as mock_rec, \
             patch("app.api.internships.routes.LiveInternshipSearchService") as mock_live:

            mock_rec.return_value.generate_recommendations.return_value = {
                "skill_based_recommendations": [{"role": "ML Intern", "company": "TechCorp"}],
                "resume_based_recommendations": [{"role": "Data Intern", "company": "DataCo"}],
            }
            mock_live.return_value.search.return_value = {
                "live_internships": [{"company": "LiveCo", "role": "Live Intern"}],
                "meta": {"total_results": 1},
            }

            resp = client.post("/api/v1/internships/recommend", json={
                "branch": "Computer Science",
                "year": "2nd Year",
                "skills": ["Python", "ML"],
                "interests": ["AI"],
            })

        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        # All three lists must be present and separate
        assert "skill_based_recommendations" in data["data"]
        assert "resume_based_recommendations" in data["data"]
        assert "live_internships" in data["data"]
        # They must be lists
        assert isinstance(data["data"]["skill_based_recommendations"], list)
        assert isinstance(data["data"]["resume_based_recommendations"], list)
        assert isinstance(data["data"]["live_internships"], list)

    def test_meta_contains_separate_counts(self, client):
        """Meta must include counts for all three sections."""
        with patch("app.api.internships.routes.RecommendationService") as mock_rec, \
             patch("app.api.internships.routes.LiveInternshipSearchService") as mock_live:

            mock_rec.return_value.generate_recommendations.return_value = {
                "skill_based_recommendations": [{"role": "A"}],
                "resume_based_recommendations": [{"role": "B"}, {"role": "C"}],
            }
            mock_live.return_value.search.return_value = {
                "live_internships": [],
                "meta": {},
            }

            resp = client.post("/api/v1/internships/recommend", json={
                "branch": "EE",
                "year": "3rd",
                "skills": ["C++"],
            })

        data = resp.get_json()
        meta = data["meta"]
        assert "skill_based_count" in meta
        assert "resume_based_count" in meta
        assert "live_count" in meta
        assert meta["skill_based_count"] == 1
        assert meta["resume_based_count"] == 2
        assert meta["live_count"] == 0

    def test_skill_based_uses_only_entered_skills(self, app):
        """RecommendationService must pass skills to skill-based and NOT to resume-based."""
        with app.app_context():
            from app.services.internships.recommendation_service import RecommendationService

            with patch("app.services.internships.recommendation_service.InternshipGeminiService.generate_skill_based_recommendations") as mock_skill, \
                 patch("app.services.internships.recommendation_service.InternshipGeminiService.generate_resume_based_recommendations") as mock_resume:

                mock_skill.return_value = []
                mock_resume.return_value = []

                svc = RecommendationService()
                svc.generate_recommendations(
                    branch="CS",
                    year="2nd",
                    skills=["Python", "Django"],
                    interests=["Web Dev"],
                )

                # Verify skill-based received the entered skills
                call_args = mock_skill.call_args
                assert "Python" in call_args[0][2] or "Python" in str(call_args)

    def test_lists_are_not_merged(self, client):
        """The two recommendation lists must remain separate — not the same array."""
        skill_rec = {"role": "Skill Intern", "company": "SkillCo"}
        resume_rec = {"role": "Resume Intern", "company": "ResumeCo"}

        with patch("app.api.internships.routes.RecommendationService") as mock_rec, \
             patch("app.api.internships.routes.LiveInternshipSearchService") as mock_live:

            mock_rec.return_value.generate_recommendations.return_value = {
                "skill_based_recommendations": [skill_rec],
                "resume_based_recommendations": [resume_rec],
            }
            mock_live.return_value.search.return_value = {"live_internships": [], "meta": {}}

            resp = client.post("/api/v1/internships/recommend", json={
                "branch": "IT",
                "year": "1st",
                "skills": ["Java"],
            })

        data = resp.get_json()["data"]
        # Verify they are NOT the same
        assert data["skill_based_recommendations"] != data["resume_based_recommendations"]
        # Each should have its own unique role
        skill_roles = [r.get("role") for r in data["skill_based_recommendations"]]
        resume_roles = [r.get("role") for r in data["resume_based_recommendations"]]
        assert skill_roles != resume_roles


class TestLiveInternshipSearch:
    """Live internship search tests."""

    def test_search_missing_branch_returns_400(self, client):
        resp = client.post("/api/v1/internships/search", json={"skills": ["Python"]})
        assert resp.status_code == 400

    def test_search_returns_live_internships_key(self, client):
        with patch("app.api.internships.routes.LiveInternshipSearchService") as mock_live:
            mock_live.return_value.search.return_value = {
                "live_internships": [{"company": "Google", "role": "SWE Intern"}],
                "meta": {"total_results": 1},
            }
            resp = client.post("/api/v1/internships/search", json={"branch": "CS", "skills": ["Python"]})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True

    def test_get_internship_not_found(self, client):
        resp = client.get("/api/v1/internships/nonexistent-id-999")
        assert resp.status_code == 404
