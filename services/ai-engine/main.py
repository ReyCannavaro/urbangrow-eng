from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    TelemetryInput,
    AnomalyResponse,
    HarvestRequest,
    HarvestResponse,
    ClimateScoreRequest,
    ClimateScoreResponse,
)
from anomaly_detector import detector
from harvest_predictor import predictor
from climate_scorer import scorer
from synthetic_data import generate_sidoarjo_microclimate_samples


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize pre-warmed model state
    print("[AI-ENGINE] Initializing UrbanGrow Predictive Models...")
    yield
    print("[AI-ENGINE] Shutting down AI Engine microservice.")


app = FastAPI(
    title="UrbanGrow AI Engine Microservice",
    version="1.0.0",
    description="Climate-Adaptive Aquaponic Predictive Analytics & Advisory Engine",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "service": "UrbanGrow AI Engine",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "anomaly": "POST /predict/anomaly",
            "harvest": "POST /predict/harvest",
            "climate_score": "POST /score/climate-adaptation",
            "synthetic_telemetry": "GET /data/synthetic-microclimate",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "inference_engine": "heuristic_and_xgboost"}


@app.post("/predict/anomaly", response_model=AnomalyResponse)
def evaluate_anomaly(telemetry: TelemetryInput):
    try:
        return detector.evaluate(telemetry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/harvest", response_model=HarvestResponse)
def forecast_harvest(req: HarvestRequest):
    try:
        return predictor.predict(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/score/climate-adaptation", response_model=ClimateScoreResponse)
def compute_climate_score(req: ClimateScoreRequest):
    try:
        return scorer.calculate(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/data/synthetic-microclimate")
def get_synthetic_data(hours: int = 24):
    return {
        "location": "Sidoarjo, East Java (Tropics)",
        "sample_count": hours,
        "data": generate_sidoarjo_microclimate_samples(hours),
    }
