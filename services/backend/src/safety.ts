import { SensorTelemetry, ActuatorStates } from "./types";

export class SafetyInterlockManager {
  /**
   * Validates if turning on an actuator is physically safe for the aquaponic ecosystem.
   */
  static canActivatePump(sensors: SensorTelemetry): { allowed: boolean; reason?: string } {
    if (!sensors.water_level_ok) {
      return {
        allowed: false,
        reason: "POMPA DITAHAN: Sensor level tandon mendeteksi air surut (Mencegah dry-run motor terbakar).",
      };
    }
    return { allowed: true };
  }

  /**
   * Evaluates aerator automatic override rules based on Dissolved Oxygen (DO).
   */
  static shouldBoostAerator(sensors: SensorTelemetry): boolean {
    // If DO drops below 5.0 mg/L (Critical threshold for Tilapia in Level 3)
    return sensors.dissolved_oxygen_mg_l < 5.0 || sensors.water_temp_c > 30.0;
  }

  /**
   * Safe duration for feeder servo to prevent overfeeding and ammonia spikes.
   */
  static getFeederDispenseDurationMs(): number {
    return 3000; // 3.0 seconds = ~35g pellet feed
  }
}
