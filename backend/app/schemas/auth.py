"""
EngiPath AI — Authentication Pydantic Schemas
"""
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
import re

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


class RegisterRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=128)
    full_name: Optional[str] = Field(None, max_length=128)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    college: Optional[str] = Field(None, max_length=128)
    branch: Optional[str] = Field(None, max_length=128)
    year: Optional[str] = Field(None, max_length=32)
    graduation_year: Optional[int] = None
    target_role: Optional[str] = Field(None, max_length=128)
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, clean):
            raise ValueError("Invalid email address format")
        return clean

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) else v

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) else v


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, clean):
            raise ValueError("Invalid email address format")
        return clean


class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    branch: Optional[str] = None
    year: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool = True
    data: dict  # contains: token, user
