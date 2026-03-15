from typing import Literal, Optional
from pydantic import BaseModel

class AreaSelectRequest(BaseModel):
    min_lat: float
    min_lon: float
    max_lat: float
    max_lon: float
    shop_size_m2: float = 120.0

class PolygonSelectRequest(BaseModel):
    coordinates: list   # list of [lat, lon] pairs
    shop_size_m2: float = 120.0

class ParcelSetRequest(BaseModel):
    object_ids: list    # list of OBJECTID integers
    shop_size_m2: float = 120.0

class ReportRequest(BaseModel):
    block_id: str
    extra_context: Optional[str] = ""
    shop_size_m2: float = 120.0

class AnalysisRequest(BaseModel):
    provider: Literal["gemini", "groq", "ollama"] = "ollama"
    shop_size_m2: float = 120.0

class AnalysisResponse(BaseModel):
    provider: str
    analysis: str

class HealthResponse(BaseModel):
    status: str
