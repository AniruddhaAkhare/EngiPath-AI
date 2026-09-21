"""
Tests: Maps / geocoding / routing
"""
import pytest
from unittest.mock import patch, MagicMock


class TestGeocodeEndpoint:
    """Tests for POST /api/v1/maps/geocode"""

    def test_missing_address_returns_400(self, client):
        resp = client.post("/api/v1/maps/geocode", json={})
        assert resp.status_code == 400

    def test_empty_address_returns_400(self, client):
        resp = client.post("/api/v1/maps/geocode", json={"address": ""})
        assert resp.status_code == 400

    def test_geocode_returns_coordinates(self, client):
        with patch("app.api.maps.routes.GeocodingService") as mock_geo:
            mock_geo.return_value.geocode.return_value = {
                "latitude": 18.5204,
                "longitude": 73.8567,
                "display_name": "Pune, Maharashtra, India",
                "google_maps_url": "https://www.google.com/maps?q=18.5204,73.8567",
            }
            resp = client.post("/api/v1/maps/geocode", json={"address": "Pune, Maharashtra"})

        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["data"]["latitude"] == 18.5204
        assert data["data"]["longitude"] == 73.8567
        assert "google_maps_url" in data["data"]

    def test_geocode_not_found_returns_404(self, client):
        with patch("app.api.maps.routes.GeocodingService") as mock_geo:
            mock_geo.return_value.geocode.return_value = None
            resp = client.post("/api/v1/maps/geocode", json={"address": "xyzinvalidaddress"})
        assert resp.status_code == 404


class TestReverseGeocodeEndpoint:
    """Tests for POST /api/v1/maps/reverse-geocode"""

    def test_missing_coordinates_returns_400(self, client):
        resp = client.post("/api/v1/maps/reverse-geocode", json={"latitude": 18.52})
        assert resp.status_code == 400

    def test_invalid_latitude_returns_400(self, client):
        resp = client.post("/api/v1/maps/reverse-geocode", json={"latitude": 999, "longitude": 73.85})
        assert resp.status_code == 400

    def test_reverse_geocode_returns_address(self, client):
        with patch("app.api.maps.routes.GeocodingService") as mock_geo:
            mock_geo.return_value.reverse_geocode.return_value = {
                "display_name": "Pune, Maharashtra, India",
                "city": "Pune",
                "state": "Maharashtra",
                "country": "India",
            }
            resp = client.post("/api/v1/maps/reverse-geocode", json={"latitude": 18.52, "longitude": 73.85})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True


class TestDirectionsEndpoint:
    """Tests for POST /api/v1/maps/directions"""

    def test_missing_coords_returns_400(self, client):
        resp = client.post("/api/v1/maps/directions", json={"origin_lat": 18.52, "origin_lon": 73.85})
        assert resp.status_code == 400

    def test_invalid_profile_returns_400(self, client):
        resp = client.post("/api/v1/maps/directions", json={
            "origin_lat": 18.52, "origin_lon": 73.85,
            "dest_lat": 18.63, "dest_lon": 73.79,
            "profile": "flying"
        })
        assert resp.status_code == 400

    def test_directions_returns_route(self, client):
        with patch("app.api.maps.routes.RoutingService") as mock_route:
            mock_route.return_value.get_directions.return_value = {
                "distance_m": 15000,
                "duration_s": 1800,
                "distance_km": 15.0,
                "duration_min": 30.0,
                "profile": "driving",
            }
            resp = client.post("/api/v1/maps/directions", json={
                "origin_lat": 18.52, "origin_lon": 73.85,
                "dest_lat": 18.63, "dest_lon": 73.79,
            })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["data"]["distance_km"] == 15.0

    def test_directions_no_route_returns_404(self, client):
        with patch("app.api.maps.routes.RoutingService") as mock_route:
            mock_route.return_value.get_directions.return_value = None
            resp = client.post("/api/v1/maps/directions", json={
                "origin_lat": 18.52, "origin_lon": 73.85,
                "dest_lat": 18.63, "dest_lon": 73.79,
            })
        assert resp.status_code == 404


class TestGeocodingService:
    """Unit tests for the geocoding service."""

    def test_geocode_builds_google_maps_url(self, app):
        with app.app_context():
            from app.services.maps.geocoding import _build_google_maps_url
            url = _build_google_maps_url(18.52, 73.85)
            assert "18.52" in url
            assert "73.85" in url
            assert "google.com/maps" in url

    def test_geocode_ssrf_protection(self):
        """SSRF validator blocks private IPs."""
        from app.services.scraping.page_scraper import _validate_url, SSRFError
        with pytest.raises(SSRFError):
            _validate_url("http://127.0.0.1/admin")
        with pytest.raises(SSRFError):
            _validate_url("http://192.168.1.1/secret")
        with pytest.raises(SSRFError):
            _validate_url("http://10.0.0.1/internal")
