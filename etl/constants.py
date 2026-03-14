"""Domain and subtype mapping constants for ETL processing."""

SUBTYPE_MAPPINGS: dict[str, str] = {
    "1": "Single Family Residential",
    "2": "Multi-Family Residential",
    "3": "Commercial",
    "4": "Industrial",
    "5": "Agricultural",
    "6": "Vacant Land",
    "7": "Public / Institutional",
    "8": "Open Space / Parks",
    "9": "Mixed Use",
    "10": "Transportation / Utility",
}

DOMAIN_MAPPINGS: dict[str, str] = {
    "SF": "Single Family",
    "MF": "Multi-Family",
    "COM": "Commercial",
    "IND": "Industrial",
    "AG": "Agricultural",
    "VAC": "Vacant",
    "PUB": "Public",
    "OS": "Open Space",
    "RES": "Residential",
    "MIX": "Mixed Use",
    "TR": "Transportation",
    "UT": "Utility",
    "INST": "Institutional",
    "REC": "Recreation",
}
