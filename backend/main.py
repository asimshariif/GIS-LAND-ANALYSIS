import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import StreamingResponse

import backend.database as db
from backend.llm_service import analyze_parcels
from backend.models import AnalysisRequest, AnalysisResponse, HealthResponse
from backend.report_gen import generate_pdf_report
import backend.spatial as spatial

load_dotenv()

DB_PATH = os.getenv("DB_PATH", "data/gis_database.db")

app = FastAPI(title="GIS Land Analysis API", version="1.0.0")

@app.on_event("startup")
def on_startup() -> None:
    db.init_db(DB_PATH)

@app.get("/health", response_model=HealthResponse)
def health_check() -> dict:
    return {"status": "ok"}

@app.get("/parcels")
def get_parcels(
    details_landuse: str | None = Query(None),
    main_landuse: str | None = Query(None),
    parcel_status: str | None = Query(None),
    block_id: str | None = Query(None),
) -> list[dict]:
    return db.get_parcels(
        details_landuse=details_landuse,
        main_landuse=main_landuse,
        parcel_status=parcel_status,
        block_id=block_id,
        db_path=DB_PATH
    )

@app.get("/blocks/summary")
def get_block_summary(block_id: str | None = Query(None)) -> list[dict]:
    return db.get_block_summary(block_id, db_path=DB_PATH)

@app.get("/parcels/bbox")
def get_parcels_in_bbox(
    min_x: float = Query(...),
    min_y: float = Query(...),
    max_x: float = Query(...),
    max_y: float = Query(...)
) -> list[dict]:
    return db.get_parcels_in_bbox(min_x, min_y, max_x, max_y, db_path=DB_PATH)

@app.post("/parcels/polygon")
def get_parcels_in_polygon(polygon: dict = Body(...)) -> list[dict]:
    return db.get_parcels_in_polygon(polygon, db_path=DB_PATH)

@app.get("/blocks")
def get_all_blocks() -> list[str]:
    return db.get_all_blocks(db_path=DB_PATH)

@app.get("/analysis/bbox")
def analyze_bbox(
    min_x: float = Query(...),
    min_y: float = Query(...),
    max_x: float = Query(...),
    max_y: float = Query(...)
) -> dict:
    return spatial.analyze_bbox(min_x, min_y, max_x, max_y)

@app.post("/analysis/polygon")
def analyze_polygon(polygon: dict = Body(...)) -> dict:
    return spatial.analyze_polygon(polygon)

@app.post("/analysis/parcel_set")
def analyze_parcel_set(parcels: list[dict] = Body(...)) -> dict:
    return spatial.analyze_parcel_set(parcels)


@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest) -> AnalysisResponse:
    parcels = db.query_all_parcels(DB_PATH)
    summary = spatial.build_summary_stats(parcels)
    try:
        insight = analyze_parcels(summary, provider=request.provider)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return AnalysisResponse(provider=request.provider, analysis=insight)

@app.get("/report")
def download_report() -> StreamingResponse:
    parcels = db.query_all_parcels(DB_PATH)
    stats = spatial.build_summary_stats(parcels)
    pdf_bytes = generate_pdf_report(stats)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=land_analysis_report.pdf"},
    )
