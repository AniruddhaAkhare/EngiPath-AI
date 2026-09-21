"""
EngiPath AI — Class Comparison Service

Fetches 2–3 class listings from the database and uses ClassesGeminiService
for AI-powered comparison analysis.

Validation:
- Exactly 2 or 3 class IDs required
- 0, 1, 4+ are rejected with proper error messages
"""
import logging
from typing import List

from ...ai.gemini.classes_gemini import ClassesGeminiService
from ...extensions import db
from ...models.class_listing import ClassListing
from ...models.class_comparison import ClassComparison

logger = logging.getLogger(__name__)


class ClassComparisonService:
    """Orchestrates AI-powered class comparison for 2–3 classes."""

    def compare(self, class_ids: List[str]) -> dict:
        """
        Compare 2–3 classes using AI analysis.

        Args:
            class_ids: List of exactly 2 or 3 class IDs

        Returns:
            Structured comparison dict or error dict.
        """
        # Validate count (also validated at schema level, but double-check here)
        count = len(class_ids)
        if count < 2:
            return {"success": False, "error": {"code": "TOO_FEW_CLASSES", "message": "At least 2 classes required for comparison."}}
        if count > 3:
            return {"success": False, "error": {"code": "TOO_MANY_CLASSES", "message": "At most 3 classes can be compared at once."}}

        # Fetch classes from DB
        classes = []
        missing_ids = []
        for cid in class_ids:
            listing = db.session.get(ClassListing, cid)
            if listing:
                classes.append(listing.to_dict())
            else:
                missing_ids.append(cid)

        if missing_ids:
            return {
                "success": False,
                "error": {
                    "code": "CLASS_NOT_FOUND",
                    "message": f"Class ID(s) not found: {', '.join(missing_ids)}. Run a search first.",
                },
            }

        if len(classes) < 2:
            return {"success": False, "error": {"code": "INSUFFICIENT_CLASSES", "message": "Could not retrieve enough class data."}}

        # AI comparison using CLASSES GEMINI ONLY
        logger.info("ClassComparisonService: comparing %d classes via ClassesGemini", len(classes))
        comparison_result = ClassesGeminiService.compare_classes(classes)

        if "error" in comparison_result:
            return {
                "success": False,
                "error": {"code": "COMPARISON_FAILED", "message": comparison_result["error"]},
            }

        # Persist comparison session
        comparison_id = self._save_comparison(class_ids, comparison_result)

        return {
            "success": True,
            "data": {
                "comparison_id": comparison_id,
                "classes": classes,
                **comparison_result,
            },
        }

    def _save_comparison(self, class_ids: list, result: dict) -> str:
        """Save comparison session to DB."""
        try:
            comparison = ClassComparison(
                class_ids=class_ids,
                comparison_table=result.get("comparison_table", []),
                best_value=result.get("best_value"),
                best_curriculum=result.get("best_curriculum"),
                best_location=result.get("best_location"),
                overall_recommendation=result.get("overall_recommendation"),
                reasoning=result.get("reasoning"),
                raw_ai_response=result,
            )
            db.session.add(comparison)
            db.session.commit()
            return comparison.id
        except Exception as exc:
            logger.error("Failed to save comparison: %s", exc)
            db.session.rollback()
            return "unsaved"
