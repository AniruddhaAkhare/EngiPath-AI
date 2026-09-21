"""
EngiPath AI — User Model for Authentication
"""
import uuid
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db


class User(db.Model):
    """User account model for engineering students."""

    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    branch = db.Column(db.String(128), nullable=True)
    year = db.Column(db.String(32), nullable=True)
    skills = db.Column(db.JSON, default=list, nullable=False)
    interests = db.Column(db.JSON, default=list, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def set_password(self, password: str) -> None:
        """Hash and store the user password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify the password against stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        """Return safe dictionary representation without password hash."""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "full_name": self.name,
            "branch": self.branch or "",
            "year": self.year or "",
            "skills": self.skills or [],
            "interests": self.interests or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
