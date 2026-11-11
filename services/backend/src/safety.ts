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
   * Evaluates aerator automatic override rules based on Dissolved Oxygen (DO) or water temp.
   */
  static shouldBoostAerator(sensors: SensorTelemetry): boolean {
    const lowDo =
      typeof sensors.dissolved_oxygen_mg_l === "number" &&
      sensors.dissolved_oxygen_mg_l < 5.0;
    const highTemp =
      typeof sensors.water_temp_c === "number" && sensors.water_temp_c > 30.0;
    return lowDo || highTemp;
  }

  /**
   * Safe duration for feeder servo to prevent overfeeding and ammonia spikes.
   */
  static getFeederDispenseDurationMs(): number {
    return 3000; // 3.0 seconds = ~35g pellet feed
  }
}
