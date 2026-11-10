export interface SensorReading {
  ph: number;
  tds: number;
  waterTemperature: number;
  airTemperature: number;
  humidity: number;
  lightIntensity: number;
  dissolvedOxygen: number;
  waterLevel: number;
}

export interface ActuatorState {
  id: string;
  name: string;
  code?: string;
  type: "pump" | "aerator" | "light" | "feeder" | "dosing" | string;
  isOn: boolean;
  mode: "auto" | "manual";
  powerWatts: number;
  voltage?: string;
}

export interface SystemAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  metric: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
}

export type AnomalyType = "none" | "ph_drop" | "heatwave" | "tds_spike";
export type SensorSource = "live_iot" | "auto_dummy";

export interface IoTDeviceStatus {
  deviceId: string;
  lastSeenAt: string;
  lastSeenMs: number;
  wifiRssiDbm?: number;
  firmwareVersion?: string;
  realSensors: Array<keyof SensorReading>;
}

export interface OverrideMeta {
  deviceId?: string;
  wifiRssiDbm?: number;
  firmwareVersion?: string;
  isLiveIot?: boolean;
}

const ACTUATOR_ALIASES: Record<string, string> = {
  pump: "waterPump",
  water_pump: "waterPump",
  waterPump: "waterPump",
  aerator: "aerator",
  growLight: "growLight",
  grow_light: "growLight",
  light: "growLight",
  feeder: "feeder",
  autoFeeder: "feeder",
  auto_feeder: "feeder",
  dosingPump: "dosingPump",
  dosing_pump: "dosingPump",
  dosing: "dosingPump",
};

const ALL_SENSOR_KEYS: Array<keyof SensorReading> = [
  "ph",
  "tds",
  "waterTemperature",
  "airTemperature",
  "humidity",
  "lightIntensity",
  "dissolvedOxygen",
  "waterLevel",
];

class AquaponicsSimulator {
  private state: SensorReading = {
    ph: 6.95,
    tds: 540,
    waterTemperature: 24.2,
    airTemperature: 27.5,
    humidity: 66.0,
    lightIntensity: 650,
    dissolvedOxygen: 7.2,
    waterLevel: 92.0,
  };

  private actuators: Record<string, ActuatorState> = {
    waterPump: {
      id: "waterPump",
      name: "Submersible Pump 12V",
      code: "RELAY-01",
      type: "pump",
      isOn: true,
      mode: "auto",
      powerWatts: 45,
      voltage: "12V DC",
    },
    aerator: {
      id: "aerator",
      name: "Dual-Port Air Pump",
      code: "RELAY-02",
      type: "aerator",
      isOn: true,
      mode: "auto",
      powerWatts: 18,
      voltage: "12V DC",
    },
    growLight: {
      id: "growLight",
      name: "Full-Spectrum LED Bar",
      code: "RELAY-03",
      type: "light",
      isOn: false,
      mode: "auto",
      powerWatts: 85,
      voltage: "12V DC",
    },
    feeder: {
      id: "feeder",
      name: "Feeder Otomatis Terjadwal",
      code: "RELAY-04",
      type: "feeder",
      isOn: true,
      mode: "auto",
      powerWatts: 12,
      voltage: "12V DC",
    },
    dosingPump: {
      id: "dosingPump",
      name: "pH Buffer Dosing Pump",
      code: "RELAY-05",
      type: "dosing",
      isOn: false,
      mode: "auto",
      powerWatts: 12,
      voltage: "12V DC",
    },
  };

  private anomalyMode: AnomalyType = "none";
  private history: Array<{
    timestamp: string;
    sensors: SensorReading;
    actuators: Record<string, boolean>;
  }> = [];

