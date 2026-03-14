import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse

from backend.database import init_db, query_all_parcels, query_parcels_in_bbox
from backend.llm_service import analyze_parcels
from backend.models import AnalysisRequest, AnalysisResponse, HealthResponse
from backend.report_gen import generate_pdf_report
from backend.spatial import build_summary_stats

load_dotenv()

DB_PATH = os.getenv("DB_PATH", "data/gis_database.db")

app = FastAPI(title="GIS Land Analysis API", version="1.0.0")


@app.on_event("startup")
def on_startup() -> None:
    init_db(DB_PATH)


@app.get("/health", response_model=HealthResponse)
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/parcels")
def get_parcels(
    min_x: float | None = Query(None),
    min_y: float | None = Query(None),
    max_x: float | None = Query(None),
    max_y: float | None = Query(None),
) -> list[dict]:
    if all(v is not None for v in (min_x, min_y, max_x, max_y)):
        return query_parcels_in_bbox(min_x, min_y, max_x, max_y, DB_PATH)  # type: ignore[arg-type]
    return query_all_parcels(DB_PATH)


@app.get("/parcels/stats")
def get_parcel_stats() -> dict:
    parcels = query_all_parcels(DB_PATH)
    return build_summary_stats(parcels)


@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest) -> AnalysisResponse:
    parcels = query_all_parcels(DB_PATH)
    summary = build_summary_stats(parcels)
    try:
        insight = analyze_parcels(summary, provider=request.provider)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return AnalysisResponse(provider=request.provider, analysis=insight)


@app.get("/report")
def download_report() -> StreamingResponse:
    parcels = query_all_parcels(DB_PATH)
    stats = build_summary_stats(parcels)
    pdf_bytes = generate_pdf_report(stats)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=land_analysis_report.pdf"},
    )
