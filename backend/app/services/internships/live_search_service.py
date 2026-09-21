"""
EngiPath AI — Live Internship Search Service

Discovers currently available internship opportunities from the live web.
Separate from AI recommendations — this is the live discovery layer.

Uses:
- WebSearchService for URL discovery
- PageScraperService for content retrieval
- InternshipGeminiService for structured data extraction
"""
import logging
import time
import uuid
from datetime import datetime, timezone

from flask import current_app

from ...ai.gemini.internship_gemini import InternshipGeminiService
from ...services.search.web_search import WebSearchService
from ...services.scraping.page_scraper import PageScraperService
from ...extensions import db
from ...models.internship_listing import InternshipListing
from ...models.search_history import SearchHistory

logger = logging.getLogger(__name__)


class LiveInternshipSearchService:
    """
    Discovers live internship opportunities from public web sources.
    Results are separate from AI-generated recommendations.
    """

    def __init__(self):
        self.searcher = WebSearchService()
        self.scraper = PageScraperService(
            timeout=current_app.config.get("SCRAPER_REQUEST_TIMEOUT", 15),
            max_retries=current_app.config.get("SCRAPER_MAX_RETRIES", 2),
        )

    def search(
        self,
        branch: str,
        skills: list[str],
        interests: list[str],
        location: str = None,
    ) -> dict:
        """
        Search for currently available internship opportunities.

        Returns:
            Dict with list of live_internships and metadata.
        """
        start_time = time.time()
        logger.info("LiveInternshipSearchService: branch=%r skills=%r", branch, skills)

        # Step 1: Live web search
        web_results = self.searcher.search_internships(branch, skills, interests, location)
        urls = [r.url for r in web_results]

        if not urls:
            return self._build_response([], branch, start_time, status="no_results")

        # Step 2: Scrape content
        combined_content = self.scraper.scrape_batch(urls, max_pages=8, delay_between=0.5)

        if not combined_content or len(combined_content.strip()) < 200:
            return self._build_response([], branch, start_time, status="no_content")

        # Step 3: Extract via InternshipGemini
        context = {"branch": branch, "skills": skills, "interests": interests}
        raw_internships = InternshipGeminiService.extract_live_internships(combined_content, context)
        logger.info("LiveInternshipSearchService: extracted %d raw listings", len(raw_internships))

        # Step 4: Enrich with source URLs
        raw_internships = self._enrich_with_source_urls(raw_internships, web_results)

        # Step 5: Deduplicate
        deduped = self._deduplicate(raw_internships)

        # Step 6: Add last_checked_at
        now = datetime.now(timezone.utc)
        for item in deduped:
            item["last_checked_at"] = now.isoformat()

        # Step 7: Persist to DB
        self._save_to_db(deduped, branch, skills, interests)

        # Step 8: Record search
        duration_ms = (time.time() - start_time) * 1000
        self._record_search(branch, skills, interests, len(deduped), duration_ms)

        logger.info("LiveInternshipSearchService: returning %d results in %.0fms", len(deduped), duration_ms)
        return self._build_response(deduped, branch, start_time)

    def _enrich_with_source_urls(self, internships: list[dict], web_results) -> list[dict]:
        url_list = [r.url for r in web_results]
        for item in internships:
            if not item.get("source_url") and url_list:
                item["source_url"] = url_list[0]
                item["source_name"] = item.get("source_name") or (web_results[0].title if web_results else None)
        return internships

    def _deduplicate(self, internships: list[dict]) -> list[dict]:
        seen = set()
        unique = []
        for item in internships:
            key = (
                (item.get("company") or "").lower().strip(),
                (item.get("role") or "").lower().strip(),
            )
            if key not in seen and key[0] and key[1]:
                seen.add(key)
                unique.append(item)
        return unique

    def _save_to_db(self, internships: list[dict], branch: str, skills: list, interests: list):
        now = datetime.now(timezone.utc)
        for item in internships:
            try:
                listing = InternshipListing(
                    company=item.get("company", ""),
                    role=item.get("role", ""),
                    location=item.get("location"),
                    mode=item.get("mode"),
                    skills=item.get("skills", []),
                    eligibility=item.get("eligibility"),
                    duration=item.get("duration"),
                    stipend=item.get("stipend"),
                    deadline=item.get("deadline"),
                    description=item.get("description"),
                    source_name=item.get("source_name"),
                    source_url=item.get("source_url"),
                    application_url=item.get("application_url"),
                    last_checked_at=now,
                    search_branch=branch,
                    search_skills=skills,
                    search_interests=interests,
                )
                db.session.add(listing)
            except Exception as exc:
                logger.error("Failed to save InternshipListing: %s", exc)

        try:
            db.session.commit()
        except Exception as exc:
            logger.error("DB commit failed for internships: %s", exc)
            db.session.rollback()

    def _record_search(self, branch, skills, interests, result_count, duration_ms):
        try:
            history = SearchHistory(
                search_type="live_internships",
                query_params={"branch": branch, "skills": skills, "interests": interests},
                result_count=result_count,
                duration_ms=duration_ms,
            )
            db.session.add(history)
            db.session.commit()
        except Exception:
            db.session.rollback()

    def _build_response(self, results: list, branch: str, start_time: float, status: str = "success") -> dict:
        duration_ms = (time.time() - start_time) * 1000
        return {
            "live_internships": results,
            "meta": {
                "branch": branch,
                "total_results": len(results),
                "search_duration_ms": round(duration_ms, 1),
                "status": status,
            },
        }
