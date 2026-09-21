"""
EngiPath AI — Internship Recommendation Service

Generates TWO completely separate recommendation lists:
1. skill_based_recommendations — from manually entered skills ONLY
2. resume_based_recommendations — from full resume profile + interests

Uses InternshipGeminiService ONLY.
"""
import logging
import uuid
from datetime import datetime, timezone

from ...ai.gemini.internship_gemini import InternshipGeminiService
from ...extensions import db
from ...models.candidate_profile import CandidateProfile
from ...models.resume_analysis import ResumeAnalysis

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Generates internship recommendations using InternshipGeminiService.

    Two completely separate outputs:
    - skill_based_recommendations: uses ONLY manually entered skills
    - resume_based_recommendations: uses full resume profile + interests
    """

    def generate_recommendations(
        self,
        branch: str,
        year: str,
        skills: list[str],
        interests: list[str],
        resume_analysis_id: str = None,
    ) -> dict:
        """
        Generate both recommendation lists.

        Args:
            branch: Engineering branch
            year: Current year
            skills: Manually entered skills (for skill-based list ONLY)
            interests: Areas of interest
            resume_analysis_id: Optional ID from resume analysis

        Returns:
            Dict with skill_based_recommendations and resume_based_recommendations.
        """
        # --- List 1: Skill-Based (manually entered skills ONLY) ---
        logger.info("RecommendationService: generating skill-based recommendations for skills=%r", skills)
        skill_based = InternshipGeminiService.generate_skill_based_recommendations(branch, year, skills)

        # --- List 2: Resume + Interest Based ---
        resume_based = []
        profile_used = None

        if resume_analysis_id:
            # Load the analyzed profile
            profile_data = self._load_profile(resume_analysis_id)
            if profile_data:
                profile_used = profile_data
                logger.info("RecommendationService: generating resume-based recommendations from profile")
                resume_based = InternshipGeminiService.generate_resume_based_recommendations(profile_data, interests)
            else:
                logger.warning("RecommendationService: resume_analysis_id %r not found", resume_analysis_id)
        else:
            # No resume provided — generate resume-based from user inputs as fallback
            fallback_profile = {
                "branch": branch,
                "year": year,
                "skills": [],
                "resume_skills": skills,  # use entered skills as "resume skills"
                "technologies": skills,
                "projects": [],
                "experience": [],
                "domains": [],
                "interests": interests,
                "education": [],
            }
            logger.info("RecommendationService: no resume — generating interest-based recommendations")
            resume_based = InternshipGeminiService.generate_resume_based_recommendations(fallback_profile, interests)

        return {
            "skill_based_recommendations": skill_based,
            "resume_based_recommendations": resume_based,
        }

    def _load_profile(self, analysis_id: str) -> dict | None:
        """Load candidate profile from a resume analysis record."""
        try:
            analysis = db.session.get(ResumeAnalysis, analysis_id)
            if not analysis:
                return None

            if analysis.candidate_profile_id:
                profile = db.session.get(CandidateProfile, analysis.candidate_profile_id)
                if profile:
                    return profile.to_dict()

            # Fallback: use embedded profile from analysis record
            if analysis.extracted_profile:
                return analysis.extracted_profile

            return None
        except Exception as exc:
            logger.error("Failed to load profile for analysis %r: %s", analysis_id, exc)
            return None
