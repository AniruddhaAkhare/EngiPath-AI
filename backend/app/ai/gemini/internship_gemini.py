"""
EngiPath AI — InternshipGeminiService

STRICTLY isolated to the Internship and Resume Analysis modules.
ONLY uses INTERNSHIP_GEMINI_API_KEY.
NEVER uses the classes key.

Any attempt to use this service from classes code
will be caught by test_gemini_separation.py.
"""
import logging
import json
from typing import Optional, Any

from google import genai
from google.genai import types
from flask import current_app

logger = logging.getLogger(__name__)

_INTERNSHIP_CLIENT: Optional[genai.Client] = None
_INTERNSHIP_MODEL: Optional[str] = None


def get_internship_client() -> tuple[genai.Client, str]:
    """
    Returns a Gemini client and model name for the Internship module.
    Raises RuntimeError if INTERNSHIP_GEMINI_API_KEY is not configured.
    """
    try:
        api_key = current_app.config.get("INTERNSHIP_GEMINI_API_KEY")
        model = current_app.config.get("INTERNSHIP_GEMINI_MODEL", "gemini-2.0-flash")

        if not api_key:
            raise RuntimeError(
                "INTERNSHIP_GEMINI_API_KEY is not configured. "
                "Set it in your .env file."
            )

        from flask import g
        if not hasattr(g, "_internship_gemini_client"):
            g._internship_gemini_client = genai.Client(api_key=api_key)
            logger.debug("InternshipGeminiService: new client initialized with model=%s", model)
        return g._internship_gemini_client, model

    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Failed to initialize InternshipGeminiService: {exc}") from exc


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


# Static fallback list — used when dynamic discovery fails
_INTERNSHIP_FALLBACK_MODELS = [
    "gemini-3.8-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-1.5-flash",
]


def _list_available_flash_models(client: genai.Client) -> list[str]:
    """Fetch the live list of available Gemini Flash models from the API."""
    try:
        models = client.models.list()
        names = []
        for m in models:
            name = getattr(m, "name", "") or ""
            short = name.replace("models/", "")
            # Only text-capable flash models — skip live, tts, cyber, imagen variants
            if (
                "flash" in short.lower()
                and not any(x in short.lower() for x in ("live", "tts", "cyber", "imagen", "audio"))
            ):
                names.append(short)
        if names:
            logger.debug("InternshipGemini: discovered models from API: %s", names)
            return names
    except Exception as exc:
        logger.debug("InternshipGemini: model discovery failed: %s", exc)
    return _INTERNSHIP_FALLBACK_MODELS


def _generate_with_fallback(
    client: genai.Client,
    preferred_model: str,
    prompt: str,
    temperature: float = 0.1,
) -> tuple[Optional[str], Optional[str]]:
    """
    Execute generation with multi-model fallback for Internship module.
    - Retries 503 (high demand) up to 2 times with backoff before moving on.
    - Falls back without thinking_config on 400 INVALID_ARGUMENT (lite models).
    - Dynamically discovers available models so the list stays current.
    """
    import time

    # Build ordered candidate list: preferred first, then discovered/static
    discovered = _list_available_flash_models(client)
    candidate_models = [preferred_model]
    for m in discovered:
        if m not in candidate_models:
            candidate_models.append(m)

    last_exc = None
    for model_name in candidate_models:
        # Try with thinking_config first, then without on 400
        configs_to_try = [
            types.GenerateContentConfig(
                temperature=temperature,
                response_mime_type="application/json",
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
            types.GenerateContentConfig(
                temperature=temperature,
                response_mime_type="application/json",
            ),
        ]

        for cfg_index, cfg in enumerate(configs_to_try):
            max_retries = 2  # for 503 transient errors
            for attempt in range(1, max_retries + 2):  # attempts: 1, 2, 3
                try:
                    logger.debug(
                        "InternshipGemini: model=%s cfg=%d attempt=%d",
                        model_name, cfg_index, attempt,
                    )
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=cfg,
                    )
                    raw = response.text
                    if raw and raw.strip():
                        return raw, model_name
                    break  # empty response — try next model

                except Exception as exc:
                    err_str = str(exc)
                    if "503" in err_str or "UNAVAILABLE" in err_str:
                        if attempt <= max_retries:
                            wait = attempt * 2
                            logger.warning(
                                "InternshipGemini: 503 on %s (attempt %d/%d), retrying in %ds",
                                model_name, attempt, max_retries + 1, wait,
                            )
                            time.sleep(wait)
                            continue
                        logger.warning("InternshipGemini model %s failed after retries: %s", model_name, exc)
                        last_exc = exc
                        break

                    elif "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                        # Extract retryDelay from error if available, else wait 30s
                        import re as _re
                        delay_match = _re.search(r"retryDelay.*?(\d+)s", err_str)
                        wait = int(delay_match.group(1)) if delay_match else 30
                        wait = min(wait, 35)  # cap at 35s to avoid blocking too long
                        if attempt <= max_retries:
                            logger.warning(
                                "InternshipGemini: 429 quota on %s, retrying in %ds",
                                model_name, wait,
                            )
                            time.sleep(wait)
                            continue
                        logger.warning("InternshipGemini model %s quota exhausted, skipping: %s", model_name, exc)
                        last_exc = exc
                        break

                    elif "400" in err_str or "INVALID_ARGUMENT" in err_str:
                        if cfg_index == 0:
                            logger.debug(
                                "InternshipGemini: %s rejects thinking_config (400), retrying without it",
                                model_name,
                            )
                            last_exc = exc
                            break  # break inner retry loop → try next cfg
                        # Still 400 even without thinking_config → skip model
                        logger.warning("InternshipGemini model %s unsupported: %s", model_name, exc)
                        last_exc = exc
                        break

                    else:
                        # 404, 401, etc. — skip model entirely
                        logger.warning("InternshipGemini model %s failed: %s; trying next fallback", model_name, exc)
                        last_exc = exc
                        break

    if last_exc:
        logger.error("InternshipGemini: all models failed. Last error: %s", last_exc)
    return None, None