  constructor() {
    // Pre-populate 30 data points representing the last 15 minutes of generative data
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const pastTime = new Date(now - i * 30000).toISOString();
      this.stepSimulation();
      this.history.push({
        timestamp: pastTime,
        sensors: { ...this.state },
        actuators: this.getActuatorStatuses(),
      });
    }
  }

  private lastStepTimestamp: number = 0;
  private readonly STEP_INTERVAL_MS = 1500; // Cadence: step physical simulation every 1.5 seconds
  private liveSensorTtlMs: number = 15000; // Auto-fallback to dummy after 15s of silence
  private targetOverrides: Partial<SensorReading> = {};
  private liveSensorTimestamps: Partial<Record<keyof SensorReading, number>> = {};
  private connectedDevices: Map<string, IoTDeviceStatus> = new Map();
  private lastTelemetryAt: string | null = null;
  private feedPendingUntilMs: number = 0;

  private expireStaleLiveOverrides(now: number = Date.now()) {
    for (const key of ALL_SENSOR_KEYS) {
      const ts = this.liveSensorTimestamps[key];
      if (ts !== undefined && now - ts > this.liveSensorTtlMs) {
        delete this.liveSensorTimestamps[key];
        delete this.targetOverrides[key];
      }
    }
  }

  private isFieldLive(key: keyof SensorReading, now: number = Date.now()): boolean {
    const ts = this.liveSensorTimestamps[key];
    return ts !== undefined && now - ts <= this.liveSensorTtlMs;
  }

  public setLiveSensorTtlMs(ttlMs: number) {
    this.liveSensorTtlMs = Math.max(100, ttlMs);
  }

  public resetLiveOverrides() {
    this.targetOverrides = {};
    this.liveSensorTimestamps = {};
    this.connectedDevices.clear();
    this.lastTelemetryAt = null;
    this.state = {
      ph: 6.95,
      tds: 540,
      waterTemperature: 24.2,
      airTemperature: 27.5,
      humidity: 66.0,
      lightIntensity: 650,
      dissolvedOxygen: 7.2,
      waterLevel: 92.0,
    };
  }

  public getSensorSources(now: number = Date.now()): Record<keyof SensorReading, SensorSource> {
    this.expireStaleLiveOverrides(now);
    const sources = {} as Record<keyof SensorReading, SensorSource>;
    for (const key of ALL_SENSOR_KEYS) {
      sources[key] = this.isFieldLive(key, now) ? "live_iot" : "auto_dummy";
    }
    return sources;
  }

  public getIotDevices(now: number = Date.now()) {
    return Array.from(this.connectedDevices.values()).map((dev) => ({
      ...dev,
      online: now - dev.lastSeenMs <= this.liveSensorTtlMs,
    }));
  }

  // Smooth random walk with biological correlations (preserves live hardware values)
  public stepSimulation(force: boolean = false) {
    const now = Date.now();
    this.expireStaleLiveOverrides(now);

    const round = (val: number, decimals: number = 2) =>
      Number(val.toFixed(decimals));

    // Target values depending on anomaly state or auto-dummy defaults
    let targetPH = this.targetOverrides.ph ?? 7.0;
    let targetWaterTemp = this.targetOverrides.waterTemperature ?? 24.5;
    let targetTDS = this.targetOverrides.tds ?? 540;

    if (this.anomalyMode === "ph_drop") targetPH = 5.85;
    if (this.anomalyMode === "heatwave") targetWaterTemp = 30.2;
    if (this.anomalyMode === "tds_spike") targetTDS = 1120;

    // 1. pH
    if (this.isFieldLive("ph", now) && this.targetOverrides.ph !== undefined) {
      this.state.ph = this.targetOverrides.ph;
    } else {
      const phDelta = (targetPH - this.state.ph) * 0.01 + (Math.random() - 0.5) * 0.002;
      this.state.ph = round(Math.max(4.0, Math.min(10.0, this.state.ph + phDelta)), 2);
    }

    // 2. Water Temperature
    if (this.isFieldLive("waterTemperature", now) && this.targetOverrides.waterTemperature !== undefined) {
      this.state.waterTemperature = this.targetOverrides.waterTemperature;
    } else {
      const tempDelta = (targetWaterTemp - this.state.waterTemperature) * 0.008 + (Math.random() - 0.5) * 0.004;
      this.state.waterTemperature = round(this.state.waterTemperature + tempDelta, 1);
    }

    // 3. TDS
    if (this.isFieldLive("tds", now) && this.targetOverrides.tds !== undefined) {
      this.state.tds = this.targetOverrides.tds;
    } else {
      const tdsDelta = (targetTDS - this.state.tds) * 0.01 + (Math.random() - 0.5) * 0.3;
      this.state.tds = Math.round(this.state.tds + tdsDelta);
    }

    // 4. Air Temperature & Humidity
    if (this.isFieldLive("airTemperature", now) && this.targetOverrides.airTemperature !== undefined) {
      this.state.airTemperature = this.targetOverrides.airTemperature;
    } else {
      const airDelta = (Math.random() - 0.5) * 0.015;
      this.state.airTemperature = round(27.0 + (this.state.waterTemperature - 24.0) * 0.35 + airDelta, 1);
    }

    if (this.isFieldLive("humidity", now) && this.targetOverrides.humidity !== undefined) {
      this.state.humidity = this.targetOverrides.humidity;
    } else {
      this.state.humidity = round(
        Math.max(40, Math.min(90, 65.0 - (this.state.airTemperature - 25.0) * 1.2 + (Math.random() - 0.5) * 0.1)),
        1
      );
    }

    // 5. Dissolved Oxygen reacts biologically to aerator state unless live IoT overrides
    if (this.isFieldLive("dissolvedOxygen", now) && this.targetOverrides.dissolvedOxygen !== undefined) {
      this.state.dissolvedOxygen = this.targetOverrides.dissolvedOxygen;
    } else {
      const targetDO = this.actuators.aerator.isOn ? 7.4 : 4.4;
      const doDelta = (targetDO - this.state.dissolvedOxygen) * 0.012 + (Math.random() - 0.5) * 0.003;
      this.state.dissolvedOxygen = round(Math.max(2.0, Math.min(10.0, this.state.dissolvedOxygen + doDelta)), 2);
    }

    // 6. Light Intensity (Preserve exact hardware LDR reading when live!)
    if (this.isFieldLive("lightIntensity", now) && this.targetOverrides.lightIntensity !== undefined) {
      this.state.lightIntensity = this.targetOverrides.lightIntensity;
    } else {
      const baseLight = this.actuators.growLight.isOn ? 2400 : 550;
      this.state.lightIntensity = Math.round(baseLight + (Math.random() - 0.5) * 8);
    }

    // 7. Water Level
    if (this.isFieldLive("waterLevel", now) && this.targetOverrides.waterLevel !== undefined) {
      this.state.waterLevel = this.targetOverrides.waterLevel;
    } else {
      const levelDelta = (this.actuators.waterPump.isOn ? 0 : -0.05) + (Math.random() - 0.5) * 0.02;
      this.state.waterLevel = round(Math.max(60, Math.min(100, this.state.waterLevel + levelDelta)), 1);
    }

    if (force || now - this.lastStepTimestamp >= this.STEP_INTERVAL_MS) {
      this.lastStepTimestamp = now;
    }

    this.appendHistorySnapshot();
  }

  private appendHistorySnapshot() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      sensors: { ...this.state },
      actuators: this.getActuatorStatuses(),
    };
    this.history.push(snapshot);
    if (this.history.length > 40) {
      this.history.shift();
    }
  }

  public getSnapshot() {
    const now = Date.now();
    if (now - this.lastStepTimestamp >= this.STEP_INTERVAL_MS) {
      this.stepSimulation();
      this.lastStepTimestamp = now;
    } else {
      this.expireStaleLiveOverrides(now);
    }

    const alerts = this.evaluateAlerts();
    const sensorSources = this.getSensorSources(now);
    const liveSensorCount = Object.values(sensorSources).filter((s) => s === "live_iot").length;
    const devices = this.getIotDevices(now);
    const activeDevice = devices.find((d) => d.online) || devices[0];

    return {
      timestamp: new Date().toISOString(),
      sensors: { ...this.state },
      sensorSources,
      units: {
        ph: "pH",
        tds: "ppm",
        waterTemperature: "°C",
        airTemperature: "°C",
        humidity: "%",
        lightIntensity: "lux",
        dissolvedOxygen: "mg/L",
        waterLevel: "%",
      },
      actuators: this.actuators,
      alerts,
      system: {
        status: alerts.some((a) => a.severity === "critical") ? "warning" : "optimal",
        mode: liveSensorCount > 0 ? "hybrid_live_iot" : "auto_dummy_simulation",
        anomalyMode: this.anomalyMode,
        uptimeSeconds: Math.floor(process.uptime()),
        edgeNode: activeDevice?.deviceId || "ESP32-Virtual-Feed-01",
        edgeOnline: devices.some((d) => d.online),
        liveSensorCount,
        lastTelemetryAt: this.lastTelemetryAt,
        wifiSignalDbm: activeDevice?.wifiRssiDbm ?? -56,
      },
    };
  }

  public getHistory() {
    return this.history;
  }

  public resolveActuatorId(id: string): string {
    return ACTUATOR_ALIASES[id] || id;
  }

  public getActuator(id: string): ActuatorState | null {
    const resolvedId = this.resolveActuatorId(id);
    return this.actuators[resolvedId] || null;
  }

  public getActuatorStatuses(): Record<string, boolean> {
    return Object.fromEntries(
      Object.entries(this.actuators).map(([k, v]) => [k, v.isOn])
    );
  }

  public triggerFeedPulse(durationMs: number = 3000) {
    this.feedPendingUntilMs = Date.now() + durationMs;
    this.actuators.feeder.isOn = true;
    setTimeout(() => {
      if (Date.now() >= this.feedPendingUntilMs - 50) {
        this.actuators.feeder.isOn = false;
      }
    }, durationMs);
  }

  public getCommandsForEsp32(deviceId: string = "ESP32-GROW-01") {
    const now = Date.now();
    return {
      device_id: deviceId,
      server_time: new Date(now).toISOString(),
      actuators: this.getActuatorStatuses(),
      feed_pending: now < this.feedPendingUntilMs,
      anomaly_mode: this.anomalyMode,
    };
  }

  public setActuator(id: string, isOn: boolean, mode?: "auto" | "manual"): ActuatorState | null {
    const resolvedId = this.resolveActuatorId(id);
    if (!this.actuators[resolvedId]) return null;

    this.actuators[resolvedId].isOn = isOn;
    if (mode) {
      this.actuators[resolvedId].mode = mode;
    }

    if (resolvedId === "dosingPump" && isOn && this.anomalyMode === "ph_drop") {
      setTimeout(() => {
        this.setAnomaly("none");
        this.actuators.dosingPump.isOn = false;
      }, 8000);
    }

    return this.actuators[resolvedId];
  }

  public toggleActuator(id: string): ActuatorState | null {
    const resolvedId = this.resolveActuatorId(id);
    if (this.actuators[resolvedId]) {
      return this.setActuator(resolvedId, !this.actuators[resolvedId].isOn, "manual");
    }
    return null;
  }

  public setAnomaly(type: AnomalyType) {
    this.anomalyMode = type;
    return { anomalyMode: this.anomalyMode };
  }

  public overrideSensors(partial: Partial<SensorReading>, meta?: OverrideMeta): SensorReading {
    const now = Date.now();
    const updatedFields: Array<keyof SensorReading> = [];

    for (const key of ALL_SENSOR_KEYS) {
      const value = partial[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        this.state[key] = value;
        this.targetOverrides[key] = value;
        this.liveSensorTimestamps[key] = now;
        updatedFields.push(key);
      }
    }

    if (updatedFields.length > 0) {
      this.lastTelemetryAt = new Date(now).toISOString();
      this.appendHistorySnapshot();
    }

    if (meta?.deviceId) {
      this.connectedDevices.set(meta.deviceId, {
        deviceId: meta.deviceId,
        lastSeenAt: new Date(now).toISOString(),
        lastSeenMs: now,
        wifiRssiDbm: meta.wifiRssiDbm,
        firmwareVersion: meta.firmwareVersion,
        realSensors: updatedFields,
      });
    }

    return { ...this.state };
  }

  public evaluateAlerts(): SystemAlert[] {
    const alerts: SystemAlert[] = [];
    const now = new Date().toISOString();

    if (this.state.ph < 6.4) {
      alerts.push({
        id: "alert-ph-low",
        severity: "critical",
        metric: "ph",
        message: `Low Water pH (${this.state.ph}): Acidosis risk for fish. Buffer dosing needed.`,
        timestamp: now,
        isResolved: false,
      });
    } else if (this.state.ph > 7.6) {
      alerts.push({
        id: "alert-ph-high",
        severity: "warning",
        metric: "ph",
        message: `High Water pH (${this.state.ph}): Micronutrient lockout for plant roots.`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (this.state.waterTemperature > 28.5) {
      alerts.push({
        id: "alert-temp-high",
        severity: "critical",
        metric: "waterTemperature",
        message: `High Water Temp (${this.state.waterTemperature}°C): Depleting dissolved oxygen.`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (this.state.dissolvedOxygen < 5.0) {
      alerts.push({
        id: "alert-do-low",
        severity: "critical",
        metric: "dissolvedOxygen",
        message: `Hypoxia Warning! Dissolved Oxygen critically low (${this.state.dissolvedOxygen} mg/L). Check aerator!`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (this.state.waterLevel < 25) {
      alerts.push({
        id: "alert-water-level-low",
        severity: "critical",
        metric: "waterLevel",
        message: `Critical Water Level (${this.state.waterLevel}%): Sump reservoir nearly dry. Pump protection active.`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (this.state.lightIntensity < 250 && !this.actuators.growLight.isOn) {
      alerts.push({
        id: "alert-light-low",
        severity: "warning",
        metric: "lightIntensity",
        message: `Low Light Intensity (${this.state.lightIntensity} lux): Photosynthetic slowdown risk. Consider enabling Grow Light.`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (!this.actuators.waterPump.isOn) {
      alerts.push({
        id: "alert-pump-off",
        severity: "warning",
        metric: "waterPump",
        message: "Main water circulation pump is currently turned OFF.",
        timestamp: now,
        isResolved: false,
      });
    }

    return alerts;
  }
}

export const simulator = new AquaponicsSimulator();
