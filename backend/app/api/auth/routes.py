"""
EngiPath AI — Authentication API Routes

Endpoints:
- POST /api/v1/auth/register — Register a new student account
- POST /api/v1/auth/login — Authenticate student credentials
- GET /api/v1/auth/me — Retrieve current authenticated profile
"""
import logging
from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from ...schemas.auth import RegisterRequest, LoginRequest
from ...services.auth_service import AuthService

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)


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


@auth_bp.post("/register")
def register():
    """
    Student Registration
    ---
    tags:
      - Auth
    summary: Register a new engineering student account
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - email
            - password
          properties:
            name:
              type: string
              example: "Kshitij"
            email:
              type: string
              example: "kshitij@example.com"
            password:
              type: string
              example: "password123"
            branch:
              type: string
              example: "Computer Science"
            year:
              type: string
              example: "3rd Year"
            skills:
              type: array
              items:
                type: string
              example: ["Python", "React", "AI"]
            interests:
              type: array
              items:
                type: string
              example: ["Machine Learning", "Cloud"]
    responses:
      201:
        description: Account registered successfully
      400:
        description: Validation error or account already exists
    """
    data = request.get_json(silent=True) or {}
    try:
        req = RegisterRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    effective_name = (req.name or req.full_name or "").strip()
    if not effective_name:
        effective_name = "Engineering Student"

    user, error = AuthService.register_user(
        name=effective_name,
        email=req.email,
        password=req.password,
        branch=req.branch,
        year=req.year,
        skills=req.skills,
        interests=req.interests,
    )

    if error:
        return jsonify({
            "success": False,
            "error": {"code": "REGISTRATION_FAILED", "message": error},
        }), 400

    token = AuthService.generate_token(user.id)
    return jsonify({
        "success": True,
        "data": {
            "token": token,
            "user": user.to_dict(),
        },
        "message": "Account created successfully.",
    }), 201


@auth_bp.post("/login")
def login():
    """
    Student Login
    ---
    tags:
      - Auth
    summary: Authenticate with email and password
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: "kshitij@example.com"
            password:
              type: string
              example: "password123"
    responses:
      200:
        description: Successfully authenticated
      401:
        description: Invalid credentials
    """
    data = request.get_json(silent=True) or {}
    try:
        req = LoginRequest(**data)
    except ValidationError as exc:
        return _validation_error(exc)

    user, error = AuthService.authenticate_user(req.email, req.password)
    if error or not user:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_CREDENTIALS", "message": error or "Invalid email or password."},
        }), 401

    token = AuthService.generate_token(user.id)
    return jsonify({
        "success": True,
        "data": {
            "token": token,
            "user": user.to_dict(),
        },
        "message": "Logged in successfully.",
    }), 200


@auth_bp.get("/me")
def get_current_user():
    """
    Get Current Authenticated User Profile
    ---
    tags:
      - Auth
    summary: Retrieve profile of currently authenticated student
    parameters:
      - in: header
        name: Authorization
        type: string
        required: true
        description: "Bearer <token>"
    responses:
      200:
        description: Current user profile
      401:
        description: Unauthorized or expired token
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({
            "success": False,
            "error": {"code": "UNAUTHORIZED", "message": "Missing or invalid Authorization header."},
        }), 401

    token = auth_header.split(" ", 1)[1].strip()
    user_id = AuthService.verify_token(token)
    if not user_id:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_TOKEN", "message": "Session token has expired or is invalid."},
        }), 401

    user = AuthService.get_user_by_id(user_id)
    if not user:
        return jsonify({
            "success": False,
            "error": {"code": "USER_NOT_FOUND", "message": "User account no longer exists."},
        }), 404

    return jsonify({
        "success": True,
        "data": {
            "user": user.to_dict(),
        },
    }), 200
