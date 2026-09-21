"""
EngiPath AI — Request Logger Middleware

Structured logging for all API requests.
NEVER logs: API keys, resume contents, or sensitive PII.
"""
import time
import logging
from flask import request, g

logger = logging.getLogger("engipath.requests")


def log_request_start():
    """Log the start of each request."""
    g.start_time = time.monotonic()
    # Sanitize — never log Authorization headers or API keys
    safe_headers = {
        k: v for k, v in request.headers.items()
        if k.lower() not in ("authorization", "x-api-key", "cookie")
    }
    logger.debug(
        "REQUEST %s %s from %s",
        request.method,
        request.path,
        request.remote_addr,
    )


def log_request_end(response):
    """Log the completion of each request."""
    duration_ms = (time.monotonic() - getattr(g, "start_time", time.monotonic())) * 1000
    logger.info(
        "RESPONSE %s %s → %d (%.0fms)",
        request.method,
        request.path,
        response.status_code,
        duration_ms,
    )
    return response
