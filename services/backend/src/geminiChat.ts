import { simulator, SensorReading, SensorSource } from "./simulator";

export type HealthSeverity = "OPTIMAL" | "WARNING" | "CRITICAL";

export interface DomainDiagnosis {
  status: HealthSeverity;
  headline: string;
  details: string[];
  recommendation: string;
}

export type FishSpecies = "nila" | "lele";

export interface FishCohortInput {
  enabled: boolean;
  species: FishSpecies;
  count: number;
  stockingDate: string; // YYYY-MM-DD
  initialLengthCm: number;
  targetHarvestLengthCm: number;
}

export interface CropCohortInput {
  seedingDate: string; // YYYY-MM-DD (ditanam dari benih)
  plantCount: number;
}

export interface PredictionCohortConfig {
  fishMode: "both" | "nila" | "lele";
  nila: FishCohortInput;
  lele: FishCohortInput;
  pakcoy: CropCohortInput;
  kangkung: CropCohortInput;
  updatedAt: string;
}

export interface FishHarvestForecastItem {
  species: FishSpecies;
  label: string;
  level: string;
  count: number;
  stockingDate: string;
  daysElapsed: number;
  initialLengthCm: number;
  estimatedCurrentLengthCm: number;
  targetHarvestLengthCm: number;
  progressPct: number;
  estimatedDaysRemaining: number;
  estimatedHarvestDate: string;
  projectedWeightPerFishGrams: number;
  projectedTotalYieldKg: number;
  dailyGrowthRateCm: number;
  growthStage: string;
  waterSuitabilityPct: number;
}

export interface HarvestForecastItem {
  cropType: "pakcoy" | "kangkung";
  label: string;
  level: string;
  seedingDate: string;
  plantCount: number;
  propagatedFromSeed: boolean;
  daysSincePlanting: number;
  accumulatedGdd: number;
  targetGdd: number;
  progressPct: number;
  estimatedDaysRemaining: number;
  estimatedHarvestDate: string;
  projectedBiomassGrams: number;
  projectedTotalYieldKg: number;
  growthStage: string;
  lightEfficiencyPct: number;
}

export interface WaterTrendSummary {
  sampleCount: number;
  phDelta: number;
  waterTempDelta: number;
  tdsDelta: number;
  doDelta: number;
  lightDelta: number;
  waterForecast: string;
  emergingSymptoms: string[];
}

export interface EcosystemDiagnosticReport {
  timestamp: string;
  overallStatus: HealthSeverity;
  sensors: SensorReading;
  sensorSources: Record<keyof SensorReading, SensorSource>;
  edgeOnline: boolean;
  cohort: PredictionCohortConfig;
  diagnosis: {
    plant: DomainDiagnosis;
    water: DomainDiagnosis;
    fish: DomainDiagnosis;
  };
  predictions: {
    trends: WaterTrendSummary;
    harvest: {
      pakcoy: HarvestForecastItem;
      kangkung: HarvestForecastItem;
    };
    fish: {
      nila?: FishHarvestForecastItem;
      lele?: FishHarvestForecastItem;
    };
  };
  suggestedActions: Array<{
    actuatorId: string;
    label: string;
    targetState: boolean;
    reason: string;
  }>;
}

export type AgriBotChartType =
  | "line"
  | "area"
  | "bar"
  | "horizontal_bar"
  | "pie"
  | "donut"
  | "radar"
  | "scatter"
  | "composed"
  | "radial"
  | "heatmap";

export type AgriBotChartTheme =
  | "light"
  | "dark"
  | "emerald"
  | "ocean"
  | "sunset"
  | "neon"
  | "minimal"
  | "brutalist";

export interface AgriBotChartSeries {
  name: string;
  unit?: string;
  color?: string;
  type?: "line" | "area" | "bar";
  values: number[];
  points?: Array<{ x: number; y: number; label?: string }>;
}

export interface AgriBotChartStyle {
  theme?: AgriBotChartTheme;
  curve?: "smooth" | "linear" | "step";
  palette?: string[];
  showGrid?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  xLabel?: string;
  yLabel?: string;
  unit?: string;
}

export interface AgriBotChartSpec {
  id: string;
  title: string;
  subtitle?: string;
  chartType: AgriBotChartType;
  labels: string[];
  series: AgriBotChartSeries[];
  style?: AgriBotChartStyle;
  summaryNote?: string;
}

export interface AgriBotImageAttachment {
  mimeType: string;
  data: string;
  name?: string;
}

export interface ChatHistoryTurn {
  role: "user" | "assistant" | "bot" | "model";
  text: string;
}

export interface AgriBotChatRequest {
  message: string;
  history?: ChatHistoryTurn[];
  images?: AgriBotImageAttachment[];
  cropDayPakcoy?: number;
  cropDayKangkung?: number;
}

export interface AgriBotChatResponse {
  success: boolean;
  reply: string;
  provider: "gemini" | "ecad_local_fallback";
  model: string;
  category: "diagnosis" | "prediction" | "advisory" | "general";
  diagnostics: EcosystemDiagnosticReport;
  suggestedActions: EcosystemDiagnosticReport["suggestedActions"];
  charts?: AgriBotChartSpec[];
}

function worstSeverity(a: HealthSeverity, b: HealthSeverity): HealthSeverity {
  const rank: Record<HealthSeverity, number> = { OPTIMAL: 0, WARNING: 1, CRITICAL: 2 };
  return rank[a] >= rank[b] ? a : b;
}

function addDaysIso(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString().split("T")[0];
}

function daysElapsedSinceIso(isoDate: string): number {
  const parsed = Date.parse(`${isoDate}T00:00:00+07:00`);
  if (!Number.isFinite(parsed)) return 0;
  const diffDays = Math.floor((Date.now() - parsed) / 86400000);
  return Math.max(0, Math.min(365, diffDays));
}

function computeFishHarvestItem(
  input: FishCohortInput,
  sensors: SensorReading
): FishHarvestForecastItem {
  const isNila = input.species === "nila";
  const label = isNila ? "Ikan Nila (Oreochromis niloticus)" : "Ikan Lele (Clarias sp.)";
  const level = isNila ? "Kolam Level 3 (DO Tinggi)" : "Kolam Level 1 (Dasar Sistem)";

  // Water suitability factor from live ESP32 sensors
  const tempDiff = Math.abs(sensors.waterTemperature - 26.5);
  const tempFactor = tempDiff <= 2.5 ? 1.0 : tempDiff <= 4.5 ? 0.86 : 0.7;

  const doFactor = isNila
    ? sensors.dissolvedOxygen >= 5.5
      ? 1.0
      : sensors.dissolvedOxygen >= 4.5
      ? 0.82
      : 0.62
    : sensors.dissolvedOxygen >= 2.8
    ? 1.0
    : 0.85;

  const phFactor = sensors.ph >= 6.5 && sensors.ph <= 7.8 ? 1.0 : 0.88;
  const densityFactor = input.count <= 45 ? 1.0 : input.count <= 70 ? 0.92 : 0.84;

  const suitability = tempFactor * doFactor * phFactor;
  const waterSuitabilityPct = Math.round(suitability * 100);

  // Base specific length growth rate (cm/day) in aquaponic RAS
  const baseRateCm = isNila ? 0.24 : 0.32;
  const dailyGrowthRateCm = Number(
    Math.max(0.08, baseRateCm * suitability * densityFactor).toFixed(3)
  );

  const daysElapsed = daysElapsedSinceIso(input.stockingDate);
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

  // Allometric length-to-weight estimation (W = a * L^b)
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
    estimatedHarvestDate: addDaysIso(estimatedDaysRemaining),
    projectedWeightPerFishGrams,
    projectedTotalYieldKg,
    dailyGrowthRateCm,
    growthStage,
    waterSuitabilityPct,
  };
}

