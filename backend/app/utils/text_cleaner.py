"""
EngiPath AI — Text Cleaning Utilities
"""
import re
import unicodedata


def clean_text(text: str) -> str:
    """Normalize and clean extracted text."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def deduplicate_by_key(items: list[dict], *keys: str) -> list[dict]:
    """Remove duplicates from a list of dicts based on specified keys."""
    seen = set()
    unique = []
    for item in items:
        key = tuple((item.get(k) or "").lower().strip() for k in keys)
        if key not in seen and any(k for k in key):
            seen.add(key)
            unique.append(item)
    return unique


def truncate_text(text: str, max_chars: int = 500) -> str:
    """Truncate text to a maximum number of characters."""
    if not text or len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(" ", 1)[0] + "…"
