"""
EngiPath AI — Health API Routes
"""
from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flasgger import swag_from
from ...extensions import db

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    """
    Health Check
    ---
    tags:
      - Health
    summary: Check API health status
    responses:
      200:
        description: API is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            timestamp:
              type: string
            version:
              type: string
            database:
              type: string
    """
    # Check DB connectivity
    db_status = "connected"
    try:
        db.session.execute(db.text("SELECT 1"))
    except Exception as exc:
        db_status = f"error: {str(exc)[:100]}"

    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "service": "EngiPath AI Backend",
        "database": db_status,
    }), 200
