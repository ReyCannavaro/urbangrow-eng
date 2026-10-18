from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "UrbanGrow AI Engine"


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_anomaly_prediction_optimal():
    payload = {
        "ph": 6.85,
        "tds_ppm": 620.0,
        "water_temp_c": 24.8,
        "air_temp_c": 28.5,
        "humidity_pct": 72.0,
        "lux": 18500.0,
        "dissolved_oxygen": 5.8
    }
    response = client.post("/predict/anomaly", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_anomaly"] is False
    assert data["risk_level"] == "LOW"


def test_anomaly_prediction_critical_acidic():
    payload = {
        "ph": 5.2,
        "tds_ppm": 620.0,
        "water_temp_c": 24.8,
        "air_temp_c": 28.5,
        "humidity_pct": 72.0,
        "lux": 18500.0,
        "dissolved_oxygen": 5.8
    }
    response = client.post("/predict/anomaly", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_anomaly"] is True
    assert data["risk_level"] == "CRITICAL"


def test_harvest_prediction():
    payload = {
        "crop_type": "pakcoy",
        "days_since_planting": 14,
        "current_water_temp_c": 25.0,
        "daily_lux_hours": 12.0
    }
    response = client.post("/predict/harvest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crop_type"] == "pakcoy"
    assert data["estimated_days_to_harvest"] > 0


def test_climate_score_computation():
    payload = {
        "telemetry": {
            "ph": 7.0,
            "tds_ppm": 650.0,
            "water_temp_c": 25.0,
            "air_temp_c": 28.0,
            "humidity_pct": 70.0,
            "lux": 18000.0,
            "dissolved_oxygen": 6.2
        },
        "photoperiod_hours": 12.0,
        "aerator_active": True
    }
    response = client.post("/score/climate-adaptation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["climate_adaptation_score"] >= 80.0
