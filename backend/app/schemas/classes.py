"""
EngiPath AI — Class/Course Pydantic Schemas

Validates all requests and responses for the Classes module.
"""
from __future__ import annotations
from typing import List, Optional, Any
from pydantic import BaseModel, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------

class ClassSearchRequest(BaseModel):
    """Request body for POST /api/v1/classes/search"""
    course: str = Field(..., min_length=1, max_length=256, description="Free-text course name")
    location: str = Field(..., min_length=1, max_length=256, description="City, state, or country")

    @field_validator("course", "location", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator("course", "location", mode="after")
    @classmethod
    def not_empty_after_strip(cls, v: str) -> str:
        if not v:
            raise ValueError("Field cannot be empty or whitespace only")
        return v


class CompareRequest(BaseModel):
    """Request body for POST /api/v1/classes/compare — accepts exactly 2 or 3 class IDs."""
    class_ids: List[str] = Field(
        ...,
        description="List of 2 or 3 class IDs to compare",
        min_length=2,
        max_length=3,
    )

    @field_validator("class_ids", mode="after")
    @classmethod
    def validate_count(cls, v: List[str]) -> List[str]:
        if len(v) < 2:
            raise ValueError("At least 2 class IDs are required for comparison")
        if len(v) > 3:
            raise ValueError("At most 3 class IDs can be compared at once")
        # Strip duplicates
        seen = set()
        result = []
        for cid in v:
            cid = cid.strip()
            if not cid:
                raise ValueError("Class ID cannot be empty")
            if cid in seen:
                raise ValueError(f"Duplicate class ID: {cid}")
            seen.add(cid)
            result.append(cid)
        return result


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------

class ClassResult(BaseModel):
    """Single class/course result returned to the frontend."""
    id: str
    institute_name: str
    course_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fees: Optional[float] = None
    currency: Optional[str] = "INR"
    duration: Optional[float] = None
    duration_unit: Optional[str] = None
    mode: Optional[str] = None
    description: Optional[str] = None
    topics: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    website_url: Optional[str] = None
    contact: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    last_checked_at: Optional[str] = None
    confidence: Optional[float] = None
    google_maps_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ClassSearchMeta(BaseModel):
    course: str
    location: str
    total_results: int
    search_duration_ms: Optional[float] = None


class ClassSearchResponse(BaseModel):
    success: bool = True
    data: List[ClassResult]
    meta: ClassSearchMeta


class ComparisonTable(BaseModel):
    """A single row in the comparison table."""
    attribute: str
    values: List[Any]  # one value per class


class CompareResponse(BaseModel):
    """AI-powered class comparison response."""
    success: bool = True
    data: dict = Field(default_factory=dict)
    # data contains: comparison_table, best_value, best_curriculum,
    #                best_location, overall_recommendation, reasoning, classes
