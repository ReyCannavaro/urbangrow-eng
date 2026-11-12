export interface SensorReading {
  ph: number | null;
  tds: number | null;
  waterTemperature: number | null;
  airTemperature: number | null;
  humidity: number | null;
  lightIntensity: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
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
export type SensorSource = "live_iot" | "offline";
export type SystemMode = "live_iot" | "partial_live_iot" | "heartbeat_only" | "offline";

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

// Real physical hardware sensors on prototype:
// 1. Dalam air: ph (Probe Analog pH), waterTemperature (DS18B20 Waterproof)
// 2. Luar air: airTemperature (DHT22), lightIntensity (Sensor Cahaya LDR)
const PHYSICAL_SENSOR_KEYS: Array<keyof SensorReading> = [
  "ph",
  "waterTemperature",
  "airTemperature",
  "lightIntensity",
];

function createEmptySensors(): SensorReading {
  return {
    ph: null,
    tds: null,
    waterTemperature: null,
    airTemperature: null,
    humidity: null,
    lightIntensity: null,
    dissolvedOxygen: null,
    waterLevel: null,
  };
}

class AquaponicsSimulator {
  private state: SensorReading = createEmptySensors();

  private actuators: Record<string, ActuatorState> = {
    waterPump: {
      id: "waterPump",
      name: "Pompa Sirkulasi 12V",
      code: "RELAY-01",
      type: "pump",
      isOn: false,
      mode: "auto",
      powerWatts: 45,
      voltage: "12V DC",
    },
    aerator: {
      id: "aerator",
      name: "Aerator Oksigen Nila",
      code: "RELAY-02",
      type: "aerator",
      isOn: false,
      mode: "auto",
      powerWatts: 18,
      voltage: "12V DC",
    },
    growLight: {
      id: "growLight",
      name: "Grow Light Fotosintesis",
      code: "RELAY-03",
      type: "light",
      isOn: false,
      mode: "auto",
      powerWatts: 85,
      voltage: "12V DC",
    },
    feeder: {
      id: "feeder",
      name: "Auto-Feeder Dispenser",
      code: "RELAY-04",
      type: "feeder",
      isOn: false,
      mode: "auto",
      powerWatts: 12,
      voltage: "12V DC",
    },
    dosingPump: {
      id: "dosingPump",
      name: "Pompa Dosing Buffer pH",
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
    // Strictly start with empty real-telemetry buffer (no synthetic bootstrap waves)
    this.history = [];
  }

  private liveSensorTtlMs: number = 15000; // Mark sensor offline after 15s of silence from ESP32
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
        this.state[key] = null;
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
    this.history = [];
    this.state = createEmptySensors();
  }

  public getSensorSources(now: number = Date.now()): Record<keyof SensorReading, SensorSource> {
    this.expireStaleLiveOverrides(now);
    const sources = {} as Record<keyof SensorReading, SensorSource>;
    for (const key of ALL_SENSOR_KEYS) {
      sources[key] = this.isFieldLive(key, now) ? "live_iot" : "offline";
    }
    return sources;
  }

  public getIotDevices(now: number = Date.now()) {
    return Array.from(this.connectedDevices.values()).map((dev) => ({
      ...dev,
      online: now - dev.lastSeenMs <= this.liveSensorTtlMs,
    }));
  }

  private appendHistorySnapshot() {
    const nowMs = Date.now();
    const prev = this.history[this.history.length - 1];
    if (prev) {
      const prevMs = Date.parse(prev.timestamp);
      if (Number.isFinite(prevMs) && nowMs - prevMs > 120_000) {
        this.history = [];
      }
    }

    const snapshot = {
      timestamp: new Date(nowMs).toISOString(),
      sensors: { ...this.state },
      actuators: this.getActuatorStatuses(),
    };
    this.history.push(snapshot);
    if (this.history.length > 60) {
      this.history.shift();
    }
  }

  public getSnapshot() {
    const now = Date.now();
    this.expireStaleLiveOverrides(now);

    const alerts = this.evaluateAlerts();
    const sensorSources = this.getSensorSources(now);
    const liveSensorCount = Object.values(sensorSources).filter((s) => s === "live_iot").length;
    const physicalLiveCount = PHYSICAL_SENSOR_KEYS.filter(
      (k) => sensorSources[k] === "live_iot"
    ).length;
    const devices = this.getIotDevices(now);
    const activeOnlineDevice = devices.find((d) => d.online);
    const edgeOnline = Boolean(activeOnlineDevice);

    let mode: SystemMode = "offline";
    if (physicalLiveCount >= PHYSICAL_SENSOR_KEYS.length || liveSensorCount >= PHYSICAL_SENSOR_KEYS.length) {
      mode = "live_iot";
    } else if (liveSensorCount > 0) {
      mode = "partial_live_iot";
    } else if (edgeOnline) {
      mode = "heartbeat_only";
    }

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
        status:
          !edgeOnline && liveSensorCount === 0
            ? "offline"
            : alerts.some((a) => a.severity === "critical")
            ? "warning"
            : "optimal",
        mode,
        anomalyMode: this.anomalyMode,
        uptimeSeconds: Math.floor(process.uptime()),
        edgeNode: activeOnlineDevice?.deviceId || devices[0]?.deviceId || "ESP32-GROW-01",
        edgeOnline,
        liveSensorCount: physicalLiveCount,
        lastTelemetryAt: this.lastTelemetryAt,
        wifiSignalDbm:
          activeOnlineDevice && typeof activeOnlineDevice.wifiRssiDbm === "number"
            ? activeOnlineDevice.wifiRssiDbm
            : null,
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

    // Hardware physical reality:
    // Only waterPump has a physical relay attached. If edge is offline or actuator is absent,
    // auto-revert to false after pulse duration to prevent hanging in stuck ON state.
    const isEdgeOnline = Array.from(this.connectedDevices.values()).some(
      (dev) => Date.now() - dev.lastSeenMs <= this.liveSensorTtlMs
    );
    if (isOn && (!isEdgeOnline || resolvedId !== "waterPump")) {
      setTimeout(() => {
        if (this.actuators[resolvedId]) {
          this.actuators[resolvedId].isOn = false;
        }
      }, 2500);
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

    if (updatedFields.length > 0 || meta?.deviceId) {
      this.lastTelemetryAt = new Date(now).toISOString();
    }

    if (updatedFields.length > 0) {
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

    if (typeof this.state.ph === "number") {
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
    }

    if (typeof this.state.waterTemperature === "number" && this.state.waterTemperature > 28.5) {
      alerts.push({
        id: "alert-temp-high",
        severity: "critical",
        metric: "waterTemperature",
        message: `High Water Temp (${this.state.waterTemperature}°C): Depleting dissolved oxygen.`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (typeof this.state.dissolvedOxygen === "number" && this.state.dissolvedOxygen < 5.0) {
      alerts.push({
        id: "alert-do-low",
        severity: "critical",
        metric: "dissolvedOxygen",
        message: `Hypoxia Warning! Dissolved Oxygen critically low (${this.state.dissolvedOxygen} mg/L). Check aerator!`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (typeof this.state.waterLevel === "number" && this.state.waterLevel < 25) {
      alerts.push({
        id: "alert-water-level-low",
        severity: "critical",
        metric: "waterLevel",
        message: `Critical Water Level (${this.state.waterLevel}%): Sump reservoir nearly dry. Pump protection active.`,
        timestamp: now,
        isResolved: false,
      });
    }

    if (
      typeof this.state.lightIntensity === "number" &&
      this.state.lightIntensity < 250 &&
      !this.actuators.growLight.isOn
    ) {
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
