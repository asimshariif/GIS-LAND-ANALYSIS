"""SQLite query helpers."""
import sqlite3
from contextlib import contextmanager
from typing import Generator

DB_PATH = "data/gis_database.db"


@contextmanager
def get_connection(db_path: str = DB_PATH) -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db(db_path: str = DB_PATH) -> None:
    """Create the parcels table if it does not exist."""
    with get_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS parcels (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                parcel_id     TEXT,
                owner         TEXT,
                address       TEXT,
                land_use      TEXT,
                zoning        TEXT,
                area_sqft     REAL,
                area_acres    REAL,
                subtype       TEXT,
                geometry_json TEXT,
                min_x         REAL,
                min_y         REAL,
                max_x         REAL,
                max_y         REAL
            )
        """)
        conn.commit()


def query_all_parcels(db_path: str = DB_PATH) -> list[dict]:
    with get_connection(db_path) as conn:
        rows = conn.execute("SELECT * FROM parcels").fetchall()
        return [dict(row) for row in rows]


def query_parcels_in_bbox(
    min_x: float, min_y: float, max_x: float, max_y: float, db_path: str = DB_PATH
) -> list[dict]:
    with get_connection(db_path) as conn:
        rows = conn.execute(
            """
            SELECT * FROM parcels
            WHERE max_x >= ? AND min_x <= ?
              AND max_y >= ? AND min_y <= ?
            """,
            (min_x, max_x, min_y, max_y),
        ).fetchall()
        return [dict(row) for row in rows]


def query_parcel_stats(db_path: str = DB_PATH) -> dict:
    with get_connection(db_path) as conn:
        row = conn.execute(
            """
            SELECT
                COUNT(*)       AS total_parcels,
                SUM(area_acres)  AS total_area_acres,
                AVG(area_acres)  AS avg_area_acres,
                MIN(area_acres)  AS min_area_acres,
                MAX(area_acres)  AS max_area_acres
            FROM parcels
            """
        ).fetchone()
        return dict(row) if row else {}
