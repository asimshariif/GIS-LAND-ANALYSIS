from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class ParcelStats(BaseModel):
    count: int
    total_area_acres: float
    avg_area_acres: float
    min_area_acres: float
    max_area_acres: float
    land_use_breakdown: dict[str, int]


class AnalysisRequest(BaseModel):
    provider: Literal["gemini", "groq", "ollama"] = "ollama"


class AnalysisResponse(BaseModel):
    provider: str
    analysis: str
