export interface SensorData {
  ph: number;
  tds: number;
  waterTemperature: number;
  airTemperature: number;
  humidity: number;
  lightIntensity: number;
  dissolvedOxygen: number;
  waterLevel: number;
}

export type SensorKey = keyof SensorData;
export type SensorSource = "live_iot" | "auto_dummy";
export type SensorSourcesMap = Record<SensorKey, SensorSource>;

export interface IoTSystemMeta {
  status: string;
  mode: "hybrid_live_iot" | "auto_dummy_simulation" | string;
  anomalyMode: string;
  uptimeSeconds: number;
  edgeNode: string;
  edgeOnline: boolean;
  liveSensorCount: number;
  lastTelemetryAt: string | null;
  wifiSignalDbm: number;
}

export interface ActuatorState {
  id: string;
  name: string;
  code: string;
  type?: "pump" | "aerator" | "light" | "feeder" | "dosing" | string;
  isOn: boolean;
  mode?: "auto" | "manual";
  powerWatts: number;
  voltage: string;
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

export interface HarvestForecastItem {
  cropType: "pakcoy" | "kangkung";
  label: string;
  level: string;
  daysSincePlanting: number;
  accumulatedGdd: number;
  targetGdd: number;
  progressPct: number;
  estimatedDaysRemaining: number;
  estimatedHarvestDate: string;
  projectedBiomassGrams: number;
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
  };
  suggestedActions: SuggestedAction[];
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
