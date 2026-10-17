import numpy as np
from schemas import TelemetryInput, AnomalyResponse


class AnomalyDetector:
    def __init__(self):
        # Biologically-validated ECAD thresholds
        self.PH_MIN = 6.0
        self.PH_MAX = 8.0
        self.TDS_MIN = 350.0
        self.TDS_MAX = 900.0
        self.WATER_TEMP_MAX = 30.5
        self.DO_MIN = 4.5

    def evaluate(self, telemetry: TelemetryInput) -> AnomalyResponse:
        affected = []
        severity = "LOW"
        actions = []

        # 1. pH Rule Evaluation
        if telemetry.ph < self.PH_MIN:
            affected.append("ph_acidic")
            actions.append("Tambahkan buffer basa (NaHCO3 / Potasium Bikarbonat) secara bertahap.")
            severity = "CRITICAL" if telemetry.ph < 5.5 else "MODERATE"
        elif telemetry.ph > self.PH_MAX:
            affected.append("ph_alkaline")
            actions.append("Tambahkan asam organik ringan (asam fosfat/sitrat) dan cek amonia terlarut.")
            severity = "MODERATE"

        # 2. TDS Evaluation
        if telemetry.tds_ppm > self.TDS_MAX:
            affected.append("tds_spike")
            actions.append("Kuras 20% air tandon dan tambahkan air bersih terdeklorinasi.")
            severity = "CRITICAL" if telemetry.tds_ppm > 1100 else "MODERATE"
        elif telemetry.tds_ppm < self.TDS_MIN:
            affected.append("tds_depleted")
            actions.append("Tingkatkan ransum pakan atau tambahkan pupuk mikro kelat besi (Fe-DTPA).")

        # 3. Water Temp & Dissolved Oxygen Cross-Correlation
        if telemetry.water_temp_c > self.WATER_TEMP_MAX:
            affected.append("water_heatwave")
            actions.append("Aktifkan penutup naungan paranet dan operasikan aerasi booster maksimum.")
            if telemetry.dissolved_oxygen < self.DO_MIN:
                affected.append("hypoxia_risk")
                actions.append("BAHAYA HIPOKSIA: Hidupkan aerator kedua dan kurangi pemberian pakan ikan!")
                severity = "CRITICAL"
        elif telemetry.dissolved_oxygen < self.DO_MIN:
            affected.append("low_dissolved_oxygen")
            actions.append("Cek saluran pompa aerator dari penyumbatan biofilm kotoran ikan.")
            severity = "CRITICAL" if telemetry.dissolved_oxygen < 3.5 else "MODERATE"

        is_anomaly = len(affected) > 0
        anomaly_score = -0.75 if severity == "CRITICAL" else (-0.35 if severity == "MODERATE" else 0.45)
        recommended_action = " ; ".join(actions) if actions else "Kondisi parameter air akuaponik dalam batas optimal biologis."

        return AnomalyResponse(
            is_anomaly=is_anomaly,
            anomaly_score=anomaly_score,
            risk_level=severity,
            recommended_action=recommended_action,
            affected_metrics=affected
        )


detector = AnomalyDetector()