function computeHarvestItem(
  cropType: "pakcoy" | "kangkung",
  waterTempC: number,
  lightLux: number,
  daysSincePlanting: number,
  cohort?: CropCohortInput
): HarvestForecastItem {
  // Grown from seed ("tanam dari benih") -> full seed-to-harvest GDD target
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

  // Photosynthetic light factor modulated smoothly by live LDR reading
  // Ideal indoor/greenhouse aquaponic range ~1,500 - 15,000+ lux
  const lightEfficiency =
    lightLux >= 1200
      ? 1.0
      : lightLux >= 500
      ? 0.9
      : lightLux >= 250
      ? 0.78
      : 0.62;

  const effectiveTemp = Math.max(2.0, waterTempC - config.baseTemp);
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
  const plantCount = cohort?.plantCount ?? (cropType === "pakcoy" ? 20 : 24);
  const seedingDate = cohort?.seedingDate ?? addDaysIso(-daysSincePlanting);
  const projectedTotalYieldKg = Number(
    ((config.maxBiomassGrams * plantCount) / 1000).toFixed(2)
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
    seedingDate,
    plantCount,
    propagatedFromSeed: true,
    daysSincePlanting,
    accumulatedGdd,
    targetGdd: config.targetGdd,
    progressPct: Math.round(progressRatio * 100),
    estimatedDaysRemaining,
    estimatedHarvestDate: addDaysIso(estimatedDaysRemaining),
    projectedBiomassGrams,
    projectedTotalYieldKg,
    growthStage,
    lightEfficiencyPct: Math.round(lightEfficiency * 100),
  };
}

const VALID_CHART_TYPES = new Set<AgriBotChartType>([
  "line",
  "area",
  "bar",
  "horizontal_bar",
  "pie",
  "donut",
  "radar",
  "scatter",
  "composed",
  "radial",
  "heatmap",
]);

const VALID_CHART_THEMES = new Set<AgriBotChartTheme>([
  "light",
  "dark",
  "emerald",
  "ocean",
  "sunset",
  "neon",
  "minimal",
  "brutalist",
]);

interface SampledHistoryPoint {
  timeWib: string;
  ph: number;
  waterTemperature: number;
  tds: number;
  dissolvedOxygen: number;
  lightIntensity: number;
  airTemperature: number;
  humidity: number;
  waterLevel: number;
}

function sanitizeChartSpecs(rawCharts: unknown): AgriBotChartSpec[] {
  if (!Array.isArray(rawCharts)) return [];
  const cleaned: AgriBotChartSpec[] = [];

  for (let i = 0; i < Math.min(rawCharts.length, 4); i++) {
    const item = rawCharts[i];
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;

    const chartTypeRaw = String(raw.chartType || "line").toLowerCase() as AgriBotChartType;
    const chartType: AgriBotChartType = VALID_CHART_TYPES.has(chartTypeRaw)
      ? chartTypeRaw
      : "line";

    const rawSeriesList = Array.isArray(raw.series) ? raw.series : [];
    const series: AgriBotChartSeries[] = [];

    for (let sIdx = 0; sIdx < Math.min(rawSeriesList.length, 8); sIdx++) {
      const sRaw = rawSeriesList[sIdx] as Record<string, unknown> | null;
      if (!sRaw || typeof sRaw !== "object") continue;

      const values = Array.isArray(sRaw.values)
        ? sRaw.values
            .map((v) => Number(v))
            .filter((v) => Number.isFinite(v))
        : [];

      const points = Array.isArray(sRaw.points)
        ? sRaw.points
            .map((p) => {
              if (!p || typeof p !== "object") return null;
              const pt = p as Record<string, unknown>;
              const x = Number(pt.x);
              const y = Number(pt.y);
              if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
              return {
                x,
                y,
                label: typeof pt.label === "string" ? pt.label : undefined,
              };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null)
        : undefined;

      if (values.length === 0 && (!points || points.length === 0)) continue;

      const sType = sRaw.type;
      series.push({
        name: typeof sRaw.name === "string" && sRaw.name.trim() ? sRaw.name.trim() : `Seri ${sIdx + 1}`,
        unit: typeof sRaw.unit === "string" ? sRaw.unit : undefined,
        color:
          typeof sRaw.color === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(sRaw.color.trim())
            ? sRaw.color.trim()
            : undefined,
        type: sType === "line" || sType === "area" || sType === "bar" ? sType : undefined,
        values,
        points,
      });
    }

    if (series.length === 0) continue;

    const labels = Array.isArray(raw.labels)
      ? raw.labels.map((l) => String(l))
      : series[0].values.map((_, idx) => `#${idx + 1}`);

    const rawStyle =
      raw.style && typeof raw.style === "object"
        ? (raw.style as Record<string, unknown>)
        : {};
    const rawTheme = String(rawStyle.theme || "emerald").toLowerCase() as AgriBotChartTheme;
    const theme: AgriBotChartTheme = VALID_CHART_THEMES.has(rawTheme)
      ? rawTheme
      : "emerald";

    const palette = Array.isArray(rawStyle.palette)
      ? rawStyle.palette
          .map((c) => (typeof c === "string" ? c.trim() : ""))
          .filter((c) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c))
      : undefined;

    cleaned.push({
      id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `chart-${i + 1}`,
      title:
        typeof raw.title === "string" && raw.title.trim()
          ? raw.title.trim()
          : "Ringkasan Telemetri IoT",
      subtitle: typeof raw.subtitle === "string" ? raw.subtitle : undefined,
      chartType,
      labels,
      series,
      style: {
        theme,
        curve:
          rawStyle.curve === "linear" || rawStyle.curve === "step" || rawStyle.curve === "smooth"
            ? rawStyle.curve
            : "smooth",
        palette: palette && palette.length > 0 ? palette : undefined,
        showGrid: typeof rawStyle.showGrid === "boolean" ? rawStyle.showGrid : true,
        showValues: typeof rawStyle.showValues === "boolean" ? rawStyle.showValues : false,
        showLegend: typeof rawStyle.showLegend === "boolean" ? rawStyle.showLegend : true,
        xLabel: typeof rawStyle.xLabel === "string" ? rawStyle.xLabel : undefined,
        yLabel: typeof rawStyle.yLabel === "string" ? rawStyle.yLabel : undefined,
        unit: typeof rawStyle.unit === "string" ? rawStyle.unit : undefined,
      },
      summaryNote: typeof raw.summaryNote === "string" ? raw.summaryNote : undefined,
    });
  }

  return cleaned;
}

