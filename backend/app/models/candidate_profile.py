"""
EngiPath AI — CandidateProfile Model

Stores structured candidate profiles extracted from resume analysis.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON
from ..extensions import db


def _generate_id():
    return str(uuid.uuid4())


class CandidateProfile(db.Model):
    """Structured candidate profile generated from resume + user inputs."""

    __tablename__ = "candidate_profiles"

    id = Column(String(36), primary_key=True, default=_generate_id)

    # User-provided fields
    branch = Column(String(256), nullable=True)
    year = Column(String(64), nullable=True)
    skills = Column(JSON, nullable=True, default=list)           # manually entered
    interests = Column(JSON, nullable=True, default=list)

    # Resume-extracted fields
    resume_skills = Column(JSON, nullable=True, default=list)    # from resume text
    technologies = Column(JSON, nullable=True, default=list)
    projects = Column(JSON, nullable=True, default=list)
    experience = Column(JSON, nullable=True, default=list)
    domains = Column(JSON, nullable=True, default=list)
    education = Column(JSON, nullable=True, default=list)

    # Resume metadata
    original_filename = Column(String(512), nullable=True)
    resume_text_hash = Column(String(64), nullable=True)  # sha256 of extracted text

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "branch": self.branch,
            "year": self.year,
            "skills": self.skills or [],
            "interests": self.interests or [],
            "resume_skills": self.resume_skills or [],
            "technologies": self.technologies or [],
            "projects": self.projects or [],
            "experience": self.experience or [],
            "domains": self.domains or [],
            "education": self.education or [],
        }

    def __repr__(self):
        return f"<CandidateProfile {self.id!r} branch={self.branch!r}>"
