"""
EngiPath AI — ResumeAnalysis Model

Stores resume analysis sessions and their results.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey
from ..extensions import db


def _generate_id():
    return str(uuid.uuid4())


class ResumeAnalysis(db.Model):
    """Records resume analysis sessions and their extracted results."""

    __tablename__ = "resume_analyses"

    id = Column(String(36), primary_key=True, default=_generate_id)

    # Link to candidate profile
    candidate_profile_id = Column(
        String(36),
        ForeignKey("candidate_profiles.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Upload metadata (no sensitive content stored)
    original_filename = Column(String(512), nullable=True)
    file_type = Column(String(32), nullable=True)  # "pdf" | "docx"
    file_size_bytes = Column(String(32), nullable=True)

    # Analysis status
    status = Column(String(64), nullable=True, default="pending")
    error_message = Column(Text, nullable=True)

    # Raw extracted profile (JSON)
    extracted_profile = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<ResumeAnalysis {self.id!r} status={self.status!r}>"