export class AgriBotEngine {
  private static activeCohort: PredictionCohortConfig = {
    fishMode: "both",
    nila: {
      enabled: true,
      species: "nila",
      count: 35,
      stockingDate: addDaysIso(-18),
      initialLengthCm: 6.5,
      targetHarvestLengthCm: 22.0,
    },
    lele: {
      enabled: true,
      species: "lele",
      count: 45,
      stockingDate: addDaysIso(-16),
      initialLengthCm: 7.0,
      targetHarvestLengthCm: 26.0,
    },
    pakcoy: {
      seedingDate: addDaysIso(-14),
      plantCount: 20,
    },
    kangkung: {
      seedingDate: addDaysIso(-12),
      plantCount: 24,
    },
    updatedAt: new Date().toISOString(),
  };

  static getCohortConfig(): PredictionCohortConfig {
    return this.activeCohort;
  }

  static updateCohortConfig(patch: Partial<PredictionCohortConfig>): PredictionCohortConfig {
    const prev = this.activeCohort;
    const nextFishMode =
      patch.fishMode === "nila" || patch.fishMode === "lele" || patch.fishMode === "both"
        ? patch.fishMode
        : prev.fishMode;

    this.activeCohort = {
      fishMode: nextFishMode,
      nila: {
        ...prev.nila,
        ...(patch.nila || {}),
        species: "nila",
        enabled: nextFishMode === "both" || nextFishMode === "nila",
      },
      lele: {
        ...prev.lele,
        ...(patch.lele || {}),
        species: "lele",
        enabled: nextFishMode === "both" || nextFishMode === "lele",
      },
      pakcoy: {
        ...prev.pakcoy,
        ...(patch.pakcoy || {}),
      },
      kangkung: {
        ...prev.kangkung,
        ...(patch.kangkung || {}),
      },
      updatedAt: new Date().toISOString(),
    };
    return this.activeCohort;
  }

