"""Spatial and bounding box analysis helpers."""
from backend.database import get_parcels_in_bbox, get_parcels_in_polygon

def build_summary_stats(parcels: list[dict]) -> dict:
    if not parcels:
        return {
            "total_parcels": 0,
            "total_area_m2": 0.0,
            "landuse_category": {},
            "mainlanduse_label": {},
            "vacant_count": 0,
            "developed_count": 0,
            "total_mosque_capacity": 0,
            "total_shops": 0,
            "subtypes": [],
            "overlapping_block_ids": []
        }
        
    total_area_m2 = 0.0
    landuse_cat_counts = {}
    mainlanduse_counts = {}
    vacant_count = 0
    developed_count = 0
    total_mosque_capacity = 0
    total_shops = 0
    subtypes = set()
    block_ids = set()
    
    for p in parcels:
        area = p.get("AREA_M2") or 0.0
        total_area_m2 += float(area)
        
        luc = p.get("LANDUSE_CATEGORY") or "Unknown"
        landuse_cat_counts[luc] = landuse_cat_counts.get(luc, 0) + 1
        
        mlu = p.get("MAINLANDUSE_LABEL_EN") or "Unknown"
        mainlanduse_counts[mlu] = mainlanduse_counts.get(mlu, 0) + 1
        
        status = p.get("PARCEL_STATUS_LABEL") or "Unknown"
        if status == "Vacant":
            vacant_count += 1
        elif status == "Developed":
            developed_count += 1
            
        if luc == "Mosque":
            total_mosque_capacity += int(p.get("CAPACITY_ESTIMATED") or 0)
            
        total_shops += int(p.get("SHOPS_ESTIMATED") or 0)
        
        subtype = p.get("SUBTYPE_LABEL_EN")
        if subtype and subtype != "Unknown":
            subtypes.add(subtype)
            
        block_id = p.get("BLOCK_ID")
        if block_id and block_id != "Unknown":
            block_ids.add(block_id)
            
    return {
        "total_parcels": len(parcels),
        "total_area_m2": round(total_area_m2, 2),
        "landuse_category": landuse_cat_counts,
        "mainlanduse_label": mainlanduse_counts,
        "vacant_count": vacant_count,
        "developed_count": developed_count,
        "total_mosque_capacity": total_mosque_capacity,
        "total_shops": total_shops,
        "subtypes": sorted(list(subtypes)),
        "overlapping_block_ids": sorted(list(block_ids))
    }

def analyze_bbox(min_x: float, min_y: float, max_x: float, max_y: float) -> dict:
    parcels = get_parcels_in_bbox(min_x, min_y, max_x, max_y)
    return build_summary_stats(parcels)

def analyze_polygon(polygon_geojson: dict) -> dict:
    parcels = get_parcels_in_polygon(polygon_geojson)
    return build_summary_stats(parcels)

def analyze_parcel_set(parcels: list[dict]) -> dict:
    return build_summary_stats(parcels)
