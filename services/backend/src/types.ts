export interface SensorTelemetry {
  ph: number;
  tds_ppm: number;
  water_temp_c: number;
  air_temp_c: number;
  humidity_pct: number;
  lux: number;
  dissolved_oxygen_mg_l: number;
  water_level_ok: boolean;
}

export interface ActuatorStates {
  pump: boolean;
  aerator: boolean;
  feeder: boolean;
  grow_light: boolean;
}

export interface SystemSnapshot {
  timestamp: string;
  sensors: SensorTelemetry;
  actuators: ActuatorStates;
  power_source: "mains" | "battery";
  mode: "normal" | "ph_drop" | "heatwave" | "tds_spike";
}

export interface SystemAlert {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  type: string;
  message: string;
  timestamp: string;
}
