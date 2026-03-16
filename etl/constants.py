"""ETL constants - SUBTYPE mapping as single source of truth."""

# Coordinate Reference System for metric calculations
METRIC_CRS = "EPSG:32637"

# Queryable categories for the search engine
QUERYABLE_CATEGORIES = ["Mosque", "Commercial", "Residential", "Park", "Educational", "Government"]

# Parcel status mapping
PARCEL_STATUS_MAP = {
    0: "Vacant",
    1: "Under Construction",
    2: "Developed",
    3: "Reserved",
    6: "Planned",
    8: "Other",
}

# SUBTYPE_MAP: Single source of truth for classification
# Each entry contains: label_en, label_ar, LANDUSE_CATEGORY, IS_COMMERCIAL, CAPACITY_RATE, CAPACITY_UNIT
SUBTYPE_MAP = {
    0: {
        "label_en": "Unknown",
        "label_ar": "غير معروف",
        "LANDUSE_CATEGORY": "Unknown",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 0,
        "CAPACITY_UNIT": "",
    },
    101000: {
        "label_en": "Residential Villa",
        "label_ar": "فيلا سكنية",
        "LANDUSE_CATEGORY": "Residential",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 10,
        "CAPACITY_UNIT": "m² per unit",
    },
    1001000: {
        "label_en": "Commercial Plot",
        "label_ar": "قطعة تجارية",
        "LANDUSE_CATEGORY": "Commercial",
        "IS_COMMERCIAL": True,
        "CAPACITY_RATE": 120,
        "CAPACITY_UNIT": "m² per shop",
    },
    201000: {
        "label_en": "Industrial",
        "label_ar": "صناعي",
        "LANDUSE_CATEGORY": "Government",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 50,
        "CAPACITY_UNIT": "m² per employee",
    },
    207000: {
        "label_en": "Warehouse",
        "label_ar": "مستودع",
        "LANDUSE_CATEGORY": "Government",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 50,
        "CAPACITY_UNIT": "m² per employee",
    },
    301000: {
        "label_en": "Mosque",
        "label_ar": "مسجد",
        "LANDUSE_CATEGORY": "Mosque",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 8,
        "CAPACITY_UNIT": "m² per worshipper",
    },
    302000: {
        "label_en": "Health Facility",
        "label_ar": "منشأة صحية",
        "LANDUSE_CATEGORY": "Government",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 50,
        "CAPACITY_UNIT": "m² per employee",
    },
    303000: {
        "label_en": "Educational Institution",
        "label_ar": "مؤسسة تعليمية",
        "LANDUSE_CATEGORY": "Educational",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 6,
        "CAPACITY_UNIT": "m² per student",
    },
    304000: {
        "label_en": "Government Building",
        "label_ar": "مبنى حكومي",
        "LANDUSE_CATEGORY": "Government",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 50,
        "CAPACITY_UNIT": "m² per employee",
    },
    306000: {
        "label_en": "Park",
        "label_ar": "حديقة",
        "LANDUSE_CATEGORY": "Park",
        "IS_COMMERCIAL": False,
        "CAPACITY_RATE": 15,
        "CAPACITY_UNIT": "m² per visitor",
    },
    401000: {
        "label_en": "Mixed Use",
        "label_ar": "متعدد الاستخدام",
        "LANDUSE_CATEGORY": "Commercial",
        "IS_COMMERCIAL": True,
        "CAPACITY_RATE": 120,
        "CAPACITY_UNIT": "m² per shop",
    },
    405000: {
        "label_en": "Retail",
        "label_ar": "تجزئة",
        "LANDUSE_CATEGORY": "Commercial",
        "IS_COMMERCIAL": True,
        "CAPACITY_RATE": 120,
        "CAPACITY_UNIT": "m² per shop",
    },
}
