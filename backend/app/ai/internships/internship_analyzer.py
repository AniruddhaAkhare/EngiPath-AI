"""
EngiPath AI — Internship Analyzer

Uses InternshipGeminiService for internship extraction and analysis.
"""
from ..gemini.internship_gemini import InternshipGeminiService


class InternshipAnalyzer:
    """
    Analyzes raw internship data using InternshipGeminiService.
    """

    @staticmethod
    def filter_by_branch(internships: list[dict], branch: str) -> list[dict]:
        """Filter internships by relevance to the engineering branch."""
        if not branch:
            return internships
        branch_lower = branch.lower()
        relevant = []
        for item in internships:
            role = (item.get("role") or "").lower()
            skills = " ".join(item.get("skills") or []).lower()
            desc = (item.get("description") or "").lower()
            if branch_lower in role or branch_lower in skills or branch_lower in desc:
                relevant.append(item)
        return relevant or internships  # fallback to all if nothing matches
