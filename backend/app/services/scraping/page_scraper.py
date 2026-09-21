"""
EngiPath AI — Page Scraper Service

Retrieves and extracts text content from web pages.
Uses trafilatura for main content extraction with BeautifulSoup fallback.
Implements SSRF protection, timeouts, retries, and graceful failure.
"""
import logging
import re
import time
import ipaddress
from urllib.parse import urlparse
from typing import Optional

import httpx
import trafilatura
from bs4 import BeautifulSoup
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

logger = logging.getLogger(__name__)

# SSRF — blocked IP ranges
_BLOCKED_PRIVATE_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),  # link-local
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]

# Domains to skip (login-walled, irrelevant, etc.)
_SKIP_DOMAINS = {
    "facebook.com", "twitter.com", "x.com", "instagram.com",
    "youtube.com", "youtu.be", "tiktok.com", "pinterest.com",
    "whatsapp.com", "telegram.org",
}

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; EngiPathAI/1.0; +https://engipath.ai)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


class PageScraperService:
    """
    Retrieves web page content and extracts clean text.

    Features:
    - SSRF protection (blocks private IP ranges)
    - Domain filtering
    - Timeout enforcement
    - Retry with exponential backoff
    - Multi-method content extraction (trafilatura → BeautifulSoup)
    - Graceful failure (one page failure does not stop the search)
    """

    def __init__(self, timeout: int = 6, max_retries: int = 1):
        self.timeout = timeout
        self.max_retries = max_retries

    def scrape_batch(
        self,
        urls: list[str],
        max_pages: int = 6,
        delay_between: float = 0.0,
    ) -> str:
        """
        Scrape multiple URLs concurrently and combine their text content.

        Args:
            urls: List of URLs to scrape
            max_pages: Maximum number of pages to process
            delay_between: Legacy compatibility parameter

        Returns:
            Combined cleaned text from all successfully scraped pages.
        """
        target_urls = urls[:max_pages]
        if not target_urls:
            return ""

        # Validate URLs and skip invalid ones before worker dispatch
        valid_urls = []
        for url in target_urls:
            try:
                _validate_url(url)
                valid_urls.append(url)
            except SSRFError as exc:
                logger.warning("SSRF block for %r: %s", url, exc)
            except SkippedDomainError:
                logger.debug("Skipping domain: %s", url)
            except Exception as exc:
                logger.warning("Invalid URL %r: %s", url, exc)

        if not valid_urls:
            return ""

        def _worker(u: str) -> tuple[str, Optional[str]]:
            try:
                content = self.scrape_page(u)
                return u, content
            except Exception as exc:
                logger.warning("Failed worker scrape for %r: %s", u, exc)
                return u, None

        combined_parts = []
        processed = 0

        # Concurrent scraping using ThreadPoolExecutor
        workers = min(len(valid_urls), 6)
        from concurrent.futures import ThreadPoolExecutor, as_completed

        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_url = {executor.submit(_worker, u): u for u in valid_urls}
            for future in as_completed(future_to_url):
                try:
                    u, text = future.result()
                    if text and len(text.strip()) > 20:
                        source_header = f"\n\n=== SOURCE: {u} ===\n"
                        combined_parts.append(source_header + text)
                        processed += 1
                        logger.debug("Scraped %s (%d chars)", u, len(text))
                except Exception as exc:
                    logger.warning("Error collecting scrape result: %s", exc)

        logger.info("PageScraperService: scraped %d/%d pages concurrently", processed, len(target_urls))
        return "\n".join(combined_parts)

    def scrape_page(self, url: str) -> Optional[str]:
        """
        Retrieve and extract text from a single web page.

        Args:
            url: A validated, public HTTP/HTTPS URL

        Returns:
            Clean text content or None if extraction failed.
        """
        try:
            html = self._fetch_html(url)
            if not html:
                return None

            # Try trafilatura first (best main content extraction)
            text = trafilatura.extract(html, include_links=False, include_images=False)
            if text and len(text.strip()) > 100:
                return _clean_text(text)

            # Fallback: BeautifulSoup extraction
            text = _extract_with_bs4(html)
            return _clean_text(text) if text else None
        except Exception as exc:
            logger.warning("Failed to scrape %s: %s", url, exc)
            return None

    def _fetch_html(self, url: str) -> Optional[str]:
        """Fetch raw HTML from a URL with timeout and redirect following."""
        attempts = 0
        max_attempts = max(1, self.max_retries)
        while attempts < max_attempts:
            attempts += 1
            try:
                with httpx.Client(
                    timeout=self.timeout,
                    follow_redirects=True,
                    headers=DEFAULT_HEADERS,
                ) as client:
                    response = client.get(url)

                    if response.status_code == 200:
                        content_type = response.headers.get("content-type", "")
                        if "html" not in content_type and "text" not in content_type:
                            logger.debug("Non-HTML content type at %s: %s", url, content_type)
                            return None
                        return response.text
                    elif response.status_code in (403, 401, 404):
                        logger.debug("HTTP status %d at %s", response.status_code, url)
                        return None
                    else:
                        logger.debug("HTTP %d at %s", response.status_code, url)
                        return None

            except (httpx.TimeoutException, httpx.ConnectError) as exc:
                if attempts < max_attempts:
                    logger.debug("Retrying %s after error: %s", url, exc)
                    time.sleep(0.3)
                    continue
                logger.warning("Scraper timeout/connect error for %s: %s", url, exc)
                return None
            except Exception as exc:
                logger.debug("HTTP error at %s: %s", url, exc)
                return None
        return None


