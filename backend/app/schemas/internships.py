"""
EngiPath AI — Internship Pydantic Schemas

Validates all requests and responses for the Internship module.
Two completely separate recommendation lists are enforced by schema design.
"""
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------

class InternshipRecommendRequest(BaseModel):
    """
    Request body for POST /api/v1/internships/recommend

    Accepts user profile + optional resume analysis ID.
    """
    branch: str = Field(..., min_length=1, max_length=256, description="Engineering branch")
    year: str = Field(..., min_length=1, max_length=32, description="Current year (e.g., '2nd Year', '3')")
    skills: List[str] = Field(
        ...,
        description="Manually entered skills (used ONLY for skill-based recommendations)",
        min_length=1,
    )
    interests: List[str] = Field(default_factory=list, description="Areas of interest")
    resume_analysis_id: Optional[str] = Field(
        None,
        description="ID from POST /resume/analyze — used for resume-based recommendations",
    )

    @field_validator("skills", mode="before")
    @classmethod
    def clean_skills(cls, v):
        if isinstance(v, list):
            return [s.strip() for s in v if isinstance(s, str) and s.strip()]
        return v

    @field_validator("branch", "year", mode="before")
    @classmethod
    def strip_str(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v


class LiveInternshipSearchRequest(BaseModel):
    """Request body for POST /api/v1/internships/search"""
    branch: str = Field(..., min_length=1, max_length=256)
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    location: Optional[str] = None


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------

class InternshipRecommendation(BaseModel):
    """A single AI-generated internship recommendation."""
    role: str
    company: Optional[str] = None
    skills_needed: List[str] = Field(default_factory=list)
    what_you_can_achieve: List[str] = Field(default_factory=list)
    why_recommended: Optional[str] = None
    match_score: Optional[float] = None
    location: Optional[str] = None
    mode: Optional[str] = None
    eligibility: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[str] = None
    source_url: Optional[str] = None
    application_url: Optional[str] = None

    model_config = {"from_attributes": True}


class LiveInternshipResult(BaseModel):
    """A single live-discovered internship listing."""
    company: str
    role: str
    location: Optional[str] = None
    mode: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    eligibility: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[str] = None
    deadline: Optional[str] = None
    description: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    application_url: Optional[str] = None
    last_checked_at: Optional[str] = None

    model_config = {"from_attributes": True}


class InternshipRecommendMeta(BaseModel):
    branch: str
    year: str
    skill_based_count: int
    resume_based_count: int
    live_count: int


class InternshipRecommendResponse(BaseModel):
    """
    Response schema for internship recommendations.
    Contains THREE completely separate lists — this is enforced by the schema.
    """
    success: bool = True
    data: dict  # Contains: skill_based_recommendations, resume_based_recommendations, live_internships
    meta: InternshipRecommendMeta
