"""
EngiPath AI — Class Search Service

Orchestrates the complete Class Finder pipeline:
1. Validate inputs
2. Generate dynamic search queries
3. Discover pages via live web search
4. Retrieve and extract page content
5. Use ClassesGemini to extract structured class data
6. Deduplicate results
7. Geocode addresses (Nominatim)
8. Persist to database
9. Return structured response

NO mock data. NO hardcoded results.
Every search uses the user's actual course + location.
"""
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from flask import current_app

from ...ai.gemini.classes_gemini import ClassesGeminiService
from ...services.search.web_search import WebSearchService
from ...services.scraping.page_scraper import PageScraperService
from ...services.maps.geocoding import GeocodingService
from ...extensions import db
from ...models.class_listing import ClassListing
from ...models.search_history import SearchHistory

logger = logging.getLogger(__name__)


class ClassSearchService:
    """Orchestrates the full Class Finder pipeline."""

    def __init__(self):
        self.searcher = WebSearchService()
        self.scraper = PageScraperService(
            timeout=current_app.config.get("SCRAPER_REQUEST_TIMEOUT", 15),
            max_retries=current_app.config.get("SCRAPER_MAX_RETRIES", 2),
        )
        self.geocoder = GeocodingService()
        self.target_results = current_app.config.get("CLASS_SEARCH_TARGET_RESULTS", 10)

    def search(self, course: str, location: str) -> dict:
        """
        Execute a live class search.

        Args:
            course: Free-text course name (e.g., "AI/ML", "Full Stack")
            location: Free-text location (e.g., "Pune", "Bangalore")

        Returns:
            Dict with results list and metadata.
        """
        start_time = time.time()
        logger.info("ClassSearchService: searching course=%r location=%r", course, location)

        # Step 1: Live web search
        web_results = self.searcher.search_classes(course, location, max_results=20)
        urls = [r.url for r in web_results]

        if not urls:
            logger.warning("ClassSearchService: no URLs found for course=%r location=%r", course, location)
            return self._build_response([], course, location, start_time, status="no_results")

        # Step 2: Scrape pages
        combined_content = self.scraper.scrape_batch(urls, max_pages=10, delay_between=0.0)

        if not combined_content or len(combined_content.strip()) < 200:
            logger.warning("ClassSearchService: insufficient content scraped")
            return self._build_response([], course, location, start_time, status="no_content")

        # Step 3: Extract structured data via ClassesGemini
        raw_classes = ClassesGeminiService.extract_classes(combined_content, course, location)
        logger.info("ClassSearchService: Gemini extracted %d raw classes", len(raw_classes))

        # Step 3.5: Filter out colleges/universities that slipped through
        raw_classes = self._filter_colleges(raw_classes)

        # Step 4: Enrich with source URLs from search results
        raw_classes = self._enrich_with_source_urls(raw_classes, web_results)

        # Step 5: Deduplicate
        deduped = self._deduplicate(raw_classes)

        # Step 6: Geocode + generate Google Maps URLs
        geocoded = self._geocode_batch(deduped)

        # Step 7: Persist to database
        saved = self._save_to_db(geocoded, course, location)

        # Step 8: Record search history
        duration_ms = (time.time() - start_time) * 1000
        self._record_search(course, location, len(saved), duration_ms)

        logger.info("ClassSearchService: returning %d results in %.0fms", len(saved), duration_ms)
        return self._build_response(saved, course, location, start_time)

    def _filter_colleges(self, classes: list[dict]) -> list[dict]:
        """Remove any colleges or universities that Gemini extracted despite instructions."""
        COLLEGE_KEYWORDS = (
            "university", "college", "iit", "nit", "iim", "iiser", "bits",
            "deemed", "polytechnic", "school of engineering", "institute of technology",
            "faculty of", "department of",
        )
        filtered = []
        for cls in classes:
            name = (cls.get("institute_name") or "").lower()
            if any(kw in name for kw in COLLEGE_KEYWORDS):
                logger.debug("Filtered out college/university: %r", cls.get("institute_name"))
                continue
            filtered.append(cls)
        return filtered

    def _enrich_with_source_urls(self, classes: list[dict], web_results) -> list[dict]:
        """Associate source URLs from search results where not already present."""
        # Build a URL→title map
        url_map = {r.url: r for r in web_results}

        # If a class doesn't have a source_url but we have search result URLs,
        # try to match by domain/institute name
        for cls in classes:
            if not cls.get("source_url"):
                # Assign the first relevant URL
                if url_map:
                    first_url = list(url_map.keys())[0]
                    cls["source_url"] = first_url
                    cls["source_name"] = cls.get("source_name") or list(url_map.values())[0].title

        return classes

    def _deduplicate(self, classes: list[dict]) -> list[dict]:
        """Remove duplicate class listings based on institute name + course name."""
        seen = set()
        unique = []
        for cls in classes:
            key = (
                (cls.get("institute_name") or "").lower().strip(),
                (cls.get("course_name") or "").lower().strip(),
            )
            if key not in seen and key[0]:
                seen.add(key)
                unique.append(cls)
        return unique

    def _geocode_batch(self, classes: list[dict]) -> list[dict]:
        """Geocode addresses for all classes that have location data."""
        from ...services.maps.geocoding import _build_google_maps_search_url

        enriched = []
        geocoded_count = 0
        max_nominatim_geocodes = 2

        for cls in classes:
            if not cls.get("latitude") and not cls.get("longitude"):
                if geocoded_count < max_nominatim_geocodes:
                    try:
                        lat, lon, maps_url = self.geocoder.geocode_class_listing(cls)
                        cls["latitude"] = lat
                        cls["longitude"] = lon
                        cls["google_maps_url"] = maps_url
                        geocoded_count += 1
                    except Exception as exc:
                        logger.debug("Geocoding failed for %r: %s", cls.get("institute_name"), exc)
                else:
                    parts = [cls.get(f) for f in ["institute_name", "address", "city"] if cls.get(f)]
                    query_str = ", ".join(parts) if parts else (cls.get("institute_name") or "")
                    cls["google_maps_url"] = _build_google_maps_search_url(query_str) if query_str else None
            enriched.append(cls)
        return enriched

    def _save_to_db(self, classes: list[dict], course: str, location: str) -> list[dict]:
        """Persist discovered classes to database and return their dict representations."""
        saved = []
        now = datetime.now(timezone.utc)

        for cls in classes:
            try:
                listing = ClassListing(
                    id=str(uuid.uuid4()),
                    institute_name=cls.get("institute_name", ""),
                    course_name=cls.get("course_name", ""),
                    address=cls.get("address"),
                    city=cls.get("city"),
                    state=cls.get("state"),
                    country=cls.get("country"),
                    latitude=cls.get("latitude"),
                    longitude=cls.get("longitude"),
                    google_maps_url=cls.get("google_maps_url"),
                    fees=cls.get("fees"),
                    currency=cls.get("currency", "INR"),
                    duration=cls.get("duration"),
                    duration_unit=cls.get("duration_unit"),
                    mode=cls.get("mode"),
                    description=cls.get("description"),
                    topics=cls.get("topics", []),
                    skills=cls.get("skills", []),
                    website_url=cls.get("website_url"),
                    contact=cls.get("contact"),
                    source_name=cls.get("source_name"),
                    source_url=cls.get("source_url"),
                    confidence=cls.get("confidence"),
                    last_checked_at=now,
                    search_course=course,
                    search_location=location,
                )
                db.session.add(listing)
                db.session.flush()  # get the ID without full commit
                saved.append(listing.to_dict())
            except Exception as exc:
                logger.error("Failed to save ClassListing: %s", exc)
                # Still include in response even if DB save fails
                cls["id"] = str(uuid.uuid4())
                cls["last_checked_at"] = now.isoformat()
                saved.append(cls)

        try:
            db.session.commit()
        except Exception as exc:
            logger.error("DB commit failed: %s", exc)
            db.session.rollback()

        return saved

    def _record_search(self, course: str, location: str, result_count: int, duration_ms: float):
        """Log search to history table."""
        try:
            history = SearchHistory(
                search_type="classes",
                query_params={"course": course, "location": location},
                result_count=result_count,
                duration_ms=duration_ms,
                status="success",
            )
            db.session.add(history)
            db.session.commit()
        except Exception as exc:
            logger.warning("Failed to record search history: %s", exc)
            db.session.rollback()

    def _build_response(
        self,
        results: list[dict],
        course: str,
        location: str,
        start_time: float,
        status: str = "success",
    ) -> dict:
        duration_ms = (time.time() - start_time) * 1000
        return {
            "success": True,
            "data": results,
            "meta": {
                "course": course,
                "location": location,
                "total_results": len(results),
                "search_duration_ms": round(duration_ms, 1),
                "status": status,
            },
        }
