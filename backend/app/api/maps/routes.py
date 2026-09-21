"""
EngiPath AI — Maps API Routes

Geocoding, reverse geocoding, and routing using free services.
"""
import logging
from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from ...schemas.maps import GeocodeRequest, ReverseGeocodeRequest, DirectionsRequest
from ...services.maps.geocoding import GeocodingService
from ...services.maps.routing import RoutingService

logger = logging.getLogger(__name__)

maps_bp = Blueprint("maps", __name__)


@maps_bp.post("/geocode")
def geocode():
    """
    Geocode Address
    ---
    tags:
      - Maps
    summary: Convert an address to coordinates (OpenStreetMap Nominatim — free)
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - address
          properties:
            address:
              type: string
              example: "Baner, Pune, Maharashtra, India"
    responses:
      200:
        description: Coordinates and Google Maps URL
      404:
        description: Address not found
    """
    data = request.get_json(silent=True) or {}
    try:
        req = GeocodeRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    service = GeocodingService()
    result = service.geocode(req.address)

    if not result:
        return jsonify({
            "success": False,
            "error": {"code": "NOT_FOUND", "message": f"No coordinates found for address: {req.address!r}"},
        }), 404

    return jsonify({"success": True, "data": result}), 200


@maps_bp.post("/reverse-geocode")
def reverse_geocode():
    """
    Reverse Geocode
    ---
    tags:
      - Maps
    summary: Convert coordinates to an address (OpenStreetMap Nominatim — free)
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - latitude
            - longitude
          properties:
            latitude:
              type: number
              example: 18.5204
            longitude:
              type: number
              example: 73.8567
    responses:
      200:
        description: Address details
    """
    data = request.get_json(silent=True) or {}
    try:
        req = ReverseGeocodeRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    service = GeocodingService()
    result = service.reverse_geocode(req.latitude, req.longitude)

    if not result:
        return jsonify({
            "success": False,
            "error": {"code": "NOT_FOUND", "message": "No address found for given coordinates."},
        }), 404

    return jsonify({"success": True, "data": result}), 200


@maps_bp.post("/directions")
def get_directions():
    """
    Get Directions
    ---
    tags:
      - Maps
    summary: Get routing directions between two coordinates (OSRM — free)
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - origin_lat
            - origin_lon
            - dest_lat
            - dest_lon
          properties:
            origin_lat:
              type: number
              example: 18.5204
            origin_lon:
              type: number
              example: 73.8567
            dest_lat:
              type: number
              example: 18.6298
            dest_lon:
              type: number
              example: 73.7997
            profile:
              type: string
              enum: [driving, walking, cycling]
              default: driving
    responses:
      200:
        description: Route distance, duration, and geometry
      404:
        description: No route found
    """
    data = request.get_json(silent=True) or {}
    try:
        req = DirectionsRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    service = RoutingService()
    result = service.get_directions(
        req.origin_lat, req.origin_lon,
        req.dest_lat, req.dest_lon,
        req.profile,
    )

    if not result:
        return jsonify({
            "success": False,
            "error": {"code": "NO_ROUTE", "message": "Could not find a route between the given coordinates."},
        }), 404

    return jsonify({"success": True, "data": result}), 200


def _validation_error(exc: ValidationError):
    errors = exc.errors()
    messages = [f"{'.'.join(str(l) for l in e['loc'])}: {e['msg']}" for e in errors]
    return jsonify({
        "success": False,
        "error": {"code": "VALIDATION_ERROR", "message": "; ".join(messages)},
    }), 400