  static buildDiagnostics(
    cropDayPakcoy?: number,
    cropDayKangkung?: number
  ): EcosystemDiagnosticReport {
    const cohort = this.activeCohort;
    const effectivePakcoyDays =
      cropDayPakcoy !== undefined
        ? cropDayPakcoy
        : daysElapsedSinceIso(cohort.pakcoy.seedingDate);
    const effectiveKangkungDays =
      cropDayKangkung !== undefined
        ? cropDayKangkung
        : daysElapsedSinceIso(cohort.kangkung.seedingDate);
    const snap = simulator.getSnapshot();
    const history = simulator.getHistory();
    const s = snap.sensors;
    const sources = snap.sensorSources;
    const actuators = snap.actuators;

    // 1. Time-Series Trend Analysis
    const first = history[0]?.sensors ?? s;
    const last = history[history.length - 1]?.sensors ?? s;
    const phDelta = Number((last.ph - first.ph).toFixed(2));
    const waterTempDelta = Number((last.waterTemperature - first.waterTemperature).toFixed(2));
    const tdsDelta = Math.round(last.tds - first.tds);
    const doDelta = Number((last.dissolvedOxygen - first.dissolvedOxygen).toFixed(2));
    const lightDelta = Math.round(last.lightIntensity - first.lightIntensity);

    const emergingSymptoms: string[] = [];
    if (waterTempDelta > 0.6 || s.waterTemperature > 28.0) {
      emergingSymptoms.push(
        "Pemanasan termal bertahap berisiko menurunkan kelarutan O2 (gejala awal ikan megap-megap di permukaan)."
      );
    }
    if (doDelta < -0.35 || s.dissolvedOxygen < 5.2) {
      emergingSymptoms.push(
        "Tren penurunan Dissolved Oxygen (DO): risiko stres hipoksia pada Ikan Nila Level 3 dalam beberapa jam ke depan."
      );
    }
    if (phDelta < -0.18 || s.ph < 6.4) {
      emergingSymptoms.push(
        "Drift keasaman (asidosis nitrifikasi): aktivitas bakteri biofilter dapat melambat jika pH turun di bawah 6.2."
      );
    } else if (phDelta > 0.18 || s.ph > 7.5) {
      emergingSymptoms.push(
        "Kenaikan pH menuju basa: berpotensi memicu pengendapan Besi (Fe nutrient lockout) serta meningkatkan toksisitas amonia (NH3)."
      );
    }
    if (s.lightIntensity < 300 && !actuators.growLight.isOn) {
      emergingSymptoms.push(
        `Pencahayaan sangat redup (${s.lightIntensity} lux dari sensor LDR): risiko etiolasi (batang kurus pucat) & perlambatan tanggal panen.`
      );
    } else if (s.lightIntensity > 18000) {
      emergingSymptoms.push(
        `Intensitas cahaya ekstrem (${s.lightIntensity} lux): potensi ledakan lumut hijau (algae bloom) dan penguapan air kolam lebih cepat.`
      );
    }
    if (s.tds < 380) {
      emergingSymptoms.push(
        "Nutrisi TDS menipis: risiko gejala daun tua menguning pucat (defisiensi Nitrogen) atau pertumbuhan daun melambat."
      );
    } else if (s.tds > 920) {
      emergingSymptoms.push(
        "Kepekatan TDS tinggi: risiko ujung daun terbakar (tip-burn / stres osmotik akar)."
      );
    }
    if (emergingSymptoms.length === 0) {
      emergingSymptoms.push(
        "Tidak ada gejala anomali air yang mengkhawatirkan; kestabilan biokimia diprediksi terjaga aman dalam 6-12 jam ke depan."
      );
    }

    const waterForecast =
      emergingSymptoms.length === 1 && emergingSymptoms[0].startsWith("Tidak ada")
        ? `Parameter air cenderung stabil (ΔpH ${phDelta >= 0 ? "+" : ""}${phDelta}, ΔSuhu ${waterTempDelta >= 0 ? "+" : ""}${waterTempDelta}°C, ΔDO ${doDelta >= 0 ? "+" : ""}${doDelta} mg/L). Aman untuk sirkulasi kaskade 24 jam.`
        : `Terdeteksi ${emergingSymptoms.length} sinyal gejala dini dari tren telemetri (ΔpH ${phDelta >= 0 ? "+" : ""}${phDelta}, ΔSuhu ${waterTempDelta >= 0 ? "+" : ""}${waterTempDelta}°C, ΔDO ${doDelta >= 0 ? "+" : ""}${doDelta} mg/L).`;

    // 2. Domain Diagnosis: WATER
    let waterStatus: HealthSeverity = "OPTIMAL";
    const waterDetails: string[] = [];
    const waterRecs: string[] = [];

    if (s.ph < 6.2 || s.ph > 7.8) {
      waterStatus = "CRITICAL";
      waterDetails.push(`pH air kritis (${s.ph}) di luar zona aman simbiosis ikan-bakteri-tanaman (6.5-7.5).`);
      waterRecs.push(
        s.ph < 6.2
          ? "Tambahkan buffer basa Kalium Bikarbonat (KHCO3) bertahap."
          : "Turunkan pH perlahan dan ganti 15-20% air tandon."
      );
    } else if (s.ph < 6.5 || s.ph > 7.5) {
      waterStatus = worstSeverity(waterStatus, "WARNING");
      waterDetails.push(`pH air sedikit bergeser (${s.ph}, target ideal 6.5-7.5).`);
      waterRecs.push("Pantau tren pH selama 1 jam ke depan sebelum melakukan buffering.");
    } else {
      waterDetails.push(`pH netral ideal (${s.ph}) mendukung bakteri nitrifikasi & serapan hara.`);
    }

    if (s.waterTemperature > 29.5 || s.waterTemperature < 20.0) {
      waterStatus = "CRITICAL";
      waterDetails.push(`Suhu air ekstrem (${s.waterTemperature}°C).`);
      waterRecs.push("Aktifkan paranet peneduh / pendinginan evaporatif segera.");
    } else if (s.waterTemperature > 27.5) {
      waterStatus = worstSeverity(waterStatus, "WARNING");
      waterDetails.push(`Suhu air mulai hangat (${s.waterTemperature}°C).`);
    } else {
      waterDetails.push(`Suhu air sejuk stabil (${s.waterTemperature}°C).`);
    }

    if (s.waterLevel < 25) {
      waterStatus = "CRITICAL";
      waterDetails.push(`Ketinggian air sump sangat rendah (${s.waterLevel}%): risiko pompa dry-run!`);
      waterRecs.push("Segera isi ulang tandon Level 1 dengan air terdeklorinasi.");
    } else {
      waterDetails.push(`Volume air tandon tercukupi (${s.waterLevel}%).`);
    }

    // 3. Domain Diagnosis: PLANT (Pakcoy & Kangkung)
    let plantStatus: HealthSeverity = "OPTIMAL";
    const plantDetails: string[] = [];
    const plantRecs: string[] = [];

    if (s.lightIntensity < 250 && !actuators.growLight.isOn) {
      plantStatus = worstSeverity(plantStatus, "WARNING");
      plantDetails.push(
        `Intensitas cahaya LDR sangat rendah (${s.lightIntensity} lux) sementara Grow Light LED sedang MATI.`
      );
      plantRecs.push("Nyalakan LED Grow Light (RELAY-03) agar Pakcoy tidak etiolasi/kuntet.");
    } else if (s.lightIntensity > 22000) {
      plantStatus = worstSeverity(plantStatus, "WARNING");
      plantDetails.push(`Paparan cahaya sangat tinggi (${s.lightIntensity} lux), rawan penguapan berlebih.`);
      plantRecs.push("Pasang jaring peneduh paranet agar daun tidak layu siang hari.");
    } else {
      plantDetails.push(
        `Pencahayaan fotosintesis memadai (${s.lightIntensity} lux${actuators.growLight.isOn ? " + Grow Light aktif" : ""}).`
      );
    }

    if (s.ph > 7.5) {
      plantStatus = worstSeverity(plantStatus, "WARNING");
      plantDetails.push(`pH basa (${s.ph}) menghambat serapan Zat Besi (Fe) → risiko daun muda menguning (klorosis).`);
      plantRecs.push("Tambahkan kelat besi Fe-DTPA 2 ppm atau turunkan pH ke ~6.9.");
    }
    if (s.tds < 380) {
      plantStatus = worstSeverity(plantStatus, "WARNING");
      plantDetails.push(`Nutrisi TDS rendah (${s.tds} ppm) → suplai nitrat untuk Pakcoy/Kangkung kurang pekat.`);
      plantRecs.push("Pertahankan jadwal pakan ikan agar mineralisasi nutrisi meningkat.");
    } else if (s.tds > 950) {
      plantStatus = "CRITICAL";
      plantDetails.push(`TDS terlalu pekat (${s.tds} ppm) → risiko busuk/gosong tepi daun.`);
      plantRecs.push("Encerkan air tandon sebesar 20%.");
    } else {
      plantDetails.push(`Ketersediaan nutrisi terlarut seimbang (${s.tds} ppm).`);
    }

    // 4. Domain Diagnosis: FISH (Nila L3 & Lele L1)
    let fishStatus: HealthSeverity = "OPTIMAL";
    const fishDetails: string[] = [];
    const fishRecs: string[] = [];

    if (s.dissolvedOxygen < 4.5) {
      fishStatus = "CRITICAL";
      fishDetails.push(`Oksigen terlarut kritis (${s.dissolvedOxygen} mg/L) → bahaya hipoksia bagi Ikan Nila (L3)!`);
      fishRecs.push("Nyalakan Aerator O2 maksimal & hentikan pemberian pakan sementara!");
    } else if (s.dissolvedOxygen < 5.3) {
      fishStatus = worstSeverity(fishStatus, "WARNING");
      fishDetails.push(`Oksigen terlarut batas bawah untuk Nila (${s.dissolvedOxygen} mg/L; aman untuk Lele L1).`);
      fishRecs.push("Pastikan selang batu aerator tidak tersumbat lumut.");
    } else {
      fishDetails.push(`Saturasi oksigen melimpah (${s.dissolvedOxygen} mg/L) untuk Nila L3 & Lele L1.`);
    }

    if (s.ph > 7.8 && s.waterTemperature > 28.0) {
      fishStatus = "CRITICAL";
      fishDetails.push("Kombinasi pH tinggi + suhu hangat mempercepat konversi amonia menjadi racun NH3.");
      fishRecs.push("Kuras 20% air dasar dan tunda pakan selama 24 jam.");
    }

    if (!actuators.waterPump.isOn) {
      fishStatus = worstSeverity(fishStatus, "WARNING");
      fishDetails.push("Pompa sirkulasi mati → limbah amonia ikan belum teralirkan ke biofilter tanaman.");
      fishRecs.push("Nyalakan kembali Pompa Sirkulasi 12V jika level air aman.");
    }

    // 5. Harvest Predictions (Dynamic GDD from seed + Fish cohort growth)
    const pakcoyHarvest = computeHarvestItem(
      "pakcoy",
      s.waterTemperature,
      s.lightIntensity,
      effectivePakcoyDays,
      cohort.pakcoy
    );
    const kangkungHarvest = computeHarvestItem(
      "kangkung",
      s.waterTemperature,
      s.lightIntensity,
      effectiveKangkungDays,
      cohort.kangkung
    );

    const fishPredictions: EcosystemDiagnosticReport["predictions"]["fish"] = {};
    if (cohort.nila.enabled) {
      fishPredictions.nila = computeFishHarvestItem(cohort.nila, s);
    }
    if (cohort.lele.enabled) {
      fishPredictions.lele = computeFishHarvestItem(cohort.lele, s);
    }

    // 6. Suggested Safe Actuator Actions
    const suggestedActions: EcosystemDiagnosticReport["suggestedActions"] = [];
    if (!actuators.aerator.isOn && (s.dissolvedOxygen < 5.8 || s.waterTemperature > 28.0)) {
      suggestedActions.push({
        actuatorId: "aerator",
        label: "Nyalakan Aerator Oksigen",
        targetState: true,
        reason: `DO (${s.dissolvedOxygen} mg/L) atau suhu (${s.waterTemperature}°C) butuh injeksi oksigen.`,
      });
    }
    if (!actuators.growLight.isOn && s.lightIntensity < 300) {
      suggestedActions.push({
        actuatorId: "growLight",
        label: "Nyalakan LED Grow Light",
        targetState: true,
        reason: `Sensor LDR mendeteksi cahaya rendah (${s.lightIntensity} lux).`,
      });
    }
    if (!actuators.waterPump.isOn && s.waterLevel >= 25) {
      suggestedActions.push({
        actuatorId: "waterPump",
        label: "Nyalakan Pompa Sirkulasi",
        targetState: true,
        reason: "Sirkulasi air biofilter sedang mati padahal air tandon cukup.",
      });
    }
    if (!actuators.dosingPump.isOn && s.ph < 6.4) {
      suggestedActions.push({
        actuatorId: "dosingPump",
        label: "Aktifkan Pompa Buffer pH",
        targetState: true,
        reason: `pH air terlalu asam (${s.ph}).`,
      });
    }

    const overallStatus = worstSeverity(worstSeverity(waterStatus, plantStatus), fishStatus);

    return {
      timestamp: snap.timestamp,
      overallStatus,
      sensors: s,
      sensorSources: sources,
      edgeOnline: snap.system.edgeOnline,
      cohort,
      diagnosis: {
        plant: {
          status: plantStatus,
          headline:
            plantStatus === "OPTIMAL"
              ? "Pertumbuhan Pakcoy & Kangkung Sehat"
              : "Perlu Penyesuaian Cahaya / Hara Tanaman",
          details: plantDetails,
          recommendation: plantRecs.join(" ") || "Pertahankan jadwal penyinaran 12-14 jam/hari dan TDS 500-750 ppm.",
        },
        water: {
          status: waterStatus,
          headline:
            waterStatus === "OPTIMAL"
              ? "Kualitas Fisiko-Kimia Air Seimbang"
              : "Terdeteksi Deviasi Kualitas Air",
          details: waterDetails,
          recommendation: waterRecs.join(" ") || "Sirkulasi biofilter berjalan baik tanpa perlu koreksi kimia.",
        },
        fish: {
          status: fishStatus,
          headline:
            fishStatus === "OPTIMAL"
              ? "Ikan Nila & Lele Aktif & Bebas Stres"
              : "Waspada Stres Oksigen / Kualitas Kolam Ikan",
          details: fishDetails,
          recommendation: fishRecs.join(" ") || "Pertahankan pemberian pakan 2x sehari (07:00 & 16:30 WIB) agar FCR tetap optimal.",
        },
      },
      predictions: {
        trends: {
          sampleCount: history.length,
          phDelta,
          waterTempDelta,
          tdsDelta,
          doDelta,
          lightDelta,
          waterForecast,
          emergingSymptoms,
        },
        harvest: {
          pakcoy: pakcoyHarvest,
          kangkung: kangkungHarvest,
        },
        fish: fishPredictions,
      },
      suggestedActions,
    };
  }

