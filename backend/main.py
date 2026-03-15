import io
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import backend.database as db
from backend.llm_service import analyze_parcels
from backend.models import AreaSelectRequest, PolygonSelectRequest, ParcelSetRequest, ReportRequest
from backend.report_gen import generate_pdf_report
import backend.spatial as spatial

load_dotenv()

SQLITE_DB_PATH = os.getenv("SQLITE_SQLITE_DB_PATH", "data/gis_database.db")

app = FastAPI(title="GIS Land Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    db.init_db(SQLITE_DB_PATH)

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}

@app.get("/parcels")
def get_parcels(
    detailslanduse: str | None = Query(None),
    mainlanduse: str | None = Query(None),
    parcelstatus: str | None = Query(None),
    block_id: str | None = Query(None),
) -> list[dict]:
    return db.get_parcels(
        details_landuse=detailslanduse,
        main_landuse=mainlanduse,
        parcel_status=parcelstatus,
        block_id=block_id,
        db_path=SQLITE_DB_PATH
    )

@app.get("/blocks")
def get_all_blocks() -> list[str]:
    return db.get_all_blocks(db_path=SQLITE_DB_PATH)

@app.get("/analysis/summary")
def get_analysis_summary(shop_size_m2: float = Query(120.0)) -> dict:
    parcels = db.query_all_parcels(SQLITE_DB_PATH)
    return spatial.build_summary_stats(parcels, shop_size_m2)

@app.get("/analysis/block/{block_id}")
def get_analysis_block(block_id: str, shop_size_m2: float = Query(120.0)) -> dict:
    parcels = db.get_parcels(block_id=block_id, db_path=SQLITE_DB_PATH)
    return spatial.build_summary_stats(parcels, shop_size_m2)

@app.post("/area-select")
def area_select(request: AreaSelectRequest) -> dict:
    return spatial.analyze_bbox(request.min_lon, request.min_lat, request.max_lon, request.max_lat, request.shop_size_m2)

@app.post("/polygon-select")
def polygon_select(request: PolygonSelectRequest) -> dict:
    coords = [[lon, lat] for lat, lon in request.coordinates]
    if coords and coords[0] != coords[-1]:
        coords.append(coords[0])
    polygon_geojson = {
        "type": "Polygon",
        "coordinates": [coords]
    }
    return spatial.analyze_polygon(polygon_geojson, request.shop_size_m2)

@app.post("/parcel-select")
def parcel_select(request: ParcelSetRequest) -> dict:
    with db.get_connection(SQLITE_DB_PATH) as conn:
        if not request.object_ids:
            return spatial.build_summary_stats([], request.shop_size_m2)
        placeholders = ",".join("?" for _ in request.object_ids)
        try:
            rows = conn.execute(f"SELECT * FROM parcels WHERE id IN ({placeholders})", tuple(request.object_ids)).fetchall()
        except:
            rows = conn.execute(f"SELECT * FROM parcels WHERE PARCEL_ID IN ({placeholders})", tuple(request.object_ids)).fetchall()
            
        parcels = [dict(row) for row in rows]
    return spatial.build_summary_stats(parcels, request.shop_size_m2)

@app.post("/report/text")
def generate_report_text(request: ReportRequest) -> dict:
    if request.block_id and request.block_id.lower() != "all":
        parcels = db.get_parcels(block_id=request.block_id, db_path=SQLITE_DB_PATH)
    else:
        parcels = db.query_all_parcels(SQLITE_DB_PATH)
        
    stats = spatial.build_summary_stats(parcels, request.shop_size_m2)
    try:
        insight = analyze_parcels(stats, extra_context=request.extra_context, shop_size_m2=request.shop_size_m2)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"analysis": insight}

@app.post("/report/pdf")
def generate_report_pdf(request: ReportRequest) -> StreamingResponse:
    if request.block_id and request.block_id.lower() != "all":
        parcels = db.get_parcels(block_id=request.block_id, db_path=SQLITE_DB_PATH)
    else:
        parcels = db.query_all_parcels(SQLITE_DB_PATH)
        
    stats = spatial.build_summary_stats(parcels, request.shop_size_m2)
    report_text = analyze_parcels(stats, extra_context=request.extra_context, shop_size_m2=request.shop_size_m2)
    
    pdf_bytes = generate_pdf_report(stats, report_text)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=land_analysis_report_{request.block_id}.pdf"},
    )
