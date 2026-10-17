from typing import List, Optional
from pydantic import BaseModel, Field


class TelemetryInput(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0, description="pH level of water")
    tds_ppm: float = Field(..., ge=0.0, le=3000.0, description="Total Dissolved Solids in ppm")
    water_temp_c: float = Field(..., ge=0.0, le=50.0, description="Water temperature in Celsius")
    air_temp_c: float = Field(..., ge=0.0, le=60.0, description="Air temperature in Celsius")
    humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage")
    lux: float = Field(..., ge=0.0, le=100000.0, description="Light intensity in Lux")
    dissolved_oxygen: float = Field(..., ge=0.0, le=20.0, description="Dissolved oxygen in mg/L")


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    risk_level: str  # "LOW", "MODERATE", "CRITICAL"
    recommended_action: str
    affected_metrics: List[str]


class HarvestRequest(BaseModel):
    crop_type: str = Field(default="pakcoy", description="'pakcoy' or 'kangkung'")
    days_since_planting: int = Field(..., ge=0, le=120)
    current_water_temp_c: float = Field(..., ge=15.0, le=40.0)
    daily_lux_hours: float = Field(default=12.0, ge=0.0, le=24.0)


class HarvestResponse(BaseModel):
    crop_type: str
    accumulated_gdd: float
    target_gdd: float
    estimated_days_to_harvest: int
    projected_biomass_grams: float
    growth_stage: str


class ClimateScoreRequest(BaseModel):
    telemetry: TelemetryInput
    photoperiod_hours: float = 12.0
    aerator_active: bool = True


class ClimateScoreResponse(BaseModel):
    climate_adaptation_score: float  # 0.0 to 100.0
    resilience_grade: str  # "EXCELLENT", "OPTIMAL", "STRESSED", "CRITICAL"
    sub_scores: dict
    insights: List[str]
