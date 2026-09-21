"""
EngiPath AI — Geocoding Service

Uses OpenStreetMap Nominatim for geocoding (completely free, no API key required).
Generates Google Maps search URLs (no paid Google Maps API dependency).
Respects Nominatim's usage policy: 1 request/second max.
"""
import logging
import time
import urllib.parse
from typing import Optional, Tuple
import httpx
from flask import current_app

logger = logging.getLogger(__name__)

_last_nominatim_request: float = 0.0


class GeocodingService:
    """
    Geocoding using OpenStreetMap Nominatim.

    Free, no API key required.
    Rate limit: 1 request/second (enforced internally).
    """

    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org"
        self.user_agent = "EngiPathAI/1.0"
        self.timeout = 3.5

    def _get_config(self):
        """Get config values from Flask app context if available."""
        try:
            self.base_url = current_app.config.get("NOMINATIM_URL", self.base_url)
            self.user_agent = current_app.config.get("NOMINATIM_USER_AGENT", self.user_agent)
        except RuntimeError:
            pass  # Outside app context — use defaults

    def geocode(self, address: str) -> Optional[dict]:
        """
        Geocode an address string to coordinates.

        Args:
            address: Free-text address (e.g., "Baner, Pune, Maharashtra")

        Returns:
            Dict with lat, lon, display_name, google_maps_url, or None.
        """
        self._get_config()
        _rate_limit_nominatim()

        params = {
            "q": address,
            "format": "json",
            "limit": 1,
            "addressdetails": 1,
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(
                    f"{self.base_url}/search",
                    params=params,
                    headers={"User-Agent": self.user_agent},
                )
                response.raise_for_status()
                results = response.json()

            if not results:
                logger.debug("Nominatim: no results for %r", address)
                return None

            result = results[0]
            lat = float(result.get("lat", 0))
            lon = float(result.get("lon", 0))

            return {
                "latitude": lat,
                "longitude": lon,
                "display_name": result.get("display_name"),
                "google_maps_url": _build_google_maps_url(lat, lon, address),
            }

        except httpx.TimeoutException:
            logger.warning("Nominatim timeout for address: %r", address)
            return None
        except Exception as exc:
            logger.error("Nominatim geocoding error for %r: %s", address, exc)
            return None

    def reverse_geocode(self, lat: float, lon: float) -> Optional[dict]:
        """
        Convert coordinates to an address.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Dict with address components, or None.
        """
        self._get_config()
        _rate_limit_nominatim()

        params = {
            "lat": lat,
            "lon": lon,
            "format": "json",
            "addressdetails": 1,
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(
                    f"{self.base_url}/reverse",
                    params=params,
                    headers={"User-Agent": self.user_agent},
                )
                response.raise_for_status()
                result = response.json()

            if not result or "error" in result:
                return None

            address_data = result.get("address", {})
            return {
                "display_name": result.get("display_name"),
                "house_number": address_data.get("house_number"),
                "road": address_data.get("road"),
                "suburb": address_data.get("suburb"),
                "city": address_data.get("city") or address_data.get("town") or address_data.get("village"),
                "state": address_data.get("state"),
                "country": address_data.get("country"),
                "postcode": address_data.get("postcode"),
                "google_maps_url": _build_google_maps_url(lat, lon),
            }

        except Exception as exc:
            logger.error("Nominatim reverse geocoding error for (%s, %s): %s", lat, lon, exc)
            return None

    def geocode_class_listing(self, listing_data: dict) -> Tuple[Optional[float], Optional[float], Optional[str]]:
        """
        Geocode a class listing using its address fields.

        Returns:
            Tuple of (latitude, longitude, google_maps_url)
        """
        # Build address from available components
        parts = []
        for field in ["address", "city", "state", "country"]:
            val = listing_data.get(field)
            if val and val.strip():
                parts.append(val.strip())

        if not parts:
            return None, None, None

        address_str = ", ".join(parts)
        result = self.geocode(address_str)

        if result:
            return result["latitude"], result["longitude"], result["google_maps_url"]

        # Fallback: just generate a search URL without coordinates
        search_url = _build_google_maps_search_url(address_str)
        return None, None, search_url


def _rate_limit_nominatim():
    """Enforce Nominatim's 1 request/second rate limit."""
    global _last_nominatim_request
    now = time.monotonic()
    elapsed = now - _last_nominatim_request
    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)
    _last_nominatim_request = time.monotonic()


def _build_google_maps_url(lat: float, lon: float, label: str = "") -> str:
    """
    Build a Google Maps URL for a coordinate.
    This is a plain URL — no paid Google Maps API dependency.
    """
    if label:
        encoded_label = urllib.parse.quote(label)
        return f"https://www.google.com/maps/search/?api=1&query={lat},{lon}&query_place_id={encoded_label}"
    return f"https://www.google.com/maps?q={lat},{lon}"


def _build_google_maps_search_url(address: str) -> str:
    """Build a Google Maps search URL for an address string."""
    encoded = urllib.parse.quote(address)
    return f"https://www.google.com/maps/search/{encoded}"
