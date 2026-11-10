import { simulator, SensorReading } from "./simulator";
import { SensorTelemetry } from "./types";

export interface MqttTelemetryMessage {
  device_id?: string;
  deviceId?: string;
  timestamp?: string;
  wifi_rssi_dbm?: number;
  firmware_version?: string;
  telemetry?: Partial<SensorTelemetry> & Record<string, unknown>;
  // Flat ESP32 payload aliases supported directly
  ph?: number;
  tds_ppm?: number;
  tds?: number;
  water_temp_c?: number;
  waterTemperature?: number;
  air_temp_c?: number;
  airTemperature?: number;
  humidity_pct?: number;
  humidity?: number;
  lux?: number;
  ldr?: number;
  lightIntensity?: number;
  dissolved_oxygen_mg_l?: number;
  dissolved_oxygen?: number;
  dissolvedOxygen?: number;
  water_level_ok?: boolean;
  waterLevel?: number;
}

function pickFiniteNumber(...candidates: unknown[]): number | undefined {
  for (const val of candidates) {
    if (typeof val === "number" && Number.isFinite(val)) {
      return val;
    }
  }
  return undefined;
}

export class MqttBridgeService {
  private static isConnected: boolean = false;

  static handleIncomingTelemetry(payload: MqttTelemetryMessage): {
    acceptedFields: Array<keyof SensorReading>;
    deviceId: string;
  } {
    if (!payload || typeof payload !== "object") {
      return { acceptedFields: [], deviceId: "unknown" };
    }

    const src: Record<string, unknown> =
      payload.telemetry && typeof payload.telemetry === "object"
        ? { ...payload, ...payload.telemetry }
        : (payload as unknown as Record<string, unknown>);

    const partial: Partial<SensorReading> = {};

    const ph = pickFiniteNumber(src.ph);
    if (ph !== undefined) partial.ph = Number(Math.max(0, Math.min(14, ph)).toFixed(2));

    const tds = pickFiniteNumber(src.tds_ppm, src.tds);
    if (tds !== undefined) partial.tds = Math.round(Math.max(0, tds));

    const waterTemp = pickFiniteNumber(src.water_temp_c, src.waterTemperature);
    if (waterTemp !== undefined) partial.waterTemperature = Number(waterTemp.toFixed(1));

    const airTemp = pickFiniteNumber(src.air_temp_c, src.airTemperature);
    if (airTemp !== undefined) partial.airTemperature = Number(airTemp.toFixed(1));

    const humidity = pickFiniteNumber(src.humidity_pct, src.humidity);
    if (humidity !== undefined) {
      partial.humidity = Number(Math.max(0, Math.min(100, humidity)).toFixed(1));
    }

    const light = pickFiniteNumber(src.lux, src.lightIntensity, src.ldr);
    if (light !== undefined) partial.lightIntensity = Math.round(Math.max(0, light));

    const dissolvedO2 = pickFiniteNumber(
      src.dissolved_oxygen_mg_l,
      src.dissolved_oxygen,
      src.dissolvedOxygen
    );
    if (dissolvedO2 !== undefined) {
      partial.dissolvedOxygen = Number(Math.max(0, dissolvedO2).toFixed(2));
    }

    const numericLevel = pickFiniteNumber(src.waterLevel, src.water_level);
    if (numericLevel !== undefined) {
      partial.waterLevel = Number(Math.max(0, Math.min(100, numericLevel)).toFixed(1));
    } else if (typeof src.water_level_ok === "boolean") {
      partial.waterLevel = src.water_level_ok ? 100 : 0;
    }

    const deviceId =
      (typeof payload.device_id === "string" && payload.device_id.trim()) ||
      (typeof payload.deviceId === "string" && payload.deviceId.trim()) ||
      "ESP32-GROW-01";

    const acceptedFields = Object.keys(partial) as Array<keyof SensorReading>;
    if (acceptedFields.length === 0 && !payload.device_id && !payload.deviceId) {
      return { acceptedFields: [], deviceId };
    }

    const wifiRssiDbm = pickFiniteNumber(src.wifi_rssi_dbm);
    const firmwareVersion =
      typeof src.firmware_version === "string" ? src.firmware_version : undefined;

    console.log(
      `[IOT-BRIDGE] Telemetry from ${deviceId} | fields=[${acceptedFields.join(", ") || "heartbeat"}]`
    );

    simulator.overrideSensors(partial, {
      deviceId,
      wifiRssiDbm,
      firmwareVersion,
      isLiveIot: true,
    });

    return { acceptedFields, deviceId };
  }

  static getStatus() {
    const devices = simulator.getIotDevices();
    return {
      connected: this.isConnected || devices.some((d) => d.online),
      broker: process.env.MQTT_BROKER_URL || "mqtt://localhost:1883",
      topic: "urbangrow/+/telemetry",
      httpIngestEndpoint: "/api/sensors/telemetry",
      sensorSources: simulator.getSensorSources(),
      devices,
    };
  }
}
