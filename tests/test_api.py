from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_get_parcels_empty():
    with patch("backend.main.query_all_parcels", return_value=[]):
        response = client.get("/parcels")
    assert response.status_code == 200
    assert response.json() == []


def test_get_parcel_stats_empty():
    with patch("backend.main.query_all_parcels", return_value=[]):
        response = client.get("/parcels/stats")
    assert response.status_code == 200
    assert response.json()["count"] == 0


def test_get_parcels_with_bbox():
    with patch("backend.main.query_parcels_in_bbox", return_value=[]) as mock_bbox:
        response = client.get("/parcels?min_x=-120&min_y=30&max_x=-110&max_y=40")
    assert response.status_code == 200
    mock_bbox.assert_called_once()


def test_analyze_llm_unavailable():
    with (
        patch("backend.main.query_all_parcels", return_value=[]),
        patch("backend.main.analyze_parcels", side_effect=Exception("LLM unavailable")),
    ):
        response = client.post("/analyze", json={"provider": "ollama"})
    assert response.status_code == 503
    assert "LLM unavailable" in response.json()["detail"]


def test_analyze_returns_insight():
    with (
        patch("backend.main.query_all_parcels", return_value=[]),
        patch("backend.main.analyze_parcels", return_value="Good land use distribution."),
    ):
        response = client.post("/analyze", json={"provider": "ollama"})
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "ollama"
    assert "Good land use" in data["analysis"]

