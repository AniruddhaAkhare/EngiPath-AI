"""
Tests: Web discovery pipeline
"""
import pytest
from unittest.mock import patch, MagicMock


class TestWebSearchService:
    """Test web search service query building and result handling."""

    def test_class_queries_are_dynamic(self, app):
        """Search queries must be built dynamically — not hardcoded."""
        with app.app_context():
            from app.services.search.web_search import WebSearchService
            svc = WebSearchService()

            queries_pune_python = svc._build_class_queries("Python", "Pune")
            queries_nagpur_genai = svc._build_class_queries("Generative AI", "Nagpur")
            queries_bangalore_robotics = svc._build_class_queries("Robotics", "Bangalore")

            # All should be different
            assert queries_pune_python != queries_nagpur_genai
            assert queries_nagpur_genai != queries_bangalore_robotics

            # All should contain the course name
            assert all("Python" in q for q in queries_pune_python)
            assert all("Generative AI" in q or "Nagpur" in q for q in queries_nagpur_genai)

    def test_internship_queries_are_dynamic(self, app):
        """Internship search queries must be built from user inputs."""
        with app.app_context():
            from app.services.search.web_search import WebSearchService
            svc = WebSearchService()

            q_cs = svc._build_internship_queries("Computer Science", ["Python", "ML"], ["AI"])
            q_ee = svc._build_internship_queries("Electrical Engineering", ["Circuits"], ["Power"])

            assert q_cs != q_ee
            # CS queries must reference CS or Python
            assert any("Computer Science" in q or "Python" in q for q in q_cs)


class TestPageScraper:
    """Test page scraper content extraction."""

    def test_url_validation_accepts_valid_urls(self):
        from app.services.scraping.page_scraper import _validate_url
        # These should not raise
        _validate_url("https://internshala.com/internships")
        _validate_url("http://www.example.com/course")

    def test_url_validation_blocks_non_http(self):
        from app.services.scraping.page_scraper import _validate_url, SSRFError
        with pytest.raises(SSRFError):
            _validate_url("ftp://somewhere.com")
        with pytest.raises(SSRFError):
            _validate_url("file:///etc/passwd")

    def test_url_validation_blocks_private_ips(self):
        from app.services.scraping.page_scraper import _validate_url, SSRFError
        private_ips = [
            "http://192.168.0.1/",
            "http://10.10.10.10/",
            "http://172.16.0.1/",
            "http://127.0.0.1/",
        ]
        for ip_url in private_ips:
            with pytest.raises(SSRFError, match=""):
                _validate_url(ip_url)

    def test_clean_text_removes_excess_whitespace(self):
        from app.services.scraping.page_scraper import _clean_text
        input_text = "Hello   World\n\n\n\nNew paragraph"
        result = _clean_text(input_text)
        assert "  " not in result  # no double spaces
        assert "\n\n\n" not in result  # no triple newlines

    def test_extract_with_bs4_returns_text(self):
        from app.services.scraping.page_scraper import _extract_with_bs4
        html = """<html><body><main>
            <h1>Python Course</h1>
            <p>Learn Python programming from basics to advanced</p>
            <p>Duration: 3 months, Fees: 15000</p>
        </main></body></html>"""
        result = _extract_with_bs4(html)
        assert result is not None
        assert "Python" in result


class TestSearchResultDeduplication:
    """Test URL deduplication in search results."""

    def test_duplicate_urls_not_returned(self, app):
        """Same URL should not appear twice in search results."""
        with app.app_context():
            from app.services.search.web_search import WebSearchService
            from unittest.mock import MagicMock

            svc = WebSearchService()
            # Simulate search returning duplicate URLs from different queries
            call_count = 0
            def mock_search(query, num=10):
                return [
                    MagicMock(url="https://duplicate.com", title="T", snippet="S"),
                    MagicMock(url="https://unique.com", title="U", snippet="S2"),
                ]

            with patch.object(svc, "_search", side_effect=mock_search):
                results = svc.search_classes("Python", "Pune")

            urls = [r.url for r in results]
            assert len(urls) == len(set(urls)), "Duplicate URLs found in results"