class InternshipGeminiService:
    """
    Gemini service for the Internship and Resume Analysis modules ONLY.

    Responsibilities:
    - Extract candidate profile from resume text
    - Generate skill-based internship recommendations
    - Generate resume+interest-based internship recommendations
    - Extract live internship data from scraped content
    """

    @staticmethod
    def analyze_resume(
        resume_text: str,
        branch: str,
        year: str,
        skills: list[str],
        interests: list[str],
    ) -> dict:
        """
        Extract structured candidate profile from resume text.

        Args:
            resume_text: Plain text extracted from the resume file
            branch: Engineering branch from user input
            year: Current year from user input
            skills: Manually entered skills
            interests: Areas of interest

        Returns:
            Validated CandidateProfile dict
        """
        from ..prompts.internship_prompts import build_resume_analysis_prompt
        client, model = get_internship_client()

        prompt = build_resume_analysis_prompt(resume_text, branch, year, skills, interests)

        raw, _ = _generate_with_fallback(client, model, prompt, temperature=0.1)
        if not raw:
            return _empty_profile(branch, year, skills, interests)

        try:
            clean = _clean_json_text(raw)
            data = json.loads(clean)
            return _validate_candidate_profile(data, branch, year, skills, interests)

        except json.JSONDecodeError as exc:
            logger.error("InternshipGemini: resume analysis JSON error: %s (raw: %s)", exc, raw[:200])
            return _empty_profile(branch, year, skills, interests)
        except Exception as exc:
            logger.error("InternshipGemini analyze_resume error: %s", exc)
            return _empty_profile(branch, year, skills, interests)

    @staticmethod
    def generate_skill_based_recommendations(
        branch: str,
        year: str,
        skills: list[str],
    ) -> list[dict]:
        """
        Generate internship recommendations based ONLY on manually entered skills.
        Does NOT use resume data.

        Args:
            branch: Engineering branch
            year: Current year
            skills: Manually entered skills only

        Returns:
            List of recommendation dicts
        """
        from ..prompts.internship_prompts import build_skill_based_prompt
        client, model = get_internship_client()

        prompt = build_skill_based_prompt(branch, year, skills)

        raw, _ = _generate_with_fallback(client, model, prompt, temperature=0.3)
        if not raw:
            return []

        try:
            clean = _clean_json_text(raw)
            data = json.loads(clean)
            recs = data.get("recommendations", []) if isinstance(data, dict) else data
            return _validate_recommendation_list(recs)

        except json.JSONDecodeError as exc:
            logger.error("InternshipGemini: skill recs JSON error: %s (raw: %s)", exc, raw[:200])
            return []
        except Exception as exc:
            logger.error("InternshipGemini skill recs error: %s", exc)
            return []

    @staticmethod
    def generate_resume_based_recommendations(
        profile: dict,
        interests: list[str],
    ) -> list[dict]:
        """
        Generate internship recommendations based on the full resume profile + interests.
        Does NOT use manually entered skills directly (they come from the profile).

        Args:
            profile: CandidateProfile dict (from resume analysis)
            interests: Areas of interest from user input

        Returns:
            List of recommendation dicts (completely separate from skill-based)
        """
        from ..prompts.internship_prompts import build_resume_based_prompt
        client, model = get_internship_client()

        prompt = build_resume_based_prompt(profile, interests)

        raw, _ = _generate_with_fallback(client, model, prompt, temperature=0.3)
        if not raw:
            return []

        try:
            clean = _clean_json_text(raw)
            data = json.loads(clean)
            recs = data.get("recommendations", []) if isinstance(data, dict) else data
            return _validate_recommendation_list(recs)

        except json.JSONDecodeError as exc:
            logger.error("InternshipGemini: resume recs JSON error: %s (raw: %s)", exc, raw[:200])
            return []
        except Exception as exc:
            logger.error("InternshipGemini resume recs error: %s", exc)
            return []

    @staticmethod
    def extract_live_internships(scraped_content: str, context: dict) -> list[dict]:
        """
        Extract structured live internship data from scraped web content.

        Args:
            scraped_content: Combined text from scraped internship pages
            context: Search context (branch, skills, interests)

        Returns:
            List of live internship dicts
        """
        from ..prompts.internship_prompts import build_live_internship_extraction_prompt
        client, model = get_internship_client()

        prompt = build_live_internship_extraction_prompt(scraped_content, context)

        raw, _ = _generate_with_fallback(client, model, prompt, temperature=0.1)
        if not raw:
            return []

        try:
            clean = _clean_json_text(raw)
            data = json.loads(clean)
            internships = data.get("internships", []) if isinstance(data, dict) else data
            return _validate_live_internship_list(internships)

        except json.JSONDecodeError as exc:
            logger.error("InternshipGemini: live internship JSON error: %s (raw: %s)", exc, raw[:200])
            return []
        except Exception as exc:
            logger.error("InternshipGemini live internships error: %s", exc)
            return []


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _validate_candidate_profile(data: Any, branch: str, year: str, skills: list, interests: list) -> dict:
    if not isinstance(data, dict):
        return _empty_profile(branch, year, skills, interests)
    return {
        "branch": data.get("branch") or branch,
        "year": data.get("year") or year,
        "skills": _ensure_list(data.get("skills")) or skills,
        "resume_skills": _ensure_list(data.get("resume_skills")),
        "technologies": _ensure_list(data.get("technologies")),
        "projects": _ensure_list_of_dicts(data.get("projects")),
        "experience": _ensure_list_of_dicts(data.get("experience")),
        "domains": _ensure_list(data.get("domains")),
        "interests": _ensure_list(data.get("interests")) or interests,
        "education": _ensure_list_of_dicts(data.get("education")),
    }


