export interface SensorTelemetry {
  ph: number | null;
  tds_ppm: number | null;
  water_temp_c: number | null;
  air_temp_c: number | null;
  humidity_pct: number | null;
  lux: number | null;
  dissolved_oxygen_mg_l: number | null;
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
