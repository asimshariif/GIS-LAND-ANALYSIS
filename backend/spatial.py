"""Spatial and bounding box analysis helpers."""
import math


def compute_bbox(geometry: dict) -> tuple[float, float, float, float]:
    """Return (min_x, min_y, max_x, max_y) for a GeoJSON geometry."""
    coords = _flatten_coords(geometry)
    if not coords:
        return (0.0, 0.0, 0.0, 0.0)
    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]
    return (min(xs), min(ys), max(xs), max(ys))


def compute_area_sqft(geometry: dict) -> float:
    """Approximate polygon area in square feet via the shoelace formula.

    Assumes WGS-84 lon/lat coordinates and uses an equirectangular approximation.
    """
    if geometry.get("type") not in ("Polygon", "MultiPolygon"):
        return 0.0
    rings = (
        geometry["coordinates"]
        if geometry["type"] == "Polygon"
        else [ring for poly in geometry["coordinates"] for ring in poly]
    )
    if not rings:
        return 0.0
    avg_lat = sum(c[1] for c in rings[0]) / len(rings[0])
    lat_m = 111_139.0
    lon_m = 111_139.0 * math.cos(math.radians(avg_lat))
    total = sum(abs(_shoelace(ring)) for ring in rings)
    area_m2 = total * lat_m * lon_m
    return area_m2 * 10.7639  # m² → ft²


def build_summary_stats(parcels: list[dict]) -> dict:
    """Compute aggregate stats from a list of parcel dicts."""
    if not parcels:
        return {"count": 0}
    areas = [p.get("area_acres") or 0.0 for p in parcels]
    land_uses: dict[str, int] = {}
    for p in parcels:
        lu = p.get("land_use") or "Unknown"
        land_uses[lu] = land_uses.get(lu, 0) + 1
    return {
        "count": len(parcels),
        "total_area_acres": round(sum(areas), 4),
        "avg_area_acres": round(sum(areas) / len(areas), 4),
        "min_area_acres": round(min(areas), 4),
        "max_area_acres": round(max(areas), 4),
        "land_use_breakdown": land_uses,
    }


def _shoelace(ring: list) -> float:
    n = len(ring)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += ring[i][0] * ring[j][1]
        area -= ring[j][0] * ring[i][1]
    return area / 2.0


def _flatten_coords(geometry: dict) -> list:
    geo_type = geometry.get("type", "")
    coords = geometry.get("coordinates", [])
    if geo_type == "Point":
        return [coords]
    if geo_type in ("MultiPoint", "LineString"):
        return list(coords)
    if geo_type in ("MultiLineString", "Polygon"):
        return [pt for ring in coords for pt in ring]
    if geo_type == "MultiPolygon":
        return [pt for poly in coords for ring in poly for pt in ring]
    return []
