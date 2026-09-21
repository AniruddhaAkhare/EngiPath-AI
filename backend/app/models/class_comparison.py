"""
EngiPath AI — ClassComparison Model

Stores comparison sessions between 2–3 class listings.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON
from ..extensions import db


def _generate_id():
    return str(uuid.uuid4())


class ClassComparison(db.Model):
    """Records AI-powered class comparison sessions."""

    __tablename__ = "class_comparisons"

    id = Column(String(36), primary_key=True, default=_generate_id)

    # IDs of compared classes (2–3)
    class_ids = Column(JSON, nullable=False, default=list)

    # AI-generated comparison output
    comparison_table = Column(JSON, nullable=True)
    best_value = Column(String(512), nullable=True)
    best_curriculum = Column(String(512), nullable=True)
    best_location = Column(String(512), nullable=True)
    overall_recommendation = Column(Text, nullable=True)
    reasoning = Column(Text, nullable=True)

    # Raw AI response for debugging
    raw_ai_response = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "class_ids": self.class_ids,
            "comparison_table": self.comparison_table,
            "best_value": self.best_value,
            "best_curriculum": self.best_curriculum,
            "best_location": self.best_location,
            "overall_recommendation": self.overall_recommendation,
            "reasoning": self.reasoning,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<ClassComparison {self.id!r} classes={self.class_ids}>"
