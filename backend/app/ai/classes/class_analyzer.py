"""
EngiPath AI — Class Analyzer

Uses ClassesGeminiService to analyze and rank discovered classes.
This module is used by ClassSearchService for post-extraction processing.
"""
from ..gemini.classes_gemini import ClassesGeminiService


class ClassAnalyzer:
    """
    Analyzes raw class data using ClassesGeminiService.
    Used internally by ClassSearchService.
    """

    @staticmethod
    def rank_by_confidence(classes: list[dict]) -> list[dict]:
        """Sort classes by confidence score, highest first."""
        return sorted(classes, key=lambda x: x.get("confidence") or 0.0, reverse=True)

    @staticmethod
    def filter_low_confidence(classes: list[dict], threshold: float = 0.3) -> list[dict]:
        """Remove classes with confidence below threshold."""
        return [c for c in classes if (c.get("confidence") or 0.5) >= threshold]
