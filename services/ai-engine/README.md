# 🧠 UrbanGrow AI & Predictive Analytics Engine

Predictive analytics microservice for the UrbanGrow Smart Aquaponic ecosystem, providing multi-variate anomaly detection, GDD-based harvest date forecasting, and Climate Adaptation Score index calculation.

---

## 🚀 Quickstart

### 1. Requirements
- Python 3.11+
- Virtual environment (`venv`)

### 2. Setup
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run Locally
```bash
uvicorn main:app --reload --port 8000
```
Swagger UI available at: `http://localhost:8000/docs`

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Service status and endpoint catalog |
| `/health` | `GET` | Container liveness probe |
| `/predict/anomaly` | `POST` | Multi-variate anomaly evaluation |
| `/predict/harvest` | `POST` | Thermal GDD harvest estimation |
| `/score/climate-adaptation` | `POST` | Composite ECAD climate resilience score (0-100) |
| `/data/synthetic-microclimate` | `GET` | Sidoarjo tropical diurnal weather synthesis |
