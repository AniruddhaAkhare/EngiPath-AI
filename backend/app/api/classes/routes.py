"""
EngiPath AI — Classes API Routes

Thin routes that delegate to the service layer.
All heavy logic lives in services/ and ai/ layers.
"""
import logging
from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from ...schemas.classes import ClassSearchRequest, CompareRequest
from ...services.classes.class_search_service import ClassSearchService
from ...services.classes.class_comparison_service import ClassComparisonService
from ...extensions import db
from ...models.class_listing import ClassListing

logger = logging.getLogger(__name__)

classes_bp = Blueprint("classes", __name__)


@classes_bp.post("/search")
def search_classes():
    """
    Search for Classes/Courses
    ---
    tags:
      - Classes
    summary: Discover live classes for a course and location
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - course
            - location
          properties:
            course:
              type: string
              example: "AI/ML"
              description: "Free-text course name (any course)"
            location:
              type: string
              example: "Pune"
              description: "City, state, or country"
    responses:
      200:
        description: List of discovered class listings
      400:
        description: Validation error
      500:
        description: Search failed
    """
    data = request.get_json(silent=True) or {}

    try:
        req = ClassSearchRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    try:
        service = ClassSearchService()
        result = service.search(req.course, req.location)
        return jsonify(result), 200
    except Exception as exc:
        logger.error("Class search error: %s", exc, exc_info=True)
        return _server_error("SEARCH_FAILED", "Unable to retrieve live course data at this time.")


@classes_bp.get("/<string:class_id>")
def get_class(class_id: str):
    """
    Get Class by ID
    ---
    tags:
      - Classes
    summary: Retrieve a specific class listing by ID
    parameters:
      - in: path
        name: class_id
        type: string
        required: true
    responses:
      200:
        description: Class listing details
      404:
        description: Not found
    """
    listing = db.session.get(ClassListing, class_id)
    if not listing:
        return jsonify({
            "success": False,
            "error": {"code": "NOT_FOUND", "message": f"Class {class_id!r} not found."},
        }), 404

    return jsonify({"success": True, "data": listing.to_dict()}), 200


@classes_bp.post("/compare")
def compare_classes():
    """
    Compare Classes (AI-Powered)
    ---
    tags:
      - Classes
    summary: AI-powered comparison of 2 or 3 class listings
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - class_ids
          properties:
            class_ids:
              type: array
              items:
                type: string
              minItems: 2
              maxItems: 3
              example: ["id1", "id2"]
              description: "Exactly 2 or 3 class IDs from search results"
    responses:
      200:
        description: AI comparison analysis
      400:
        description: Invalid number of classes (must be 2 or 3)
      404:
        description: One or more class IDs not found
      500:
        description: Comparison failed
    """
    data = request.get_json(silent=True) or {}

    try:
        req = CompareRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    try:
        service = ClassComparisonService()
        result = service.compare(req.class_ids)

        if not result.get("success"):
            error = result.get("error", {})
            code = error.get("code", "COMPARE_FAILED")
            status = 404 if "NOT_FOUND" in code else 400
            return jsonify(result), status

        return jsonify(result), 200

    except Exception as exc:
        logger.error("Class comparison error: %s", exc, exc_info=True)
        return _server_error("COMPARISON_FAILED", "Unable to complete class comparison at this time.")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validation_error(exc: ValidationError):
    raw_errors = exc.errors(include_url=False)
    safe_errors = []
    for err in raw_errors:
        clean = {k: v for k, v in err.items() if k != "ctx"}
        if "ctx" in err:
            clean["ctx"] = {k: str(v) for k, v in err["ctx"].items()}
        safe_errors.append(clean)
    messages = [f"{'.'.join(str(l) for l in e['loc'])}: {e['msg']}" for e in safe_errors]
    return jsonify({
        "success": False,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "; ".join(messages),
            "details": safe_errors,
        },
    }), 400


def _server_error(code: str, message: str):
    return jsonify({
        "success": False,
        "error": {"code": code, "message": message},
    }), 500
