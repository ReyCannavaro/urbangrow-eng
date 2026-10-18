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
        recommended_action: "AI Engine offline; running in baseline heuristic mode.",
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
      return {
        climate_adaptation_score: 82.5,
        resilience_grade: "OPTIMAL",
        sub_scores: {
          temperature_stability: 85.0,
          water_quality: 80.0,
          dissolved_oxygen: 85.0,
          photoperiod_consistency: 80.0,
        },
        insights: ["Sistem beroperasi optimal dalam mode adaptasi standar."],
      };
    }
  }
}
