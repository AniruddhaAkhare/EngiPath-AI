"""
EngiPath AI — ClassesGeminiService

STRICTLY isolated to the Classes module.
ONLY uses CLASSES_GEMINI_API_KEY.
NEVER uses the internship key.

Any attempt to use this service from internship/resume code
will be caught by test_gemini_separation.py.
"""
import logging
import json
from typing import Optional, Any

from google import genai
from google.genai import types
from flask import current_app

logger = logging.getLogger(__name__)

_CLASSES_CLIENT: Optional[genai.Client] = None
_CLASSES_MODEL: Optional[str] = None


def get_classes_client() -> tuple[genai.Client, str]:
    """
    Returns a Gemini client and model name for the Classes module.
    Raises RuntimeError if CLASSES_GEMINI_API_KEY is not configured.
    """
    try:
        api_key = current_app.config.get("CLASSES_GEMINI_API_KEY")
        model = current_app.config.get("CLASSES_GEMINI_MODEL", "gemini-2.0-flash")

        if not api_key:
            raise RuntimeError(
                "CLASSES_GEMINI_API_KEY is not configured. "
                "Set it in your .env file."
            )

        # Use g to cache client per request/context
        from flask import g
        if not hasattr(g, "_classes_gemini_client"):
            g._classes_gemini_client = genai.Client(api_key=api_key)
            logger.debug("ClassesGeminiService: new client initialized with model=%s", model)
        return g._classes_gemini_client, model

    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Failed to initialize ClassesGeminiService: {exc}") from exc


def _clean_json_text(text: str) -> str:
    """Strip markdown fences and leading/trailing whitespace."""
    if not text:
        return ""
    clean = text.strip()
    if clean.startswith("```"):
        lines = clean.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        clean = "\n".join(lines).strip()
    return clean


def _generate_with_fallback(
    client: genai.Client,
    preferred_model: str,
    prompt: str,
    temperature: float = 0.1,
) -> tuple[Optional[str], Optional[str]]:
    """
    Execute generation with multi-model fallback.
    Tries preferred_model first, then supported fallback models.
    """
    candidate_models = [preferred_model]
    for m in ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"]:
        if m not in candidate_models:
            candidate_models.append(m)

    last_exc = None
    for model_name in candidate_models:
        try:
            logger.debug("ClassesGemini: generating with model=%s", model_name)
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    response_mime_type="application/json",
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
            )
            raw = response.text
            if raw and raw.strip():
                return raw, model_name
        except Exception as exc:
            logger.warning("ClassesGemini model %s failed: %s; trying next fallback", model_name, exc)
            last_exc = exc
            continue

    if last_exc:
        logger.error("ClassesGemini: all models failed. Last error: %s", last_exc)
    return None, None


class ClassesGeminiService:
    """
    Gemini service for the Classes module ONLY.

    Responsibilities:
    - Extract structured class data from scraped web content
    - Normalize and rank class results
    - Generate AI-powered class comparison analysis
    """

    @staticmethod
    def extract_classes(scraped_content: str, course: str, location: str) -> list[dict]:
        """
        Use Gemini to extract structured class listings from raw scraped text.

        Args:
            scraped_content: Combined text from scraped web pages
            course: The course searched for
            location: The location searched for

        Returns:
            List of structured class dicts (validated against expected schema)
        """
        from ..prompts.class_prompts import build_extraction_prompt
        client, model = get_classes_client()

        prompt = build_extraction_prompt(scraped_content, course, location)

        raw, _ = _generate_with_fallback(client, model, prompt, temperature=0.1)
        if not raw:
            return []

        try:
            clean = _clean_json_text(raw)
            data = json.loads(clean)

            # Validate structure
            if isinstance(data, dict) and "classes" in data:
                classes = data["classes"]
            elif isinstance(data, list):
                classes = data
            else:
                logger.warning("Unexpected Gemini response structure: %s", type(data))
                classes = []

            return _validate_class_list(classes)

        except json.JSONDecodeError as exc:
            logger.error("ClassesGemini: JSON decode error: %s (raw text: %s)", exc, raw[:200])
            return []
        except Exception as exc:
            logger.error("ClassesGemini extract_classes error: %s", exc)
            return []

    @staticmethod
    def compare_classes(classes_data: list[dict]) -> dict:
        """
        Generate an AI-powered comparison of 2–3 classes.

        Args:
            classes_data: List of 2 or 3 class dicts from the database

        Returns:
            Structured comparison dict with table, recommendations, reasoning
        """
        from ..prompts.class_prompts import build_comparison_prompt
        client, model = get_classes_client()

        prompt = build_comparison_prompt(classes_data)

        raw, _ = _generate_with_fallback(client, model, prompt, temperature=0.2)
        if not raw:
            return {"error": "Failed to generate AI comparison across available models"}

        try:
            clean = _clean_json_text(raw)
            result = json.loads(clean)
            return _validate_comparison_result(result)

        except json.JSONDecodeError as exc:
            logger.error("ClassesGemini: comparison JSON decode error: %s", exc)
            return {"error": "Failed to parse AI comparison response"}
        except Exception as exc:
            logger.error("ClassesGemini compare_classes error: %s", exc)
            return {"error": str(exc)}


def _validate_class_list(classes: Any) -> list[dict]:
    """Ensure extracted class data has the minimum required structure."""
    if not isinstance(classes, list):
        return []

    valid = []
    for item in classes:
        if not isinstance(item, dict):
            continue
        if not item.get("institute_name") or not item.get("course_name"):
            continue

        # Normalize fields to expected types
        normalized = {
            "institute_name": str(item.get("institute_name", "")).strip() or None,
            "course_name": str(item.get("course_name", "")).strip() or None,
            "address": item.get("address") or None,
            "city": item.get("city") or None,
            "state": item.get("state") or None,
            "country": item.get("country") or None,
            "fees": _parse_float(item.get("fees")),
            "currency": item.get("currency") or "INR",
            "duration": _parse_float(item.get("duration")),
            "duration_unit": item.get("duration_unit") or None,
            "mode": item.get("mode") or None,
            "description": item.get("description") or None,
            "topics": _ensure_list(item.get("topics")),
            "skills": _ensure_list(item.get("skills")),
            "website_url": item.get("website_url") or None,
            "contact": item.get("contact") or None,
            "source_name": item.get("source_name") or None,
            "source_url": item.get("source_url") or None,
            "confidence": _parse_float(item.get("confidence")),
        }
        if normalized["institute_name"] and normalized["course_name"]:
            valid.append(normalized)

    return valid


def _validate_comparison_result(result: Any) -> dict:
    """Ensure comparison result has the expected structure."""
    if not isinstance(result, dict):
        return {"error": "Invalid comparison structure"}

    return {
        "comparison_table": result.get("comparison_table", []),
        "best_value": result.get("best_value"),
        "best_curriculum": result.get("best_curriculum"),
        "best_location": result.get("best_location"),
        "overall_recommendation": result.get("overall_recommendation"),
        "reasoning": result.get("reasoning"),
    }


def _parse_float(v: Any) -> Optional[float]:
    """Safely parse a value to float."""
    if v is None:
        return None
    try:
        return float(v)
    except (ValueError, TypeError):
        return None


def _ensure_list(v: Any) -> list:
    """Ensure value is a list."""
    if isinstance(v, list):
        return [str(i) for i in v if i is not None]
    if isinstance(v, str) and v.strip():
        return [v.strip()]
    return []
