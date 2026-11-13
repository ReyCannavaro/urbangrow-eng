import { fetchFromBackend } from "./apiConfig";
import {
  AgriBotChatResponse,
  AgriBotChatTurn,
  AgriBotImageAttachment,
  CropCohortInput,
  EcosystemDiagnosticReport,
  FishCohortInput,
  FishHarvestForecastItem,
  HarvestForecastItem,
  PredictionCohortConfig,
  SensorData,
} from "./types";

const COHORT_STORAGE_KEY = "urbangrow_prediction_cohort_v1";

export function unescapeJsonString(str: string): string {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");
}

export function extractCleanReply(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  if (text.startsWith("{") && text.includes('"reply"')) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.reply === "string" && parsed.reply.trim()) {
        return parsed.reply.trim();
      }
    } catch {
      // Fallback below
    }

    const replyRegex = /"reply"\s*:\s*"([\s\S]*?)(?:",\s*"(?:category|charts|suggestedActions)"|"\s*}[\s\S]*$)/;
    const match = text.match(replyRegex);
    if (match && match[1]) {
      return unescapeJsonString(match[1]);
    }

    const prefixMatch = text.match(/^{\s*"reply"\s*:\s*"/);
    if (prefixMatch) {
      let stripped = text.slice(prefixMatch[0].length);
      stripped = stripped
        .replace(/",\s*"(?:category|charts|suggestedActions)"[\s\S]*$/, "")
        .replace(/"\s*}\s*$/, "")
        .replace(/"\s*$/, "");
      return unescapeJsonString(stripped);
    }
  }

  return text;
}

function offsetDaysIso(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export function daysElapsedSinceDate(isoDate: string): number {
  const parsed = Date.parse(`${isoDate}T00:00:00+07:00`);
  if (!Number.isFinite(parsed)) return 0;
  const diffDays = Math.floor((Date.now() - parsed) / 86400000);
  return Math.max(0, Math.min(365, diffDays));
}

export function formatIndonesianDate(isoDate: string): string {
  const parsed = Date.parse(`${isoDate}T00:00:00+07:00`);
  if (!Number.isFinite(parsed)) return isoDate;
  return new Date(parsed).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDefaultPredictionCohort(): PredictionCohortConfig {
  return {
    fishMode: "both",
    nila: {
      enabled: true,
      species: "nila",
      count: 35,
      stockingDate: offsetDaysIso(-18),
      initialLengthCm: 6.5,
      targetHarvestLengthCm: 22.0,
    },
    lele: {
      enabled: true,
      species: "lele",
      count: 45,
      stockingDate: offsetDaysIso(-16),
      initialLengthCm: 7.0,
      targetHarvestLengthCm: 26.0,
    },
    pakcoy: {
      seedingDate: offsetDaysIso(-14),
      plantCount: 20,
    },
    kangkung: {
      seedingDate: offsetDaysIso(-12),
      plantCount: 24,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function readStoredPredictionCohort(): PredictionCohortConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COHORT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PredictionCohortConfig>;
    const base = getDefaultPredictionCohort();
    const fishMode =
      parsed.fishMode === "nila" || parsed.fishMode === "lele" || parsed.fishMode === "both"
        ? parsed.fishMode
        : base.fishMode;
    return {
      fishMode,
      nila: {
        ...base.nila,
        ...(parsed.nila || {}),
        species: "nila",
        enabled: fishMode === "both" || fishMode === "nila",
      },
      lele: {
        ...base.lele,
        ...(parsed.lele || {}),
        species: "lele",
        enabled: fishMode === "both" || fishMode === "lele",
      },
      pakcoy: {
        ...base.pakcoy,
        ...(parsed.pakcoy || {}),
      },
      kangkung: {
        ...base.kangkung,
        ...(parsed.kangkung || {}),
      },
      updatedAt: parsed.updatedAt || base.updatedAt,
    };
  } catch {
    return null;
  }
}

export function writeStoredPredictionCohort(config: PredictionCohortConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota errors
  }
}

export function computeLocalFishForecast(
  input: FishCohortInput,
  sensors: SensorData
): FishHarvestForecastItem {
  const isNila = input.species === "nila";
  const label = isNila ? "Ikan Nila (Oreochromis niloticus)" : "Ikan Lele (Clarias sp.)";
  const level = isNila ? "Kolam Level 3 (DO Tinggi)" : "Kolam Level 1 (Dasar Sistem)";

  const waterTemp = typeof sensors.waterTemperature === "number" ? sensors.waterTemperature : 25.0;
  const tempDiff = Math.abs(waterTemp - 26.5);
  const tempFactor = tempDiff <= 2.5 ? 1.0 : tempDiff <= 4.5 ? 0.86 : 0.7;

  const doFactor =
    typeof sensors.dissolvedOxygen === "number"
      ? isNila
        ? sensors.dissolvedOxygen >= 5.5
          ? 1.0
          : sensors.dissolvedOxygen >= 4.5
          ? 0.82
          : 0.62
        : sensors.dissolvedOxygen >= 2.8
        ? 1.0
        : 0.85
      : 1.0;

  const phFactor =
    typeof sensors.ph === "number"
      ? sensors.ph >= 6.5 && sensors.ph <= 7.8
        ? 1.0
        : 0.88
      : 1.0;
  const densityFactor = input.count <= 45 ? 1.0 : input.count <= 70 ? 0.92 : 0.84;

  const suitability = tempFactor * doFactor * phFactor;
  const waterSuitabilityPct = Math.round(suitability * 100);

  const baseRateCm = isNila ? 0.24 : 0.32;
  const dailyGrowthRateCm = Number(
    Math.max(0.08, baseRateCm * suitability * densityFactor).toFixed(3)
  );

  const daysElapsed = daysElapsedSinceDate(input.stockingDate);
  const initialLength = Math.max(1, input.initialLengthCm);
  const targetLength = Math.max(initialLength + 2, input.targetHarvestLengthCm);

  const estimatedCurrentLengthCm = Number(
    Math.min(targetLength * 1.08, initialLength + dailyGrowthRateCm * daysElapsed).toFixed(1)
  );
  const remainingCm = Math.max(0, targetLength - estimatedCurrentLengthCm);
  const estimatedDaysRemaining = Math.max(
    0,
    Math.ceil(remainingCm / Math.max(0.05, dailyGrowthRateCm))
  );

  const totalGainNeeded = Math.max(0.5, targetLength - initialLength);
  const currentGain = Math.max(0, estimatedCurrentLengthCm - initialLength);
  const progressPct = Math.min(100, Math.round((currentGain / totalGainNeeded) * 100));

  const targetWeightGrams = isNila
    ? 0.022 * Math.pow(targetLength, 2.95)
    : 0.0085 * Math.pow(targetLength, 2.98);
  const projectedWeightPerFishGrams = Number(targetWeightGrams.toFixed(1));
  const survivalFactor = 0.94;
  const projectedTotalYieldKg = Number(
    ((input.count * projectedWeightPerFishGrams * survivalFactor) / 1000).toFixed(2)
  );

  let growthStage = "Fase Adaptasi Bibit Baru";
  if (progressPct >= 95) {
    growthStage = "Siap Panen Ukuran Konsumsi";
  } else if (progressPct >= 65) {
    growthStage = "Fase Pembesaran Akhir & Pengisian Bobot";
  } else if (progressPct >= 25) {
    growthStage = "Fase Pertumbuhan Juvenil Cepat";
  }

  return {
    species: input.species,
    label,
    level,
    count: input.count,
    stockingDate: input.stockingDate,
    daysElapsed,
    initialLengthCm: initialLength,
    estimatedCurrentLengthCm,
    targetHarvestLengthCm: targetLength,
    progressPct,
    estimatedDaysRemaining,
    estimatedHarvestDate: offsetDaysIso(estimatedDaysRemaining),
    projectedWeightPerFishGrams,
    projectedTotalYieldKg,
    dailyGrowthRateCm,
    growthStage,
    waterSuitabilityPct,
  };
}

export function computeLocalSeedCropForecast(
  cropType: "pakcoy" | "kangkung",
  cohort: CropCohortInput,
  sensors: SensorData
): HarvestForecastItem {
  const config =
    cropType === "pakcoy"
      ? {
          label: "Sayuran Pakcoy",
          level: "Level 4 (Puncak Rak)",
          baseTemp: 10.0,
          targetGdd: 440.0,
          maxBiomassGrams: 175.0,
        }
      : {
          label: "Sayuran Kangkung",
          level: "Level 2 (Hilir Biofilter)",
          baseTemp: 12.0,
          targetGdd: 340.0,
          maxBiomassGrams: 145.0,
        };

  const lightEfficiency =
    typeof sensors.lightIntensity !== "number"
      ? 0.88
      : sensors.lightIntensity >= 1200
      ? 1.0
      : sensors.lightIntensity >= 500
      ? 0.9
      : sensors.lightIntensity >= 250
      ? 0.78
      : 0.62;

  const waterTemp = typeof sensors.waterTemperature === "number" ? sensors.waterTemperature : 25.0;
  const daysSincePlanting = daysElapsedSinceDate(cohort.seedingDate);
  const effectiveTemp = Math.max(2.0, waterTemp - config.baseTemp);
  const effectiveDailyGdd = effectiveTemp * lightEfficiency;
  const accumulatedGdd = Number((effectiveDailyGdd * daysSincePlanting).toFixed(1));
  const remainingGdd = Math.max(0, config.targetGdd - accumulatedGdd);
  const estimatedDaysRemaining = Math.max(
    0,
    Math.ceil(remainingGdd / Math.max(1.0, effectiveDailyGdd))
  );
  const progressRatio = Math.min(1, accumulatedGdd / config.targetGdd);
  const projectedBiomassGrams = Number(
    (config.maxBiomassGrams * Math.pow(progressRatio, 1.45)).toFixed(1)
  );
  const projectedTotalYieldKg = Number(
    ((config.maxBiomassGrams * cohort.plantCount) / 1000).toFixed(2)
  );

  let growthStage = "Fase Perkecambahan Benih";
  if (progressRatio >= 0.92) {
    growthStage = "Siap Panen Optimal";
  } else if (progressRatio >= 0.65) {
    growthStage = "Fase Pematangan & Pembesaran Daun";
  } else if (progressRatio >= 0.22) {
    growthStage = "Fase Pertumbuhan Vegetatif Cepat";
  } else if (progressRatio >= 0.1) {
    growthStage = "Fase Semai Daun Sejati";
  }

  return {
    cropType,
    label: config.label,
    level: config.level,
    seedingDate: cohort.seedingDate,
    plantCount: cohort.plantCount,
    propagatedFromSeed: true,
    daysSincePlanting,
    accumulatedGdd,
    targetGdd: config.targetGdd,
    progressPct: Math.round(progressRatio * 100),
    estimatedDaysRemaining,
    estimatedHarvestDate: offsetDaysIso(estimatedDaysRemaining),
    projectedBiomassGrams,
    projectedTotalYieldKg,
    growthStage,
    lightEfficiencyPct: Math.round(lightEfficiency * 100),
  };
}

export interface ClimateScoreData {
  offline?: boolean;
  climate_adaptation_score: number | null;
  resilience_grade: string;
  sub_scores: {
    temperature_stability: number | null;
    water_quality: number | null;
    dissolved_oxygen: number | null;
    photoperiod_consistency: number | null;
  };
  insights: string[];
}

export interface AnomalyPrediction {
  offline?: boolean;
  is_anomaly: boolean;
  anomaly_score: number;
  risk_level: string;
  recommended_action: string;
  affected_metrics: string[];
}

export async function fetchClimateScore(): Promise<ClimateScoreData> {
  const res = await fetchFromBackend<ClimateScoreData>("/api/ai/climate-score", {}, 4000);
  if (res.ok && res.data && "climate_adaptation_score" in res.data && res.data.sub_scores) {
    return res.data;
  }

  return {
    offline: true,
    climate_adaptation_score: null,
    resilience_grade: "OFFLINE",
    sub_scores: {
      temperature_stability: null,
      water_quality: null,
      dissolved_oxygen: null,
      photoperiod_consistency: null,
    },
    insights: [
      "Server backend belum terjangkau atau belum menerima paket telemetri dari ESP32-GROW-01.",
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
    offline: true,
    is_anomaly: false,
    anomaly_score: 0,
    risk_level: "OFFLINE",
    recommended_action: "Menunggu koneksi backend & data sensor live dari ESP32-GROW-01.",
    affected_metrics: [],
  };
}

export async function fetchAgriBotDiagnostics(
  pakcoyDay?: number,
  kangkungDay?: number
): Promise<EcosystemDiagnosticReport | null> {
  const storedCohort = readStoredPredictionCohort();
  const params = new URLSearchParams();
  if (pakcoyDay !== undefined) params.set("pakcoyDay", String(pakcoyDay));
  if (kangkungDay !== undefined) params.set("kangkungDay", String(kangkungDay));
  const qs = params.toString() ? `?${params.toString()}` : "";

  const res = await fetchFromBackend<EcosystemDiagnosticReport & { success?: boolean }>(
    `/api/ai/diagnostics${qs}`,
    {},
    4500
  );

  if (res.ok && res.data && res.data.diagnosis && res.data.predictions) {
    const activeCohort = res.data.cohort ?? storedCohort ?? getDefaultPredictionCohort();
    if (res.data.cohort) {
      writeStoredPredictionCohort(res.data.cohort);
    }
    const sensors = res.data.sensors;
    const fishPredictions: EcosystemDiagnosticReport["predictions"]["fish"] = {};
    if (activeCohort.nila.enabled) {
      fishPredictions.nila = computeLocalFishForecast(activeCohort.nila, sensors);
    }
    if (activeCohort.lele.enabled) {
      fishPredictions.lele = computeLocalFishForecast(activeCohort.lele, sensors);
    }
    return {
      ...res.data,
      cohort: activeCohort,
      predictions: {
        ...res.data.predictions,
        harvest: {
          pakcoy: computeLocalSeedCropForecast("pakcoy", activeCohort.pakcoy, sensors),
          kangkung: computeLocalSeedCropForecast("kangkung", activeCohort.kangkung, sensors),
        },
        fish: fishPredictions,
      },
    };
  }
  return null;
}

export async function savePredictionCohort(
  config: PredictionCohortConfig
): Promise<PredictionCohortConfig> {
  const normalized: PredictionCohortConfig = {
    ...config,
    nila: {
      ...config.nila,
      species: "nila",
      enabled: config.fishMode === "both" || config.fishMode === "nila",
    },
    lele: {
      ...config.lele,
      species: "lele",
      enabled: config.fishMode === "both" || config.fishMode === "lele",
    },
    updatedAt: new Date().toISOString(),
  };

  writeStoredPredictionCohort(normalized);

  const res = await fetchFromBackend<{
    success: boolean;
    cohort?: PredictionCohortConfig;
  }>(
    "/api/ai/cohort",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fishMode: normalized.fishMode,
        nila: {
          count: normalized.nila.count,
          stockingDate: normalized.nila.stockingDate,
          initialLengthCm: normalized.nila.initialLengthCm,
          targetHarvestLengthCm: normalized.nila.targetHarvestLengthCm,
        },
        lele: {
          count: normalized.lele.count,
          stockingDate: normalized.lele.stockingDate,
          initialLengthCm: normalized.lele.initialLengthCm,
          targetHarvestLengthCm: normalized.lele.targetHarvestLengthCm,
        },
        pakcoy: {
          seedingDate: normalized.pakcoy.seedingDate,
          plantCount: normalized.pakcoy.plantCount,
        },
        kangkung: {
          seedingDate: normalized.kangkung.seedingDate,
          plantCount: normalized.kangkung.plantCount,
        },
      }),
    },
    4500
  );

  if (res.ok && res.data?.cohort) {
    writeStoredPredictionCohort(res.data.cohort);
    return res.data.cohort;
  }

  return normalized;
}

export async function sendAgriBotChat(payload: {
  message: string;
  history?: AgriBotChatTurn[];
  images?: AgriBotImageAttachment[];
  cropDayPakcoy?: number;
  cropDayKangkung?: number;
}): Promise<AgriBotChatResponse> {
  const startedAt = performance.now();
  const res = await fetchFromBackend<AgriBotChatResponse>(
    "/api/ai/chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: payload.message,
        history: payload.history,
        images: payload.images?.map((img) => ({
          mimeType: img.mimeType,
          data: img.data,
          name: img.name,
        })),
        cropDayPakcoy: payload.cropDayPakcoy,
        cropDayKangkung: payload.cropDayKangkung,
      }),
    },
    30000
  );
  const latencyMs = Math.round(performance.now() - startedAt);

  if (res.ok && res.data && res.data.reply) {
    return {
      ...res.data,
      reply: extractCleanReply(res.data.reply),
      charts: Array.isArray(res.data.charts) ? res.data.charts : [],
      latencyMs,
    };
  }

  return {
    success: false,
    reply:
      "Maaf, koneksi ke server AI backend sedang terputus sementara. Pastikan layanan backend UrbanGrow berjalan atau periksa koneksi jaringan, lalu coba kirim ulang pertanyaan Anda.",
    provider: "offline_fallback",
    model: "offline-guard",
    category: "general",
    latencyMs,
    suggestedActions: [],
    charts: [],
    diagnostics: {
      timestamp: new Date().toISOString(),
      overallStatus: "WARNING",
      sensors: {
        ph: null,
        tds: null,
        waterTemperature: null,
        airTemperature: null,
        humidity: null,
        lightIntensity: null,
        dissolvedOxygen: null,
        waterLevel: null,
      },
      sensorSources: {
        ph: "offline",
        tds: "offline",
        waterTemperature: "offline",
        airTemperature: "offline",
        humidity: "offline",
        lightIntensity: "offline",
        dissolvedOxygen: "offline",
        waterLevel: "offline",
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
