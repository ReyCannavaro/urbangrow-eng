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

export interface ActuatorState {
  id: string;
  name: string;
  code: string;
  type?: "pump" | "aerator" | "light" | "feeder" | string;
  isOn: boolean;
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