  private static isValidGeminiKey(apiKey?: string): apiKey is string {
    if (!apiKey) return false;
    const trimmed = apiKey.trim();
    if (!trimmed) return false;
    if (
      trimmed.includes("PASTE_API_KEY") ||
      trimmed.includes("your_gemini_api_key")
    ) {
      return false;
    }
    return trimmed.length >= 20;
  }

  private static detectCategory(message: string): AgriBotChatResponse["category"] {
    const q = message.toLowerCase();
    if (
      q.includes("prediksi") ||
      q.includes("panen") ||
      q.includes("gejala") ||
      q.includes("ramal") ||
      q.includes("kedepan") ||
      q.includes("tren") ||
      q.includes("gdd")
    ) {
      return "prediction";
    }
    if (
      q.includes("diagnos") ||
      q.includes("sakit") ||
      q.includes("kuning") ||
      q.includes("layu") ||
      q.includes("megap") ||
      q.includes("mati") ||
      q.includes("kondisi") ||
      q.includes("air") ||
      q.includes("ikan") ||
      q.includes("tumbuhan") ||
      q.includes("tanam")
    ) {
      return "diagnosis";
    }
    if (q.includes("saran") || q.includes("solusi") || q.includes("pompa") || q.includes("lampu")) {
      return "advisory";
    }
    return "general";
  }

