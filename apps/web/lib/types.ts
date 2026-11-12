export interface SensorData {
  ph: number | null;
  tds: number | null;
  waterTemperature: number | null;
  airTemperature: number | null;
  humidity: number | null;
  lightIntensity: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
}

export type SensorKey = keyof SensorData;
export type SensorSource = "live_iot" | "offline";
export type SensorSourcesMap = Record<SensorKey, SensorSource>;

export interface IoTSystemMeta {
  status: string;
  mode: "live_iot" | "partial_live_iot" | "heartbeat_only" | "offline" | string;
  anomalyMode: string;
  uptimeSeconds: number;
  edgeNode: string;
  edgeOnline: boolean;
  liveSensorCount: number;
  lastTelemetryAt: string | null;
  wifiSignalDbm: number | null;
}

export interface ActuatorState {
  id: string;
  name: string;
  code: string;
  type?: "pump" | "aerator" | "light" | "feeder" | string;
  isOn: boolean;
  mode?: "auto" | "manual";
  powerWatts: number;
  voltage: string;
  installed?: boolean;
  hardwareStatus?: "ready" | "development" | "offline";
  hardwareReason?: string;
}

export interface HistorySample {
  timestamp: string;
  sensors: SensorData;
  actuators: Record<string, boolean>;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  severity: "critical" | "warning" | "info";
  isResolved: boolean;
}

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
  seedingDate?: string;
  plantCount?: number;
  propagatedFromSeed?: boolean;
  daysSincePlanting: number;
  accumulatedGdd: number;
  targetGdd: number;
  progressPct: number;
  estimatedDaysRemaining: number;
  estimatedHarvestDate: string;
  projectedBiomassGrams: number;
  projectedTotalYieldKg?: number;
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

export interface SuggestedAction {
  actuatorId: string;
  label: string;
  targetState: boolean;
  reason: string;
}

export interface EcosystemDiagnosticReport {
  timestamp: string;
  overallStatus: HealthSeverity;
  sensors: SensorData;
  sensorSources: SensorSourcesMap;
  edgeOnline: boolean;
  cohort?: PredictionCohortConfig;
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
    fish?: {
      nila?: FishHarvestForecastItem;
      lele?: FishHarvestForecastItem;
    };
  };
  suggestedActions: SuggestedAction[];
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
  previewUrl?: string;
}

export interface AgriBotChatTurn {
  role: "user" | "assistant" | "bot" | "model";
  text: string;
}

export interface AgriBotChatResponse {
  success: boolean;
  reply: string;
  provider: "gemini" | "ecad_local_fallback" | "offline_fallback";
  model: string;
  category: "diagnosis" | "prediction" | "advisory" | "general";
  diagnostics: EcosystemDiagnosticReport;
  suggestedActions: SuggestedAction[];
  charts?: AgriBotChartSpec[];
  latencyMs?: number;
}

export interface BackendAlertItem {
  id?: string;
  severity?: "info" | "warning" | "critical";
  metric?: string;
  message: string;
  timestamp?: string;
  isResolved?: boolean;
}

export interface BackendTelemetrySnapshot {
  timestamp?: string;
  sensors?: SensorData;
  sensorSources?: Partial<SensorSourcesMap>;
  actuators?: Record<string, Partial<ActuatorState> & { isOn: boolean }>;
  alerts?: BackendAlertItem[];
  system?: Partial<IoTSystemMeta>;
}

export interface AutomationSchedule {
  id: string;
  title: string;
  triggerType: "time" | "sensor_threshold";
  scheduleTime: string | null;
  sensorMetric: string | null;
  operator: "<" | ">" | null;
  thresholdValue: number | null;
  actuatorId: string;
  targetState: boolean;
  notes: string;
  enabled: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export interface ActuatorAuditLog {
  id: number;
  actuatorId: string;
  actuatorName: string;
  state: boolean;
  triggeredBy: string;
  note: string;
  recordedAt: string;
}

export interface PersistedSystemAlert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  metric: string;
  isResolved: boolean;
  recordedAt: string;
}
