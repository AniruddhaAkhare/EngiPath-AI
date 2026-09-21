"""
EngiPath AI — Routing Service

Uses OSRM (Open Source Routing Machine) — completely free, no API key.
Public demo server: router.project-osrm.org
"""
import logging
from typing import Optional
import httpx
from flask import current_app

logger = logging.getLogger(__name__)


class RoutingService:
    """
    Turn-by-turn routing using OSRM.
    Free, no API key required.
    """

    def __init__(self):
        self.base_url = "https://router.project-osrm.org"
        self.timeout = 15

    def _get_config(self):
        try:
            self.base_url = current_app.config.get("OSRM_URL", self.base_url)
        except RuntimeError:
            pass

    def get_directions(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        profile: str = "driving",
    ) -> Optional[dict]:
        """
        Get driving/walking/cycling directions between two coordinates.

        Args:
            origin_lat: Start latitude
            origin_lon: Start longitude
            dest_lat: Destination latitude
            dest_lon: Destination longitude
            profile: "driving", "walking", or "cycling"

        Returns:
            Dict with distance_m, duration_s, route_geometry, or None.
        """
        self._get_config()

        valid_profiles = {"driving": "car", "walking": "foot", "cycling": "bike"}
        osrm_profile = valid_profiles.get(profile, "car")

        url = (
            f"{self.base_url}/route/v1/{osrm_profile}/"
            f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
        )
        params = {
            "overview": "simplified",
            "geometries": "geojson",
            "steps": "false",
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

            if data.get("code") != "Ok" or not data.get("routes"):
                logger.warning("OSRM: no route found. Code: %s", data.get("code"))
                return None

            route = data["routes"][0]
            return {
                "distance_m": route.get("distance"),
                "duration_s": route.get("duration"),
                "distance_km": round(route.get("distance", 0) / 1000, 2),
                "duration_min": round(route.get("duration", 0) / 60, 1),
                "geometry": route.get("geometry"),
                "profile": profile,
            }

        except httpx.TimeoutException:
            logger.warning("OSRM timeout for route (%s,%s)→(%s,%s)", origin_lat, origin_lon, dest_lat, dest_lon)
            return None
        except Exception as exc:
            logger.error("OSRM routing error: %s", exc)
            return None
