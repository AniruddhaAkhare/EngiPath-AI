"""
EngiPath AI — Maps Pydantic Schemas
"""
from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field


class GeocodeRequest(BaseModel):
    address: str = Field(..., min_length=1, max_length=512)


class GeocodeResponse(BaseModel):
    success: bool = True
    data: dict  # lat, lon, display_name, google_maps_url


class ReverseGeocodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class DirectionsRequest(BaseModel):
    origin_lat: float = Field(..., ge=-90, le=90)
    origin_lon: float = Field(..., ge=-180, le=180)
    dest_lat: float = Field(..., ge=-90, le=90)
    dest_lon: float = Field(..., ge=-180, le=180)
    profile: str = Field(default="driving", pattern="^(driving|walking|cycling)$")


class DirectionsResponse(BaseModel):
    success: bool = True
    data: dict  # distance_m, duration_s, route geometry