def _empty_profile(branch: str, year: str, skills: list, interests: list) -> dict:
    return {
        "branch": branch,
        "year": year,
        "skills": skills,
        "resume_skills": [],
        "technologies": [],
        "projects": [],
        "experience": [],
        "domains": [],
        "interests": interests,
        "education": [],
    }


def _validate_recommendation_list(recs: Any) -> list[dict]:
    if not isinstance(recs, list):
        return []
    valid = []
    for item in recs:
        if not isinstance(item, dict):
            continue
        if not item.get("role"):
            continue
        valid.append({
            "role": str(item.get("role", "")).strip(),
            "company": item.get("company") or None,
            "skills_needed": _ensure_list(item.get("skills_needed")),
            "what_you_can_achieve": _ensure_list(item.get("what_you_can_achieve")),
            "why_recommended": item.get("why_recommended") or None,
            "match_score": _parse_float(item.get("match_score")),
            "location": item.get("location") or None,
            "mode": item.get("mode") or None,
            "eligibility": item.get("eligibility") or None,
            "duration": item.get("duration") or None,
            "stipend": item.get("stipend") or None,
            "source_url": item.get("source_url") or None,
            "application_url": item.get("application_url") or None,
        })
    return valid


def _validate_live_internship_list(internships: Any) -> list[dict]:
    if not isinstance(internships, list):
        return []
    valid = []
    for item in internships:
        if not isinstance(item, dict):
            continue
        if not item.get("company") or not item.get("role"):
            continue
        valid.append({
            "company": str(item.get("company", "")).strip(),
            "role": str(item.get("role", "")).strip(),
            "location": item.get("location") or None,
            "mode": item.get("mode") or None,
            "skills": _ensure_list(item.get("skills")),
            "eligibility": item.get("eligibility") or None,
            "duration": item.get("duration") or None,
            "stipend": item.get("stipend") or None,
            "deadline": item.get("deadline") or None,
            "description": item.get("description") or None,
            "source_name": item.get("source_name") or None,
            "source_url": item.get("source_url") or None,
            "application_url": item.get("application_url") or None,
        })
    return valid


def _parse_float(v: Any) -> Optional[float]:
    if v is None:
        return None
    try:
        return float(v)
    except (ValueError, TypeError):
        return None


def _ensure_list(v: Any) -> list:
    if isinstance(v, list):
        return [str(i) for i in v if i is not None]
    if isinstance(v, str) and v.strip():
        return [v.strip()]
    return []


def _ensure_list_of_dicts(v: Any) -> list:
    if isinstance(v, list):
        return [i for i in v if isinstance(i, dict)]
    return []
