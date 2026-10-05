---
name: ai-iot-analytics
description: Comprehensive AI, machine learning, and predictive analytics skill for the UrbanGrow aquaponics AI engine. Covers Python, FastAPI, Scikit-Learn, XGBoost, time-series anomaly detection (Isolation Forest, rolling Z-score), harvest forecasting, nutrient optimization, model serialization with Joblib/ONNX, and seamless ElysiaJS backend integration.
---

# 🧠 AI Engine & Predictive IoT Analytics (Python & FastAPI)

> **Core Focus**: Machine learning architectures, predictive water quality modeling, growth forecasting, and automated nutrient optimization for **UrbanGrow Smart Aquaponics** in `services/ai-engine`.

---

## 🏗️ 1. ARCHITECTURE & FOLDER STRUCTURE (`services/ai-engine`)

```
services/ai-engine/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── anomaly.py       # Real-time sensor anomaly detection
│   │   │   │   ├── forecast.py      # Growth & harvest time-to-maturity
│   │   │   │   └── advisory.py      # Nutrient & environment recommendations
│   │   │   └── router.py            # API V1 router aggregation
│   ├── core/
│   │   ├── config.py                # Pydantic v2 settings (env variables)
│   │   └── exceptions.py            # Custom HTTP exceptions
│   ├── models/
│   │   ├── schemas.py               # Pydantic request & response DTOs
│   │   └── registry.py              # ML model loader & cache
│   ├── services/
│   │   ├── anomaly_detector.py      # Isolation Forest / Multi-variate pipeline
│   │   ├── growth_forecaster.py     # XGBoost regressor for plant/fish biomass
│   │   └── rule_engine.py           # Biological expert rules & thresholds
│   └── main.py                      # FastAPI bootstrap
├── artifacts/                       # Pre-trained models (.joblib / .onnx)
│   ├── anomaly_pipeline_v1.joblib
│   └── lettuce_harvest_model_v1.joblib
├── tests/
├── Dockerfile
├── moon.yml                         # Moonrepo task definition
├── pyproject.toml / requirements.txt
└── README.md
```

---

## 🚨 2. WATER QUALITY ANOMALY DETECTION

Aquaponics systems have biological interdependencies: e.g., decaying organic matter drives down pH and oxygen while spiking ammonia/TDS.

### Multi-Variate Anomaly Pipeline (Isolation Forest + Rolling Statistics)
```python
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
from pydantic import BaseModel, Field
from typing import List, Optional

class SensorPayload(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0)
    tds: float = Field(..., ge=0.0, le=5000.0)
    water_temperature: float = Field(..., ge=0.0, le=60.0)
    air_temperature: float = Field(..., ge=-10.0, le=70.0)
    humidity: float = Field(..., ge=0.0, le=100.0)
    light_intensity: float = Field(..., ge=0.0, le=100000.0)

class AnomalyResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float # -1.0 to 1.0 (lower is more anomalous)
    severity: str        # "normal" | "warning" | "critical"
    flagged_features: List[str]
    root_cause_hint: Optional[str]

class AquaponicsAnomalyEngine:
    def __init__(self, model_path: str = "artifacts/anomaly_pipeline_v1.joblib"):
        self.feature_names = ["ph", "tds", "water_temperature", "air_temperature", "humidity", "light_intensity"]
        try:
            self.model: IsolationForest = joblib.load(model_path)
        except Exception:
            # Fallback initialization with aquaponic prior contamination rate
            self.model = IsolationForest(contamination=0.03, random_state=42)
            self._fit_default_baseline()

    def _fit_default_baseline(self):
        # Generate baseline synthetic normal distribution for aquaponics
        np.random.seed(42)
        normal_data = pd.DataFrame({
            "ph": np.random.normal(7.0, 0.3, 1000),
            "tds": np.random.normal(550, 60, 1000),
            "water_temperature": np.random.normal(24.5, 1.5, 1000),
            "air_temperature": np.random.normal(27.0, 2.0, 1000),
            "humidity": np.random.normal(65.0, 7.0, 1000),
            "light_intensity": np.random.normal(800, 200, 1000),
        })
        self.model.fit(normal_data)

    def evaluate(self, reading: SensorPayload) -> AnomalyResult:
        df = pd.DataFrame([reading.model_dump()])
        score = float(self.model.decision_function(df)[0])
        pred = int(self.model.predict(df)[0]) # -1 = anomaly, 1 = normal

        flagged = []
        hint = None

        # Feature level boundary inspection
        if reading.ph < 6.4:
            flagged.append("ph_critically_low")
            hint = "Risk of biofilter nitrification halt and fish acidosis"
        elif reading.ph > 7.8:
            flagged.append("ph_critically_high")
            hint = "Iron and trace mineral lockout for plants"

        if reading.water_temperature > 28.5:
            flagged.append("water_temp_high")
            hint = "Depleted dissolved oxygen risk; check aerator"

        if reading.tds < 300:
            flagged.append("tds_depleted")
            hint = "Nutrient solution deficiency; dosing required"
        elif reading.tds > 1000:
            flagged.append("tds_excessive")
            hint = "High salt/nutrient concentration; add clean water"

        is_anomaly = pred == -1 or len(flagged) > 0
        severity = "normal"
        if is_anomaly:
            severity = "critical" if len(flagged) >= 2 or score < -0.15 else "warning"

        return AnomalyResult(
            is_anomaly=is_anomaly,
            anomaly_score=round(score, 4),
            severity=severity,
            flagged_features=flagged,
            root_cause_hint=hint
        )
```

---

## 📈 3. HARVEST & GROWTH PREDICTION (XGBOOST REGRESSOR)

Predict days remaining until harvest based on cumulative thermal units (Growing Degree Days - GDD) and lighting history:

```python
class HarvestPredictionInput(BaseModel):
    crop_type: str = "lettuce_butterhead"
    days_since_germination: int
    avg_daily_light_hours: float
    avg_water_temp: float
    avg_tds: float

class HarvestPredictionOutput(BaseModel):
    estimated_days_to_harvest: int
    optimal_harvest_date: str
    target_biomass_grams: float
    confidence_interval: List[int]
```

---

## ⚡ 4. FASTAPI APP & MOONREPO INTEGRATION

### `app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title="UrbanGrow AI Predictive Engine",
    version="1.0.0",
    description="Microservice for Aquaponics IoT Anomaly Detection and Biological Forecasting"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "ai-engine", "version": "1.0.0"}
```

### `services/ai-engine/moon.yml`:
```yaml
language: python
tasks:
  dev:
    command: 'uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload'
  test:
    command: 'pytest'
```

---

## 🤝 5. BEST PRACTICES CHECKLIST

1. **Pydantic V2 Strict Validation**: Ensure all inputs enforce physical limits (`ge` and `le`) to eliminate sensor garbage data before feeding models.
2. **Cold Start Resiliency**: Always provide synthetic domain-knowledge defaults if pre-trained `.joblib` files are absent on fresh environments.
3. **Low Latency (<25ms)**: Keep real-time anomaly endpoints synchronous and avoid heavy on-the-fly model fitting inside request loops.
4. **Actionable Outputs**: Never return a raw anomaly score alone. Always accompany predictions with a human-readable `root_cause_hint` and recommended action for the grower.
