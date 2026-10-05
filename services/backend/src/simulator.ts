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
  type: "pump" | "aerator" | "light" | "dosing";
  isOn: boolean;
  mode: "auto" | "manual";
  powerWatts: number;
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
      type: "pump",
      isOn: true,
      mode: "auto",
      powerWatts: 45,
    },
    aerator: {
      id: "aerator",
      name: "Dual-Port Air Pump",
      type: "aerator",
      isOn: true,
      mode: "auto",
      powerWatts: 18,
    },
    growLight: {
      id: "growLight",
      name: "Full-Spectrum LED Bar",
      type: "light",
      isOn: false,
      mode: "auto",
      powerWatts: 85,
    },
    dosingPump: {
      id: "dosingPump",
      name: "pH Buffer Dosing Pump",
      type: "dosing",
      isOn: false,
      mode: "auto",
      powerWatts: 12,
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

  private targetOverrides: Partial<SensorReading> = {};

  // Smooth random walk with biological correlations
  public stepSimulation() {
    const round = (val: number, decimals: number = 2) =>
      Number(val.toFixed(decimals));

    // Target values depending on anomaly state or manual simulator overrides
    let targetPH = this.targetOverrides.ph ?? 7.0;
    let targetWaterTemp = this.targetOverrides.waterTemperature ?? 24.5;
    let targetTDS = this.targetOverrides.tds ?? 540;

    if (this.anomalyMode === "ph_drop") targetPH = 5.85;
    if (this.anomalyMode === "heatwave") targetWaterTemp = 30.2;
    if (this.anomalyMode === "tds_spike") targetTDS = 1120;

    // Organic drift towards target with small noise
    const phDelta = (targetPH - this.state.ph) * 0.15 + (Math.random() - 0.5) * 0.03;
    this.state.ph = round(Math.max(4.0, Math.min(10.0, this.state.ph + phDelta)), 2);

    const tempDelta = (targetWaterTemp - this.state.waterTemperature) * 0.1 + (Math.random() - 0.5) * 0.08;
    this.state.waterTemperature = round(this.state.waterTemperature + tempDelta, 1);

    const tdsDelta = (targetTDS - this.state.tds) * 0.15 + (Math.random() - 0.5) * 4;
    this.state.tds = Math.round(this.state.tds + tdsDelta);

    // Air temperature & humidity
    const airDelta = (Math.random() - 0.5) * 0.2;
    this.state.airTemperature = round(27.0 + (this.state.waterTemperature - 24.0) * 0.4 + airDelta, 1);
    this.state.humidity = round(Math.max(40, Math.min(90, 65.0 - (this.state.airTemperature - 25.0) * 1.5 + (Math.random() - 0.5) * 1.5)), 1);

    // Dissolved oxygen reacts biologically to aerator state unless manually overridden
    let targetDO = this.targetOverrides.dissolvedOxygen ?? (this.actuators.aerator.isOn ? 7.4 : 4.4);
    const doDelta = (targetDO - this.state.dissolvedOxygen) * 0.15 + (Math.random() - 0.5) * 0.04;
    this.state.dissolvedOxygen = round(Math.max(2.0, Math.min(10.0, this.state.dissolvedOxygen + doDelta)), 2);

    // Light reacts to grow light state unless manually overridden
    if (this.targetOverrides.lightIntensity !== undefined) {
      this.state.lightIntensity = Math.round(this.targetOverrides.lightIntensity + (Math.random() - 0.5) * 20);
    } else {
      const baseLight = this.actuators.growLight.isOn ? 2400 : 550;
      this.state.lightIntensity = Math.round(baseLight + (Math.random() - 0.5) * 50);
    }

    // Water level
    if (this.targetOverrides.waterLevel !== undefined) {
      this.state.waterLevel = round(this.targetOverrides.waterLevel + (Math.random() - 0.5) * 0.2, 1);
    } else {
      const levelDelta = (this.actuators.waterPump.isOn ? 0 : -0.2) + (Math.random() - 0.5) * 0.1;
      this.state.waterLevel = round(Math.max(60, Math.min(100, this.state.waterLevel + levelDelta)), 1);
    }

    // Append to circular history buffer (max 40 items)
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
    this.stepSimulation();
    const alerts = this.evaluateAlerts();

    return {
      timestamp: new Date().toISOString(),
      sensors: { ...this.state },
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
        mode: "generative_simulation",
        anomalyMode: this.anomalyMode,
        uptimeSeconds: Math.floor(process.uptime()),
        edgeNode: "ESP32-Virtual-Feed-01",
        wifiSignalDbm: -56,
      },
    };
  }

  public getHistory() {
    return this.history;
  }

  public getActuatorStatuses(): Record<string, boolean> {
    return Object.fromEntries(
      Object.entries(this.actuators).map(([k, v]) => [k, v.isOn])
    );
  }

  public toggleActuator(id: string): ActuatorState | null {
    if (this.actuators[id]) {
      this.actuators[id].isOn = !this.actuators[id].isOn;
      // Auto-trigger dosing recovery if dosing pump turned on
      if (id === "dosingPump" && this.actuators[id].isOn && this.anomalyMode === "ph_drop") {
        setTimeout(() => {
          this.setAnomaly("none");
          this.actuators.dosingPump.isOn = false;
        }, 8000);
      }
      return this.actuators[id];
    }
    return null;
  }

  public setAnomaly(type: AnomalyType) {
    this.anomalyMode = type;
    return { anomalyMode: this.anomalyMode };
  }

  public overrideSensors(partial: Partial<SensorReading>) {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.targetOverrides = {
      ...this.targetOverrides,
      ...partial,
    };
    return this.state;
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