  private static buildFallbackReply(
    message: string,
    diag: EcosystemDiagnosticReport,
    hasImages: boolean = false
  ): string {
    const q = message.toLowerCase();
    const s = diag.sensors;
    const { pakcoy, kangkung } = diag.predictions.harvest;
    const ldrBadge = "Sensor LDR ESP32";

    if (hasImages) {
      return [
        `### 🔍 Foto Diterima — Sinkronisasi Telemetri & Evaluasi Awal`,
        `Gambar berhasil diterima (${ldrBadge} saat ini: **${s.lightIntensity} lux**, pH **${s.ph}**, TDS **${s.tds} ppm**, Suhu **${s.waterTemperature}°C**, DO **${s.dissolvedOxygen} mg/L**).`,
        `- **Analisis Visual AI Penuh**: Pemeriksaan pola bercak daun / gejala eksternal ikan memerlukan model Vision Gemini aktif pada backend.`,
        `- **Korelasi Parameter IoT Saat Ini**:\n  - Tumbuhan: ${diag.diagnosis.plant.details[0]}\n  - Kualitas Air: ${diag.diagnosis.water.details[0]}\n  - Ikan Nila & Lele: ${diag.diagnosis.fish.details[0]}`,
        `**Rekomendasi**: ${diag.diagnosis.plant.recommendation}`,
      ].join("\n\n");
    }

    const asksHarvest =
      q.includes("panen") || q.includes("pakcoy") || q.includes("kangkung") || q.includes("gdd");
    const asksPrediction =
      q.includes("prediksi") || q.includes("gejala") || q.includes("tren");
    const asksFish =
      q.includes("ikan") || q.includes("nila") || q.includes("lele") || q.includes("megap");
    const asksPlant =
      q.includes("tumbuhan") ||
      q.includes("tanaman") ||
      q.includes("daun") ||
      q.includes("kuning") ||
      q.includes("cahaya") ||
      q.includes("ldr");
    const asksWater =
      q.includes("air") || q.includes("ph") || q.includes("suhu") || q.includes("tds");

    const topicCount = [asksHarvest, asksPrediction, asksFish, asksPlant, asksWater].filter(Boolean).length;

    // Targeted responses only when focusing on a single topic
    if (topicCount === 1) {
      if (asksHarvest) {
        const fishLines: string[] = [];
        if (diag.predictions.fish?.nila) {
          const n = diag.predictions.fish.nila;
          fishLines.push(
            `- **Ikan Nila (Kolam L3 — ${n.count} ekor)**: **${n.estimatedDaysRemaining} hari lagi** (${n.estimatedHarvestDate}) • Ukuran saat ini **~${n.estimatedCurrentLengthCm} cm** → target **${n.targetHarvestLengthCm} cm** • Estimasi panen **~${n.projectedTotalYieldKg} kg**.`
          );
        }
        if (diag.predictions.fish?.lele) {
          const l = diag.predictions.fish.lele;
          fishLines.push(
            `- **Ikan Lele (Kolam L1 — ${l.count} ekor)**: **${l.estimatedDaysRemaining} hari lagi** (${l.estimatedHarvestDate}) • Ukuran saat ini **~${l.estimatedCurrentLengthCm} cm** → target **${l.targetHarvestLengthCm} cm** • Estimasi panen **~${l.projectedTotalYieldKg} kg**.`
          );
        }
        return [
          `### 📅 Prediksi Panen Tanaman (Benih → Panen GDD) & Budidaya Ikan`,
          `- **Pakcoy (Level 4 — ${pakcoy.plantCount} netpot, semai ${pakcoy.seedingDate})**: **${pakcoy.estimatedDaysRemaining} hari lagi** (${pakcoy.estimatedHarvestDate}) • Progress **${pakcoy.progressPct}%** (${pakcoy.accumulatedGdd}/${pakcoy.targetGdd} °C·Hari) • Estimasi bobot **~${pakcoy.projectedBiomassGrams}g/pod** (total **~${pakcoy.projectedTotalYieldKg} kg**).`,
          `- **Kangkung (Level 2 — ${kangkung.plantCount} netpot, semai ${kangkung.seedingDate})**: **${kangkung.estimatedDaysRemaining} hari lagi** (${kangkung.estimatedHarvestDate}) • Progress **${kangkung.progressPct}%** (${kangkung.accumulatedGdd}/${kangkung.targetGdd} °C·Hari) • Estimasi bobot **~${kangkung.projectedBiomassGrams}g/ikat** (total **~${kangkung.projectedTotalYieldKg} kg**).`,
          ...fishLines,
          `- **Faktor Cahaya (${ldrBadge})**: Terukur **${s.lightIntensity} lux** (Efisiensi fotosintesis **${pakcoy.lightEfficiencyPct}%**). ${s.lightIntensity < 300 ? "Cahaya sangat redup berpotensi memundurkan panen jika Grow Light tidak dinyalakan." : "Cahaya mendukung laju pematangan daun."}`,
        ].join("\n\n");
      }

      if (asksPrediction) {
        return [
          `### 🔮 Prediksi Kondisi & Gejala Dini Air`,
          diag.predictions.trends.waterForecast,
          `**Potensi Gejala yang Teridentifikasi:**\n${diag.predictions.trends.emergingSymptoms.map((item) => `- ${item}`).join("\n")}`,
          `**Rekomendasi Mitigasi:**\n- Air: ${diag.diagnosis.water.recommendation}\n- Ikan: ${diag.diagnosis.fish.recommendation}`,
        ].join("\n\n");
      }

      if (asksFish) {
        return [
          `### 🐟 Diagnosis Kondisi Ikan (${diag.diagnosis.fish.status})`,
          diag.diagnosis.fish.details.map((d) => `- ${d}`).join("\n"),
          `**Parameter Pendukung**: DO **${s.dissolvedOxygen} mg/L** | Suhu Air **${s.waterTemperature}°C** | pH **${s.ph}**.`,
          `**Saran Tindakan**: ${diag.diagnosis.fish.recommendation}`,
        ].join("\n\n");
      }

      if (asksPlant) {
        return [
          `### 🌱 Diagnosis Kondisi Tumbuhan (${diag.diagnosis.plant.status})`,
          diag.diagnosis.plant.details.map((d) => `- ${d}`).join("\n"),
          `**Pembacaan Cahaya (${ldrBadge})**: **${s.lightIntensity} lux** | **pH**: **${s.ph}** | **TDS Nutrisi**: **${s.tds} ppm**.`,
          `**Saran Tindakan**: ${diag.diagnosis.plant.recommendation}`,
        ].join("\n\n");
      }

      if (asksWater) {
        return [
          `### 💧 Diagnosis Kondisi Air (${diag.diagnosis.water.status})`,
          diag.diagnosis.water.details.map((d) => `- ${d}`).join("\n"),
          `**Saran Tindakan**: ${diag.diagnosis.water.recommendation}`,
        ].join("\n\n");
      }
    }

    // Comprehensive 3-domain diagnosis + predictions summary
    return [
      `### 🔬 Ringkasan Diagnosis & Prediksi UrbanGrow (${diag.overallStatus})`,
      `**1. 🌱 Tumbuhan (${diag.diagnosis.plant.status})**: ${diag.diagnosis.plant.details[0]} *(Cahaya ${ldrBadge}: ${s.lightIntensity} lux)*`,
      `**2. 💧 Air (${diag.diagnosis.water.status})**: pH **${s.ph}**, Suhu **${s.waterTemperature}°C**, TDS **${s.tds} ppm**. ${diag.diagnosis.water.recommendation}`,
      `**3. 🐟 Ikan (${diag.diagnosis.fish.status})**: DO **${s.dissolvedOxygen} mg/L**. ${diag.diagnosis.fish.details[0]}`,
      `**4. 🔮 Prediksi Panen & Gejala Air**:\n- Pakcoy siap panen **${pakcoy.estimatedDaysRemaining} hari lagi**; Kangkung **${kangkung.estimatedDaysRemaining} hari lagi**.\n- ${diag.predictions.trends.emergingSymptoms[0]}`,
    ].join("\n\n");
  }

