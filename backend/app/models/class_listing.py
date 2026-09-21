"""
EngiPath AI — ClassListing Model

Stores discovered class/course/institute data retrieved from live web sources.
No fake or seeded data — records represent actual verified discoveries.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from ..extensions import db


def _generate_id():
    return str(uuid.uuid4())


class ClassListing(db.Model):
    """Represents a discovered class or course offering."""

    __tablename__ = "class_listings"

    id = Column(String(36), primary_key=True, default=_generate_id)

    # Core identifiers
    institute_name = Column(String(512), nullable=False)
    course_name = Column(String(512), nullable=False)

    # Location
    address = Column(Text, nullable=True)
    city = Column(String(256), nullable=True)
    state = Column(String(256), nullable=True)
    country = Column(String(256), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    google_maps_url = Column(Text, nullable=True)

    # Course details
    fees = Column(Float, nullable=True)
    currency = Column(String(16), nullable=True, default="INR")
    duration = Column(Float, nullable=True)
    duration_unit = Column(String(64), nullable=True)  # "weeks", "months", "hours"
    mode = Column(String(64), nullable=True)  # "online", "offline", "hybrid"
    description = Column(Text, nullable=True)
    topics = Column(JSON, nullable=True, default=list)
    skills = Column(JSON, nullable=True, default=list)

    # Contact / online presence
    website_url = Column(Text, nullable=True)
    contact = Column(String(256), nullable=True)

    # Discovery metadata
    source_name = Column(String(256), nullable=True)
    source_url = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    last_checked_at = Column(DateTime(timezone=True), nullable=True)

    # Search context
    search_course = Column(String(512), nullable=True)
    search_location = Column(String(512), nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "institute_name": self.institute_name,
            "course_name": self.course_name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "fees": self.fees,
            "currency": self.currency,
            "duration": self.duration,
            "duration_unit": self.duration_unit,
            "mode": self.mode,
            "description": self.description,
            "topics": self.topics or [],
            "skills": self.skills or [],
            "website_url": self.website_url,
            "contact": self.contact,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "confidence": self.confidence,
            "last_checked_at": self.last_checked_at.isoformat() if self.last_checked_at else None,
            "google_maps_url": self.google_maps_url,
        }

    def __repr__(self):
        return f"<ClassListing {self.institute_name!r} — {self.course_name!r}>"
