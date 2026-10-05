export interface SensorState {
  ph: number;
  tds: number;
  waterTemperature: number;
  airTemperature: number;
  humidity: number;
  lightIntensity: number;
  dissolvedOxygen: number;
  waterLevel: number;
}

export interface ActuatorItem {
  id: string;
  name: string;
  type: string;
  isOn: boolean;
  powerWatts: number;
}

export interface TelemetryPayload {
  timestamp: string;
  sensors: SensorState;
  actuators: Record<string, ActuatorItem>;
  system: {
    status: string;
    mode: string;
    anomalyMode: string;
    edgeNode: string;
    uptimeSeconds: number;
  };
}

export interface ScenarioPreset {
  id: string;
  title: string;
  icon: string;
  description: string;
  sensors: Partial<SensorState>;
}
