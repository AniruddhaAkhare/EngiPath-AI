"""
EngiPath AI — URL & File Validators

Security utilities for input validation and SSRF prevention.
"""
import re
from urllib.parse import urlparse
from typing import Tuple


ALLOWED_URL_SCHEMES = {"http", "https"}

# Reject obviously fake/placeholder URLs
_FAKE_URL_PATTERNS = [
    re.compile(r"example\.(com|org|net)", re.IGNORECASE),
    re.compile(r"placeholder", re.IGNORECASE),
    re.compile(r"localhost", re.IGNORECASE),
    re.compile(r"127\.0\.0\.1"),
    re.compile(r"test\.(com|org)", re.IGNORECASE),
]


def is_valid_url(url: str) -> bool:
    """Return True if URL is a valid, non-fake, non-private HTTP/HTTPS URL."""
    if not url or not isinstance(url, str):
        return False
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ALLOWED_URL_SCHEMES:
            return False
        if not parsed.netloc:
            return False
        for pattern in _FAKE_URL_PATTERNS:
            if pattern.search(url):
                return False
        return True
    except Exception:
        return False


def sanitize_url(url: str) -> str | None:
    """Return a cleaned URL or None if invalid."""
    if not is_valid_url(url):
        return None
    return url.strip()


def validate_file_extension(filename: str, allowed: set[str]) -> Tuple[bool, str]:
    """
    Validate file extension.
    Returns (is_valid, extension).
    """
    if not filename or "." not in filename:
        return False, ""
    ext = filename.rsplit(".", 1)[-1].lower()
    return ext in allowed, ext
