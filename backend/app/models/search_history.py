"""
EngiPath AI — SearchHistory Model

Tracks user searches for analytics and optional caching of search metadata.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON, Float
from ..extensions import db


def _generate_id():
    return str(uuid.uuid4())


class SearchHistory(db.Model):
    """Records metadata about user searches (classes and internships)."""

    __tablename__ = "search_history"

    id = Column(String(36), primary_key=True, default=_generate_id)

    # Type of search
    search_type = Column(String(64), nullable=False)  # "classes" | "internships" | "live_internships"

    # Common search parameters
    query_params = Column(JSON, nullable=True, default=dict)

    # Results metadata
    result_count = Column(Integer, nullable=True)
    duration_ms = Column(Float, nullable=True)

    # Status
    status = Column(String(64), nullable=True, default="success")  # "success" | "partial" | "failed"
    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<SearchHistory {self.search_type!r} results={self.result_count}>"
