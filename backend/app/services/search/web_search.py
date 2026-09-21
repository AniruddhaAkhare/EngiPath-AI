"""
EngiPath AI — Web Search Service

Primary: Google Custom Search JSON API (free tier: 100 queries/day)
Fallback: DuckDuckGo HTML scraping (no key required)
Tertiary: Direct URL pattern construction for known aggregator sites

All providers are configurable via .env.
"""
import logging
import urllib.parse
from typing import Optional
import httpx
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from flask import current_app

logger = logging.getLogger(__name__)

GOOGLE_CSE_ENDPOINT = "https://www.googleapis.com/customsearch/v1"
DUCKDUCKGO_ENDPOINT = "https://html.duckduckgo.com/html/"


class WebSearchResult:
    """Represents a single search result (URL + snippet + title)."""
    __slots__ = ["url", "title", "snippet"]

    def __init__(self, url: str, title: str = "", snippet: str = ""):
        self.url = url
        self.title = title
        self.snippet = snippet

    def __repr__(self):
        return f"<WebSearchResult url={self.url!r}>"


class WebSearchService:
    """
    Provides live web search results.

    Search priority:
    1. Google Custom Search API (if SEARCH_API_KEY and SEARCH_ENGINE_ID are set)
    2. DuckDuckGo HTML search (always available, no key)
    """

    def __init__(self):
        self.timeout = 15

    def search_classes(self, course: str, location: str, max_results: int = 15) -> list[WebSearchResult]:
        """
        Search for classes/courses for a given course and location.
        Returns a list of WebSearchResult objects.
        """
        queries = self._build_class_queries(course, location)
        results = []
        seen_urls = set()

        for query in queries:
            try:
                batch = self._search(query, num=10)
                for r in batch:
                    if r.url not in seen_urls:
                        seen_urls.add(r.url)
                        results.append(r)
            except Exception as exc:
                logger.warning("Search query failed for %r: %s", query, exc)
                continue

            if len(results) >= max_results:
                break

        logger.info("WebSearchService.search_classes: %d results for course=%r location=%r", len(results), course, location)
        return results[:max_results]

    def search_internships(self, branch: str, skills: list[str], interests: list[str], location: Optional[str] = None) -> list[WebSearchResult]:
        """
        Search for live internship opportunities.
        Returns a list of WebSearchResult objects.
        """
        queries = self._build_internship_queries(branch, skills, interests, location)
        results = []
        seen_urls = set()

        for query in queries:
            try:
                batch = self._search(query, num=10)
                for r in batch:
                    if r.url not in seen_urls:
                        seen_urls.add(r.url)
                        results.append(r)
            except Exception as exc:
                logger.warning("Internship search query failed for %r: %s", query, exc)
                continue

            if len(results) >= 20:
                break

        logger.info("WebSearchService.search_internships: %d results", len(results))
        return results[:20]

    # -----------------------------------------------------------------------
    # Query Builders
    # -----------------------------------------------------------------------

    def _build_class_queries(self, course: str, location: str) -> list[str]:
        """Build multiple search queries to maximize discovery."""
        templates = [
            f"{course} classes in {location}",
            f"{course} course institute {location}",
            f"best {course} training institute {location}",
            f"{course} coaching center {location} fees",
            f"learn {course} {location} online offline",
        ]
        return templates

    def _build_internship_queries(
        self,
        branch: str,
        skills: list[str],
        interests: list[str],
        location: Optional[str] = None,
    ) -> list[str]:
        """Build search queries for live internship discovery."""
        skills_str = " ".join(skills[:3]) if skills else branch
        loc_str = f" {location}" if location else ""
        templates = [
            f"{branch} engineering internship 2024 2025{loc_str} site:internshala.com OR site:linkedin.com OR site:indeed.com",
            f"{skills_str} internship{loc_str} apply now",
            f"{branch} internship for students{loc_str} stipend",
            f"{' '.join(interests[:2])} internship{loc_str}" if interests else f"{branch} internship{loc_str}",
        ]
        return templates

    # -----------------------------------------------------------------------
    # Search Execution
    # -----------------------------------------------------------------------

    def _search(self, query: str, num: int = 10) -> list[WebSearchResult]:
        """Execute a search using available providers."""
        api_key = current_app.config.get("SEARCH_API_KEY")
        engine_id = current_app.config.get("SEARCH_ENGINE_ID")

        if api_key and engine_id:
            try:
                return self._google_cse_search(query, api_key, engine_id, num)
            except Exception as exc:
                logger.warning("Google CSE failed, falling back to DuckDuckGo: %s", exc)

        return self._duckduckgo_search(query, num)

    @retry(
        retry=retry_if_exception_type(httpx.TimeoutException),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
    )
    def _google_cse_search(self, query: str, api_key: str, engine_id: str, num: int) -> list[WebSearchResult]:
        """Google Custom Search API — 100 free queries/day."""
        params = {
            "key": api_key,
            "cx": engine_id,
            "q": query,
            "num": min(num, 10),
        }
        with httpx.Client(timeout=self.timeout) as client:
            response = client.get(GOOGLE_CSE_ENDPOINT, params=params)
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get("items", []):
            url = item.get("link", "")
            if url and url.startswith("http"):
                results.append(WebSearchResult(
                    url=url,
                    title=item.get("title", ""),
                    snippet=item.get("snippet", ""),
                ))
        return results

    def _duckduckgo_search(self, query: str, num: int) -> list[WebSearchResult]:
        """DuckDuckGo HTML search — no API key required."""
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; EngiPathAI/1.0; +https://engipath.ai)",
        }
        data = {"q": query, "b": ""}
        results = []

        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                response = client.post(DUCKDUCKGO_ENDPOINT, data=data, headers=headers)
                if response.status_code != 200:
                    logger.warning("DuckDuckGo returned status %d", response.status_code)
                    return []

            soup = BeautifulSoup(response.text, "lxml")
            for result in soup.select(".result__body"):
                link_tag = result.select_one(".result__url")
                title_tag = result.select_one(".result__title")
                snippet_tag = result.select_one(".result__snippet")

                url_text = link_tag.get_text(strip=True) if link_tag else ""
                if not url_text:
                    continue
                if not url_text.startswith("http"):
                    url_text = "https://" + url_text

                results.append(WebSearchResult(
                    url=url_text,
                    title=title_tag.get_text(strip=True) if title_tag else "",
                    snippet=snippet_tag.get_text(strip=True) if snippet_tag else "",
                ))

                if len(results) >= num:
                    break

        except Exception as exc:
            logger.error("DuckDuckGo search error: %s", exc)

        return results
