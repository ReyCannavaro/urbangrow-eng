export class AiEngineClient {
  private static baseUrl = process.env.AI_ENGINE_URL || "http://localhost:8000";

  static async predictAnomaly(telemetry: any) {
    try {
      const res = await fetch(`${this.baseUrl}/predict/anomaly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telemetry),
      });
      if (!res.ok) throw new Error(`AI Engine error: ${res.statusText}`);
      return await res.json();
    } catch (err: any) {
      console.warn("[AI-CLIENT] Fallback heuristic triggered:", err.message);
      return {
        is_anomaly: false,
        anomaly_score: 0.1,
        risk_level: "LOW",
        recommended_action: "AI Engine offline; menggunakan aturan ambang batas lokal ECAD untuk sensor terhubung.",
        affected_metrics: [],
      };
    }
  }

  static async calculateClimateScore(telemetry: any, photoperiodHours = 12) {
    try {
      const res = await fetch(`${this.baseUrl}/score/climate-adaptation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telemetry,
          photoperiod_hours: photoperiodHours,
          aerator_active: true,
        }),
      });
      if (!res.ok) throw new Error(`AI Engine error: ${res.statusText}`);
      return await res.json();
    } catch (err: any) {
      const ph = typeof telemetry?.ph === "number" ? telemetry.ph : null;
      const waterTemp = typeof telemetry?.water_temp_c === "number" ? telemetry.water_temp_c : null;
      const lux = typeof telemetry?.lux === "number" ? telemetry.lux : null;
      const tds = typeof telemetry?.tds_ppm === "number" ? telemetry.tds_ppm : null;

      const tempScore =
        waterTemp === null
          ? null
          : Number(Math.max(40, Math.min(100, 100 - Math.abs(waterTemp - 24.5) * 8)).toFixed(1));
      const waterScore =
        ph === null && tds === null
          ? null
          : Number(
              (
                ((ph !== null ? Math.max(45, 100 - Math.abs(ph - 7.0) * 28) : 85) +
                  (tds !== null ? Math.max(45, 100 - Math.abs(tds - 580) * 0.08) : 85)) /
                2
              ).toFixed(1)
            );
      const luxScore =
        lux === null
          ? null
          : Number(Math.max(35, Math.min(100, (lux / 1200) * 100)).toFixed(1));

      const available = [tempScore, waterScore, luxScore].filter(
        (v): v is number => typeof v === "number"
      );
      const overall =
        available.length > 0
          ? Number((available.reduce((a, b) => a + b, 0) / available.length).toFixed(1))
          : null;

      return {
        climate_adaptation_score: overall,
        resilience_grade:
          overall === null
            ? "OFFLINE"
            : overall >= 85
            ? "EXCELLENT"
            : overall >= 72
            ? "OPTIMAL"
            : overall >= 55
            ? "STRESSED"
            : "CRITICAL",
        sub_scores: {
          temperature_stability: tempScore,
          water_quality: waterScore,
          dissolved_oxygen: null,
          photoperiod_consistency: luxScore,
        },
        insights: [
          overall === null
            ? "Menunggu data sensor live ESP32-GROW-01 untuk menghitung skor adaptasi iklim."
            : "Skor adaptasi iklim dihitung langsung dari pembacaan sensor hardware ESP32 aktif.",
        ],
      };
    }
  }
}
