"""
EngiPath AI — Authentication Service

Handles password hashing, token generation/verification, and user operations.
Uses itsdangerous.URLSafeTimedSerializer for tamper-proof session tokens.
"""
import logging
from typing import Optional, Tuple
from flask import current_app
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

from ..extensions import db
from ..models.user import User

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication and session token service."""

    @staticmethod
    def _get_serializer() -> URLSafeTimedSerializer:
        secret_key = current_app.config.get("SECRET_KEY", "engipath-default-secret-key")
        return URLSafeTimedSerializer(secret_key, salt="engipath-auth-salt")

    @classmethod
    def generate_token(cls, user_id: str) -> str:
        """Generate a signed time-stamped token for a user ID."""
        serializer = cls._get_serializer()
        return serializer.dumps({"user_id": user_id})

    @classmethod
    def verify_token(cls, token: str, max_age: int = 86400 * 30) -> Optional[str]:
        """Verify token and return user_id, or None if invalid/expired (default 30 days)."""
        serializer = cls._get_serializer()
        try:
            data = serializer.loads(token, max_age=max_age)
            return data.get("user_id")
        except (SignatureExpired, BadSignature, Exception) as exc:
            logger.debug("Token verification failed: %s", exc)
            return None

    @classmethod
    def register_user(
        cls,
        name: str,
        email: str,
        password: str,
        branch: Optional[str] = None,
        year: Optional[str] = None,
        skills: Optional[list] = None,
        interests: Optional[list] = None,
    ) -> Tuple[Optional[User], Optional[str]]:
        """
        Register a new user.
        Returns (user, None) on success or (None, error_message) on failure.
        """
        email_clean = email.strip().lower()
        existing = User.query.filter_by(email=email_clean).first()
        if existing:
            return None, "An account with this email already exists."

        user = User(
            name=name.strip(),
            email=email_clean,
            branch=branch.strip() if branch else None,
            year=year.strip() if year else None,
            skills=skills or [],
            interests=interests or [],
        )
        user.set_password(password)

        try:
            db.session.add(user)
            db.session.commit()
            return user, None
        except Exception as exc:
            logger.error("User registration DB error: %s", exc)
            db.session.rollback()
            return None, "Failed to create user account."

    @classmethod
    def authenticate_user(
        cls, email: str, password: str
    ) -> Tuple[Optional[User], Optional[str]]:
        """
        Authenticate user with email and password.
        Returns (user, None) on success or (None, error_message) on failure.
        """
        email_clean = email.strip().lower()
        user = User.query.filter_by(email=email_clean).first()
        if not user or not user.check_password(password):
            return None, "Invalid email or password."

        return user, None

    @classmethod
    def get_user_by_id(cls, user_id: str) -> Optional[User]:
        """Fetch user by ID."""
        return db.session.get(User, user_id)
