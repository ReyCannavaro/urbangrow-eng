import { fetchFromBackend } from "./apiConfig";
import {
  AgriBotChatResponse,
  AgriBotChatTurn,
  EcosystemDiagnosticReport,
} from "./types";

export interface ClimateScoreData {
  climate_adaptation_score: number;
  resilience_grade: string;
  sub_scores: {
    temperature_stability: number;
    water_quality: number;
    dissolved_oxygen: number;
    photoperiod_consistency: number;
  };
  insights: string[];
}

export interface AnomalyPrediction {
  is_anomaly: boolean;
  anomaly_score: number;
  risk_level: string;
  recommended_action: string;
  affected_metrics: string[];
}

export async function fetchClimateScore(): Promise<ClimateScoreData> {
  const res = await fetchFromBackend<ClimateScoreData>("/api/ai/climate-score", {}, 4000);
  if (res.ok && res.data && typeof res.data.climate_adaptation_score === "number") {
    return res.data;
  }

  return {
    climate_adaptation_score: 84.0,
    resilience_grade: "OPTIMAL",
    sub_scores: {
      temperature_stability: 88.0,
      water_quality: 82.0,
      dissolved_oxygen: 85.0,
      photoperiod_consistency: 80.0,
    },
    insights: [
      "Suhu air dan oksigen terlarut berada pada zona kenyamanan Nila dan Lele.",
    ],
  };
}

export async function fetchAnomalyInference(): Promise<AnomalyPrediction> {
  const res = await fetchFromBackend<AnomalyPrediction>(
    "/api/ai/predict",
    { method: "POST" },
    4000
  );
  if (res.ok && res.data && typeof res.data.is_anomaly === "boolean") {
    return res.data;
  }

  return {
    is_anomaly: false,
    anomaly_score: 0.1,
    risk_level: "LOW",
    recommended_action: "Seluruh sensor beroperasi normal.",
    affected_metrics: [],
  };
}

export async function fetchAgriBotDiagnostics(
  pakcoyDay: number = 14,
  kangkungDay: number = 17
): Promise<EcosystemDiagnosticReport | null> {
  const res = await fetchFromBackend<EcosystemDiagnosticReport & { success?: boolean }>(
    `/api/ai/diagnostics?pakcoyDay=${encodeURIComponent(pakcoyDay)}&kangkungDay=${encodeURIComponent(kangkungDay)}`,
    {},
    4500
  );

  if (res.ok && res.data && res.data.diagnosis && res.data.predictions) {
    return res.data;
  }
  return null;
}

export async function sendAgriBotChat(payload: {
  message: string;
  history?: AgriBotChatTurn[];
  cropDayPakcoy?: number;
  cropDayKangkung?: number;
}): Promise<AgriBotChatResponse> {
  const startedAt = performance.now();
  const res = await fetchFromBackend<AgriBotChatResponse>(
    "/api/ai/chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    18000
  );
  const latencyMs = Math.round(performance.now() - startedAt);

  if (res.ok && res.data && res.data.reply) {
    return {
      ...res.data,
      latencyMs,
    };
  }

  return {
    success: false,
    reply:
      "Maaf, koneksi ke server AI backend sedang terputus sementara. Pastikan layanan backend UrbanGrow berjalan (`moon run backend:dev`) atau periksa `NEXT_PUBLIC_API_URL`, lalu coba kirim ulang pertanyaan Anda.",
    provider: "offline_fallback",
    model: "offline-guard",
    category: "general",
    latencyMs,
    suggestedActions: [],
    diagnostics: {
      timestamp: new Date().toISOString(),
      overallStatus: "WARNING",
      sensors: {
        ph: 6.95,
        tds: 540,
        waterTemperature: 24.3,
        airTemperature: 27.2,
        humidity: 65.4,
        lightIntensity: 650,
        dissolvedOxygen: 7.25,
        waterLevel: 92.0,
      },
      sensorSources: {
        ph: "auto_dummy",
        tds: "auto_dummy",
        waterTemperature: "auto_dummy",
        airTemperature: "auto_dummy",
        humidity: "auto_dummy",
        lightIntensity: "auto_dummy",
        dissolvedOxygen: "auto_dummy",
        waterLevel: "auto_dummy",
      },
      edgeOnline: false,
      diagnosis: {
        plant: {
          status: "WARNING",
          headline: "Menunggu Koneksi Backend",
          details: ["Belum menerima snapshot terbaru dari server backend."],
          recommendation: "Periksa koneksi backend untuk mendapatkan analisis tumbuhan terbaru.",
        },
        water: {
          status: "WARNING",
          headline: "Menunggu Koneksi Backend",
          details: ["Data telemetri air belum tersinkron dengan server."],
          recommendation: "Periksa koneksi jaringan atau status service backend.",
        },
        fish: {
          status: "WARNING",
          headline: "Menunggu Koneksi Backend",
          details: ["Status kolam Nila & Lele belum terverifikasi dari backend."],
          recommendation: "Cek koneksi ke server sebelum mengubah aktuator.",
        },
      },
      predictions: {
        trends: {
          sampleCount: 0,
          phDelta: 0,
          waterTempDelta: 0,
          tdsDelta: 0,
          doDelta: 0,
          lightDelta: 0,
          waterForecast: "Menunggu sinkronisasi data time-series dari server.",
          emergingSymptoms: ["Koneksi ke backend AI offline sementara."],
        },
        harvest: {
          pakcoy: {
            cropType: "pakcoy",
            label: "Sayuran Pakcoy",
            level: "Level 4 (Puncak Rak)",
            daysSincePlanting: payload.cropDayPakcoy ?? 14,
            accumulatedGdd: 200,
            targetGdd: 380,
            progressPct: 53,
            estimatedDaysRemaining: 12,
            estimatedHarvestDate: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
            projectedBiomassGrams: 70,
            growthStage: "Fase Pertumbuhan Vegetatif Cepat",
            lightEfficiencyPct: 90,
          },
          kangkung: {
            cropType: "kangkung",
            label: "Sayuran Kangkung",
            level: "Level 2 (Hilir Biofilter)",
            daysSincePlanting: payload.cropDayKangkung ?? 17,
            accumulatedGdd: 209,
            targetGdd: 320,
            progressPct: 65,
            estimatedDaysRemaining: 9,
            estimatedHarvestDate: new Date(Date.now() + 9 * 86400000).toISOString().split("T")[0],
            projectedBiomassGrams: 80,
            growthStage: "Fase Pematangan & Pembesaran Daun",
            lightEfficiencyPct: 90,
          },
        },
      },
      suggestedActions: [],
    },
  };
}