# ---------------------------------------------------------------------------
# URL Validation (SSRF Protection)
# ---------------------------------------------------------------------------

class SSRFError(Exception):
    pass

class SkippedDomainError(Exception):
    pass


def _validate_url(url: str) -> None:
    """
    Validate a URL is safe to fetch.
    Raises SSRFError for private/internal IP addresses.
    Raises SkippedDomainError for known irrelevant domains.
    """
    if not url or not isinstance(url, str):
        raise ValueError("Invalid URL")

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise SSRFError(f"Unsupported scheme: {parsed.scheme}")

    hostname = parsed.hostname
    if not hostname:
        raise SSRFError("No hostname in URL")

    # Check for localhost / loopback hostnames
    lowered_host = hostname.lower()
    if lowered_host in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "ip6-localhost", "ip6-loopback") or lowered_host.endswith(".local") or lowered_host.endswith(".internal"):
        raise SSRFError(f"Blocked private/loopback hostname: {hostname}")

    # Check for blocked domains
    for domain in _SKIP_DOMAINS:
        if hostname.endswith(domain):
            raise SkippedDomainError(f"Skipping domain: {hostname}")

    # Check for private/loopback IPs
    try:
        ip = ipaddress.ip_address(hostname)
        for blocked in _BLOCKED_PRIVATE_RANGES:
            if ip in blocked:
                raise SSRFError(f"Blocked private IP range: {hostname}")
    except ValueError:
        pass  # Not an IP address — hostname, which is fine


# ---------------------------------------------------------------------------
# Content Extraction Helpers
# ---------------------------------------------------------------------------

def _extract_with_bs4(html: str) -> Optional[str]:
    """BeautifulSoup fallback content extraction."""
    try:
        soup = BeautifulSoup(html, "lxml")

        # Remove non-content elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
            tag.decompose()

        # Try to find main content area
        for selector in ["main", "article", ".content", "#content", ".main", "#main"]:
            element = soup.select_one(selector)
            if element:
                return element.get_text(separator=" ", strip=True)

        # Fall back to body
        body = soup.find("body")
        if body:
            return body.get_text(separator=" ", strip=True)

        return soup.get_text(separator=" ", strip=True)

    except Exception as exc:
        logger.debug("BeautifulSoup extraction error: %s", exc)
        return None


def _clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    if not text:
        return ""
    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove very short lines
    lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 20]
    return "\n".join(lines[:500])  # cap at 500 meaningful lines
