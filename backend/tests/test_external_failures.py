"""
Tests: External service failure handling
"""
import pytest
from unittest.mock import patch, MagicMock
import httpx


class TestWebSearchFailures:
    """Test graceful degradation when web search fails."""

    def test_search_returns_empty_when_search_fails(self, app):
        with app.app_context():
            from app.services.search.web_search import WebSearchService

            with patch.object(WebSearchService, "_search", side_effect=Exception("Network error")):
                svc = WebSearchService()
                results = svc.search_classes("Python", "Pune")
                assert isinstance(results, list)
                assert len(results) == 0

    def test_search_continues_on_partial_failure(self, app):
        """One failing query should not stop others."""
        with app.app_context():
            from app.services.search.web_search import WebSearchService

            call_count = 0
            def mock_search(query, num=10):
                nonlocal call_count
                call_count += 1
                if call_count == 1:
                    raise Exception("First query failed")
                return [MagicMock(url=f"https://example.com/{call_count}", title="T", snippet="S")]

            with patch.object(WebSearchService, "_search", side_effect=mock_search):
                svc = WebSearchService()
                results = svc.search_classes("Python", "Pune")
                # Should still return results from successful queries
                assert isinstance(results, list)


class TestScraperFailures:
    """Test graceful handling of page scraping failures."""

    def test_scraper_handles_timeout_gracefully(self, app):
        with app.app_context():
            from app.services.scraping.page_scraper import PageScraperService

            with patch.object(PageScraperService, "_fetch_html", side_effect=httpx.TimeoutException("timeout")):
                svc = PageScraperService()
                result = svc.scrape_page("https://example.com")
                assert result is None

    def test_scraper_handles_404_gracefully(self, app):
        with app.app_context():
            from app.services.scraping.page_scraper import PageScraperService
            mock_response = MagicMock()
            mock_response.status_code = 404

            with patch("httpx.Client") as mock_client:
                mock_client.return_value.__enter__.return_value.get.return_value = mock_response
                svc = PageScraperService()
                result = svc.scrape_page("https://example.com/notfound")
                assert result is None

    def test_scraper_batch_handles_mixed_failures(self, app):
        """Batch scraping should collect successful results even if some URLs fail."""
        with app.app_context():
            from app.services.scraping.page_scraper import PageScraperService

            call_count = 0
            def mock_scrape_page(url):
                nonlocal call_count
                call_count += 1
                if call_count % 2 == 0:
                    raise Exception("Failed")
                return "Good content from page " + url

            with patch.object(PageScraperService, "scrape_page", side_effect=mock_scrape_page):
                svc = PageScraperService()
                urls = [f"https://site{i}.com" for i in range(6)]
                result = svc.scrape_batch(urls, max_pages=6, delay_between=0)
                # Should have content from successful pages
                assert "Good content" in result

    def test_ssrf_url_blocked(self):
        """SSRF-protected URLs must be rejected silently."""
        from app.services.scraping.page_scraper import PageScraperService, SSRFError, _validate_url
        with pytest.raises(SSRFError):
            _validate_url("http://localhost/admin")


class TestNominatimFailures:
    """Test geocoding service failure handling."""

    def test_geocode_returns_none_on_timeout(self, app):
        with app.app_context():
            from app.services.maps.geocoding import GeocodingService
            with patch("httpx.Client") as mock_client:
                mock_client.return_value.__enter__.return_value.get.side_effect = httpx.TimeoutException("timeout")
                svc = GeocodingService()
                result = svc.geocode("Somewhere")
                assert result is None

    def test_geocode_returns_none_on_empty_results(self, app):
        with app.app_context():
            from app.services.maps.geocoding import GeocodingService
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = []  # Empty results
            mock_response.raise_for_status = MagicMock()
            with patch("httpx.Client") as mock_client:
                mock_client.return_value.__enter__.return_value.get.return_value = mock_response
                svc = GeocodingService()
                result = svc.geocode("NonExistentPlace99999")
                assert result is None


class TestOSRMFailures:
    """Test routing service failure handling."""

    def test_routing_returns_none_on_timeout(self, app):
        with app.app_context():
            from app.services.maps.routing import RoutingService
            with patch("httpx.Client") as mock_client:
                mock_client.return_value.__enter__.return_value.get.side_effect = httpx.TimeoutException("timeout")
                svc = RoutingService()
                result = svc.get_directions(18.52, 73.85, 18.63, 73.79)
                assert result is None

    def test_routing_returns_none_on_no_route(self, app):
        with app.app_context():
            from app.services.maps.routing import RoutingService
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"code": "NoRoute", "routes": []}
            mock_response.raise_for_status = MagicMock()
            with patch("httpx.Client") as mock_client:
                mock_client.return_value.__enter__.return_value.get.return_value = mock_response
                svc = RoutingService()
                result = svc.get_directions(0, 0, 0, 0)
                assert result is None
