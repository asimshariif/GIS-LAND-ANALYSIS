import json
import sqlite3
import tempfile
from pathlib import Path

from etl.constants import DOMAIN_MAPPINGS, SUBTYPE_MAPPINGS
from etl.processor import (
    _compute_area_sqft,
    _compute_bbox,
    _feature_to_record,
    process_geojson_to_sqlite,
)

_SAMPLE_FEATURE = {
    "type": "Feature",
    "properties": {
        "PARCEL_ID": "APN-001",
        "OWNER": "Jane Smith",
        "ADDRESS": "456 Oak Ave",
        "LANDUSE": "SF",
        "ZONING": "R1",
        "SUBTYPE": "1",
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [-117.0, 34.0],
                [-117.0, 34.001],
                [-116.999, 34.001],
                [-116.999, 34.0],
                [-117.0, 34.0],
            ]
        ],
    },
}


def test_subtype_mappings_populated():
    assert len(SUBTYPE_MAPPINGS) > 0
    assert SUBTYPE_MAPPINGS["1"] == "Single Family Residential"


def test_domain_mappings_populated():
    assert len(DOMAIN_MAPPINGS) > 0
    assert DOMAIN_MAPPINGS["SF"] == "Single Family"


def test_feature_to_record_fields():
    record = _feature_to_record(_SAMPLE_FEATURE)
    assert record["parcel_id"] == "APN-001"
    assert record["owner"] == "Jane Smith"
    assert record["land_use"] == "Single Family"
    assert record["subtype"] == "Single Family Residential"
    assert record["zoning"] == "R1"


def test_feature_to_record_area_positive():
    record = _feature_to_record(_SAMPLE_FEATURE)
    assert record["area_sqft"] > 0
    assert record["area_acres"] > 0
    assert abs(record["area_sqft"] / 43_560 - record["area_acres"]) < 0.0001


def test_compute_bbox():
    geo = _SAMPLE_FEATURE["geometry"]
    min_x, min_y, max_x, max_y = _compute_bbox(geo)
    assert min_x < max_x
    assert min_y < max_y


def test_compute_area_sqft_nonzero():
    area = _compute_area_sqft(_SAMPLE_FEATURE["geometry"])
    assert area > 0


def test_compute_area_sqft_unsupported_type():
    assert _compute_area_sqft({"type": "Point", "coordinates": [0, 0]}) == 0.0


def test_process_geojson_to_sqlite_roundtrip():
    geojson = {"type": "FeatureCollection", "features": [_SAMPLE_FEATURE]}
    with tempfile.TemporaryDirectory() as tmpdir:
        geojson_path = Path(tmpdir) / "parcels.geojson"
        sqlite_path = Path(tmpdir) / "parcels.db"
        geojson_path.write_text(json.dumps(geojson), encoding="utf-8")

        process_geojson_to_sqlite(str(geojson_path), str(sqlite_path))

        conn = sqlite3.connect(str(sqlite_path))
        rows = conn.execute("SELECT * FROM parcels").fetchall()
        conn.close()

    assert len(rows) == 1
    # parcel_id is column index 1
    assert rows[0][1] == "APN-001"