  private static buildFallbackCharts(
    message: string,
    diag: EcosystemDiagnosticReport,
    sampledHistory: SampledHistoryPoint[]
  ): AgriBotChartSpec[] {
    const q = message.toLowerCase();
    const wantsChart =
      q.includes("grafik") ||
      q.includes("chart") ||
      q.includes("diagram") ||
      q.includes("plot") ||
      q.includes("visual") ||
      q.includes("ringkas") ||
      q.includes("statistik");
    if (!wantsChart) return [];

    let theme: AgriBotChartTheme = "emerald";
    if (q.includes("neon") || q.includes("cyber")) theme = "neon";
    else if (q.includes("dark") || q.includes("gelap") || q.includes("malam")) theme = "dark";
    else if (q.includes("ocean") || q.includes("biru") || q.includes("laut")) theme = "ocean";
    else if (q.includes("sunset") || q.includes("hangat") || q.includes("oranye")) theme = "sunset";
    else if (q.includes("minimal")) theme = "minimal";
    else if (q.includes("brutal")) theme = "brutalist";
    else if (q.includes("light") || q.includes("terang")) theme = "light";

    let chartType: AgriBotChartType = "line";
    if (q.includes("donut") || q.includes("donat")) chartType = "donut";
    else if (q.includes("pie") || q.includes("lingkaran")) chartType = "pie";
    else if (q.includes("radar") || q.includes("jaring")) chartType = "radar";
    else if (q.includes("scatter") || q.includes("sebar") || q.includes("korelasi")) chartType = "scatter";
    else if (q.includes("horizontal")) chartType = "horizontal_bar";
    else if (q.includes("bar") || q.includes("batang") || q.includes("kolom")) chartType = "bar";
    else if (q.includes("area")) chartType = "area";
    else if (q.includes("radial") || q.includes("gauge")) chartType = "radial";
    else if (q.includes("heatmap")) chartType = "heatmap";
    else if (q.includes("kombinasi") || q.includes("composed")) chartType = "composed";

    const s = diag.sensors;
    const labels = sampledHistory.map((h) => h.timeWib);

    if (chartType === "pie" || chartType === "donut") {
      const snap = simulator.getSnapshot();
      const relayLabels = Object.values(snap.actuators).map((a) => a.name);
      const relayWatts = Object.values(snap.actuators).map((a) => (a.isOn ? a.powerWatts : 2));
      return [
        {
          id: "fallback-pie",
          title: "Distribusi Beban Daya Aktuator IoT",
          subtitle: "Proporsi daya perangkat keras aktif pada node ESP32-GROW-01",
          chartType,
          labels: relayLabels,
          series: [{ name: "Daya Aktif", unit: "W", values: relayWatts }],
          style: { theme, showValues: true, showLegend: true, unit: "W" },
        },
      ];
    }

    if (chartType === "radar" || chartType === "radial") {
      const phScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(s.ph - 7.0) * 35)));
      const doScore = Math.max(0, Math.min(100, Math.round((s.dissolvedOxygen / 8.0) * 100)));
      const tempScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(s.waterTemperature - 24.5) * 12)));
      const tdsScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(s.tds - 580) * 0.12)));
      const luxScore = Math.max(25, Math.min(100, Math.round((s.lightIntensity / 1200) * 100)));
      return [
        {
          id: "fallback-radar",
          title: "Indeks Kesehatan Multi-Parameter Akuaponik (%)",
          subtitle: "Skor kelayakan ekosistem berdasarkan standar ECAD v2.0",
          chartType,
          labels: ["pH Air", "Oksigen DO", "Suhu Air", "TDS Nutrisi", "Cahaya LDR", "Level Air"],
          series: [
            {
              name: "Kondisi Aktual",
              unit: "%",
              values: [phScore, doScore, tempScore, tdsScore, luxScore, Math.round(s.waterLevel)],
            },
            ...(chartType === "radar"
              ? [{ name: "Target Optimal", unit: "%", values: [95, 95, 95, 95, 90, 95] }]
              : []),
          ],
          style: { theme, showGrid: true, showLegend: true, unit: "%" },
        },
      ];
    }

    if (chartType === "scatter") {
      return [
        {
          id: "fallback-scatter",
          title: "Korelasi Suhu Air vs Oksigen Terlarut (DO)",
          subtitle: `${sampledHistory.length} titik pembacaan terbaru ESP32-GROW-01`,
          chartType: "scatter",
          labels,
          series: [
            {
              name: "Suhu vs DO",
              unit: "mg/L",
              values: sampledHistory.map((h) => h.dissolvedOxygen),
              points: sampledHistory.map((h) => ({
                x: h.waterTemperature,
                y: h.dissolvedOxygen,
                label: h.timeWib,
              })),
            },
          ],
          style: { theme, showGrid: true, xLabel: "Suhu Air (°C)", yLabel: "DO (mg/L)" },
        },
      ];
    }

    if (chartType === "bar" || chartType === "horizontal_bar") {
      return [
        {
          id: "fallback-bar",
          title: "Ringkasan Telemetri Sensor IoT Terkini",
          subtitle: "Pembacaan langsung node ESP32-GROW-01",
          chartType,
          labels: ["pH (×10)", "Suhu (°C)", "TDS (÷10)", "DO (×10)", "Cahaya (÷10 lux)", "Tandon (%)"],
          series: [
            {
              name: "Nilai Terukur (Ternormalisasi)",
              values: [
                Number((s.ph * 10).toFixed(1)),
                Number(s.waterTemperature.toFixed(1)),
                Math.round(s.tds / 10),
                Number((s.dissolvedOxygen * 10).toFixed(1)),
                Math.round(s.lightIntensity / 10),
                Math.round(s.waterLevel),
              ],
            },
          ],
          style: { theme, showGrid: true, showValues: true },
        },
      ];
    }

    return [
      {
        id: "fallback-timeseries",
        title: "Ringkasan Tren Telemetri IoT Real-Time",
        subtitle: `Riwayat ${sampledHistory.length} sampel terbaru ESP32-GROW-01 (WIB)`,
        chartType,
        labels,
        series: [
          { name: "pH Air", unit: "pH", values: sampledHistory.map((h) => h.ph), type: "line" },
          {
            name: "Oksigen DO",
            unit: "mg/L",
            values: sampledHistory.map((h) => h.dissolvedOxygen),
            type: "line",
          },
          {
            name: "Suhu Air",
            unit: "°C",
            values: sampledHistory.map((h) => h.waterTemperature),
            type: "bar",
          },
        ],
        style: { theme, curve: "smooth", showGrid: true, showLegend: true },
      },
    ];
  }

  static async chat(req: AgriBotChatRequest): Promise<AgriBotChatResponse> {
    const diagnostics = this.buildDiagnostics(
      req.cropDayPakcoy,
      req.cropDayKangkung
    );
    const snap = simulator.getSnapshot();
    const rawHistory = simulator.getHistory();
    const stride = Math.max(1, Math.floor(rawHistory.length / 12));
    const sampledHistory: SampledHistoryPoint[] = rawHistory
      .filter((_, i) => i % stride === 0 || i === rawHistory.length - 1)
      .slice(-12)
      .map((pt) => ({
        timeWib: new Date(pt.timestamp).toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        ph: pt.sensors.ph,
        waterTemperature: pt.sensors.waterTemperature,
        tds: pt.sensors.tds,
        dissolvedOxygen: pt.sensors.dissolvedOxygen,
        lightIntensity: pt.sensors.lightIntensity,
        airTemperature: pt.sensors.airTemperature,
        humidity: pt.sensors.humidity,
        waterLevel: pt.sensors.waterLevel,
      }));

    const hasImages = Array.isArray(req.images) && req.images.length > 0;
    const category = this.detectCategory(req.message || "diagnosis gambar");
    const configuredModel = (process.env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!this.isValidGeminiKey(apiKey)) {
      return {
        success: true,
        reply: this.buildFallbackReply(req.message, diagnostics, hasImages),
        provider: "ecad_local_fallback",
        model: "ecad-rule-engine-v2",
        category,
        diagnostics,
        suggestedActions: diagnostics.suggestedActions,
        charts: this.buildFallbackCharts(req.message, diagnostics, sampledHistory),
      };
    }

    // Prioritize fast responsive flash-lite models for real-time multimodal chat UX
    const rawCandidates = [
      configuredModel === "gemini-2.5-flash" ? "gemini-3.5-flash-lite" : configuredModel,
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ];
    const modelCandidates = Array.from(new Set(rawCandidates)).slice(0, 4);

    const wibNow = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const summarizeMetric = (key: keyof typeof snap.sensors) => {
      const vals = rawHistory.map((pt) => pt.sensors[key]);
      if (vals.length === 0) return { min: snap.sensors[key], max: snap.sensors[key], avg: snap.sensors[key] };
      const sum = vals.reduce((acc, v) => acc + v, 0);
      return {
        min: Number(Math.min(...vals).toFixed(2)),
        max: Number(Math.max(...vals).toFixed(2)),
        avg: Number((sum / vals.length).toFixed(2)),
      };
    };

    const telemetryContextForAi = {
      timestamp: diagnostics.timestamp,
      overallStatus: diagnostics.overallStatus,
      edgeNode: "ESP32-GROW-01",
      edgeOnline: true,
      sensors: diagnostics.sensors,
      sensorSummaryStats: {
        sampleCount: rawHistory.length,
        ph: summarizeMetric("ph"),
        waterTemperature: summarizeMetric("waterTemperature"),
        tds: summarizeMetric("tds"),
        dissolvedOxygen: summarizeMetric("dissolvedOxygen"),
        lightIntensity: summarizeMetric("lightIntensity"),
        waterLevel: summarizeMetric("waterLevel"),
      },
      recentTimeSeries: sampledHistory,
      actuators: Object.values(snap.actuators).map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
        isOn: a.isOn,
        powerWatts: a.powerWatts,
      })),
      diagnosis: diagnostics.diagnosis,
      predictions: diagnostics.predictions,
      suggestedActions: diagnostics.suggestedActions,
    };

    const systemInstruction = `Kamu adalah **AgriBot**, asisten pakar AI sistem akuaponik pintar **UrbanGrow (ECAD v2.0)** milik tim SMK Telkom Sidoarjo.
Waktu lokal saat ini: ${wibNow} WIB (Lokasi: Sidoarjo, Jawa Timur).
Mandat utamamu:
1. Diagnosis kondisi & **penyakit tumbuhan** (Pakcoy L4 & Kangkung L2), **kualitas air**, serta **kesehatan & penyakit ikan** (Nila L3 & Lele L1) — termasuk **analisis visual foto/gambar** jika user mengunggah gambar daun, batang, akar, ikan, atau kondisi kolam!
2. Prediksi kondisi air ke depan, estimasi panen GDD, dan gejala dini kegagalan ekosistem.
3. Meringkas data IoT dan membuat **grafik/visualisasi dinamis dalam bentuk dan style apa pun** sesuai permintaan user!

ATURAN KETAT:
- Selalu gunakan waktu lokal WIB jika menyebut jam.
- Selalu dasarkan angka pada **DATA TELEMETRI REAL-TIME & HISTORI** di bawah (jangan mengarang angka sensor).
- **Jika user mengunggah gambar**: lakukan analisis patologi visual mendetail terhadap gambar tersebut (misal: klorosis tepi daun, defisiensi Fe/N/K, bercak jamur, kutu/hama, busuk akar, white spot/Ich, fin rot, jamur kapas, bercak merah hemoragik, mata menonjol, atau air keruh algae), jelaskan tingkat keyakinanmu, kaitkan dengan data telemetri IoT aktual di bawah, dan berikan langkah perawatan praktis. Jika gambar buram atau bukan tanaman/ikan, jelaskan dengan jujur.
- **Jika user meminta grafik, chart, diagram, plot, visualisasi, statistik, atau ringkasan data IoT**: sertakan array \`"charts"\` pada output JSON menggunakan data nyata dari \`recentTimeSeries\`, \`sensorSummaryStats\`, \`actuators\`, atau \`predictions.harvest\`.
  - Pilih \`chartType\` paling sesuai atau persis sesuai permintaan user: \`"line"\`, \`"area"\`, \`"bar"\`, \`"horizontal_bar"\`, \`"pie"\`, \`"donut"\`, \`"radar"\`, \`"scatter"\`, \`"composed"\`, \`"radial"\`, atau \`"heatmap"\`.
  - Pilih \`style\` sesuai permintaan gaya/nuansa user (\`"theme"\`: \`"light"\` | \`"dark"\` | \`"emerald"\` | \`"ocean"\` | \`"sunset"\` | \`"neon"\` | \`"minimal"\` | \`"brutalist"\`, plus \`"curve"\`: \`"smooth"\` | \`"linear"\` | \`"step"\`, dan opsional \`"palette"\` array hex color seperti \`["#165B39", "#0284C7", "#F59E0B"]\`).
  - Untuk \`scatter\`, isi \`points: [{ "x": <num>, "y": <num>, "label": "<waktu>" }]\` pada series.
  - Untuk \`radar\` atau \`radial\`, normalisasikan skor ke skala \`0-100\` (\`unit: "%"\`) agar sumbu terbaca seimbang.
- Jika user tidak meminta grafik atau visualisasi data, isi \`"charts": []\`.
- Jawab dalam **Bahasa Indonesia yang rapi, terstruktur (pakai heading markdown \`###\`, poin, bold, tabel markdown bila membantu), hangat, dan berbasis sains akuaponik**.

DATA KONTEKS EKOSISTEM SAAT INI:
${JSON.stringify(telemetryContextForAi, null, 2)}

KELUARKAN RESPONSE HARUS BERUPA JSON VALID DENGAN STRUKTUR:
{
  "reply": "String markdown jawaban lengkap dalam Bahasa Indonesia",
  "category": "diagnosis" | "prediction" | "advisory" | "general",
  "charts": [
    {
      "id": "chart-1",
      "title": "Judul Grafik",
      "subtitle": "Subjudul singkat sumber data ESP32-GROW-01",
      "chartType": "line",
      "labels": ["13:20", "13:22"],
      "series": [
        { "name": "Nama Metrik", "unit": "pH", "type": "line", "values": [6.95, 6.96] }
      ],
      "style": {
        "theme": "emerald",
        "curve": "smooth",
        "showGrid": true,
        "showLegend": true
      }
    }
  ]
}`;

    const recentTurns = (req.history || []).slice(-10).map((turn) => ({
      role: turn.role === "assistant" || turn.role === "bot" || turn.role === "model" ? "model" : "user",
      parts: [{ text: turn.text }],
    }));

    const userParts: Array<Record<string, unknown>> = [];
    for (const img of (req.images || []).slice(0, 3)) {
      const cleanBase64 = img.data.replace(/^data:[^;]+;base64,/, "").trim();
      if (cleanBase64) {
        userParts.push({
          inline_data: {
            mime_type: img.mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      }
    }
    userParts.push({
      text:
        req.message.trim() ||
        "Tolong analisis kondisi atau potensi penyakit tumbuhan/ikan dari gambar ini serta hubungkan dengan data sensor IoT saat ini.",
    });

    const contents = [
      ...recentTurns,
      { role: "user", parts: userParts },
    ];

    for (const candidateModel of modelCandidates) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey.trim(),
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 3200,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (!response.ok) {
          console.warn(`[GEMINI-CHAT] Model ${candidateModel} returned ${response.status}; trying next candidate.`);
          continue;
        }

        const json = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };

        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!rawText) {
          continue;
        }

        let parsedReply = rawText;
        let parsedCategory = category;
        let parsedCharts: AgriBotChartSpec[] = [];

        try {
          const cleanedJson = rawText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();
          const obj = JSON.parse(cleanedJson);
          if (typeof obj.reply === "string" && obj.reply.trim()) {
            parsedReply = obj.reply.trim();
          }
          if (
            obj.category === "diagnosis" ||
            obj.category === "prediction" ||
            obj.category === "advisory" ||
            obj.category === "general"
          ) {
            parsedCategory = obj.category;
          }
          if (Array.isArray(obj.charts)) {
            parsedCharts = sanitizeChartSpecs(obj.charts);
          }
        } catch {
          // Gemini returned markdown directly; keep rawText cleanly
        }

        return {
          success: true,
          reply: parsedReply,
          provider: "gemini",
          model: candidateModel,
          category: parsedCategory,
          diagnostics,
          suggestedActions: diagnostics.suggestedActions,
          charts: parsedCharts,
        };
      } catch (err: any) {
        console.warn(`[GEMINI-CHAT] Model ${candidateModel} failed: ${err?.message || "Unknown error"}`);
      }
    }

    return {
      success: true,
      reply: this.buildFallbackReply(req.message, diagnostics, hasImages),
      provider: "ecad_local_fallback",
      model: "ecad-rule-engine-v2",
      category,
      diagnostics,
      suggestedActions: diagnostics.suggestedActions,
      charts: this.buildFallbackCharts(req.message, diagnostics, sampledHistory),
    };
  }
}
