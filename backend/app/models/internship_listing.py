"""
EngiPath AI — InternshipListing Model

Stores live internship opportunities discovered from the web.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, JSON
from ..extensions import db


def _generate_id():
    return str(uuid.uuid4())


class InternshipListing(db.Model):
    """Represents a live internship opportunity discovered from public web sources."""

    __tablename__ = "internship_listings"

    id = Column(String(36), primary_key=True, default=_generate_id)

    # Core details
    company = Column(String(512), nullable=False)
    role = Column(String(512), nullable=False)

    # Location & mode
    location = Column(String(512), nullable=True)
    mode = Column(String(64), nullable=True)  # "remote", "on-site", "hybrid"

    # Requirements
    skills = Column(JSON, nullable=True, default=list)
    eligibility = Column(Text, nullable=True)
    duration = Column(String(128), nullable=True)
    stipend = Column(String(256), nullable=True)
    deadline = Column(String(256), nullable=True)

    # Description
    description = Column(Text, nullable=True)

    # Discovery metadata
    source_name = Column(String(256), nullable=True)
    source_url = Column(Text, nullable=True)
    application_url = Column(Text, nullable=True)
    last_checked_at = Column(DateTime(timezone=True), nullable=True)

    # Search context
    search_branch = Column(String(256), nullable=True)
    search_skills = Column(JSON, nullable=True, default=list)
    search_interests = Column(JSON, nullable=True, default=list)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self) -> dict:
        return {
            "company": self.company,
            "role": self.role,
            "location": self.location,
            "mode": self.mode,
            "skills": self.skills or [],
            "eligibility": self.eligibility,
            "duration": self.duration,
            "stipend": self.stipend,
            "deadline": self.deadline,
            "description": self.description,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "application_url": self.application_url,
            "last_checked_at": self.last_checked_at.isoformat() if self.last_checked_at else None,
        }

    def __repr__(self):
        return f"<InternshipListing {self.company!r} — {self.role!r}>"
