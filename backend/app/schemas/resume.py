"""
EngiPath AI — Resume Pydantic Schemas
"""
from __future__ import annotations
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class CandidateProfileSchema(BaseModel):
    """Structured candidate profile extracted from resume + user inputs."""
    branch: Optional[str] = None
    year: Optional[str] = None
    skills: List[str] = Field(default_factory=list)           # manually entered
    resume_skills: List[str] = Field(default_factory=list)    # from resume text
    technologies: List[str] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    domains: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ResumeAnalyzeResponse(BaseModel):
    """Response for POST /api/v1/resume/analyze"""
    success: bool = True
    data: dict  # Contains: analysis_id, profile, extracted_text_length


class ResumeUploadResponse(BaseModel):
    """Response for POST /api/v1/resume/upload"""
    success: bool = True
    data: dict  # Contains: file_id, filename, file_type, size_bytes, message
