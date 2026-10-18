import { simulator } from "./simulator";
import { SensorTelemetry } from "./types";

export interface MqttTelemetryMessage {
  device_id: string;
  timestamp: string;
  telemetry: SensorTelemetry;
}

export class MqttBridgeService {
  private static isConnected: boolean = false;

  static handleIncomingTelemetry(payload: MqttTelemetryMessage) {
    if (!payload || !payload.telemetry) return;

    console.log(`[MQTT-BRIDGE] Received telemetry from ${payload.device_id || "unknown"}`);
    simulator.overrideSensors({
      ph: payload.telemetry.ph,
      tds: payload.telemetry.tds_ppm,
      waterTemperature: payload.telemetry.water_temp_c,
      airTemperature: payload.telemetry.air_temp_c,
      humidity: payload.telemetry.humidity_pct,
      lightIntensity: payload.telemetry.lux,
      dissolvedOxygen: payload.telemetry.dissolved_oxygen_mg_l,
      waterLevel: payload.telemetry.water_level_ok ? 100 : 0,
    });
  }

  static getStatus() {
    return {
      connected: this.isConnected,
      broker: process.env.MQTT_BROKER_URL || "mqtt://localhost:1883",
      topic: "urbangrow/+/telemetry",
    };
  }
}
