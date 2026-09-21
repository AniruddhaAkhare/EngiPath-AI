"""
EngiPath AI — Error Handler Middleware

Provides consistent structured error responses for all unhandled exceptions.
"""
from flask import jsonify


def handle_400(e):
    return jsonify({"success": False, "error": {"code": "BAD_REQUEST", "message": str(e)}}), 400

def handle_404(e):
    return jsonify({"success": False, "error": {"code": "NOT_FOUND", "message": "The requested resource was not found."}}), 404

def handle_413(e):
    return jsonify({
        "success": False,
        "error": {"code": "FILE_TOO_LARGE", "message": "Uploaded file exceeds the maximum allowed size (10MB)."},
    }), 413

def handle_422(e):
    return jsonify({"success": False, "error": {"code": "UNPROCESSABLE", "message": str(e)}}), 422

def handle_500(e):
    # Never expose internal details
    return jsonify({
        "success": False,
        "error": {"code": "INTERNAL_ERROR", "message": "An internal server error occurred. Please try again."},
    }), 500
