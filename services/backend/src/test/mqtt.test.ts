import { describe, expect, it } from "bun:test";
import { MqttBridgeService, MqttTelemetryMessage } from "../mqtt";
import { simulator } from "../simulator";

describe("MqttBridgeService Unit Tests", () => {
  it("should provide connection status metadata with default broker and topic", () => {
    const status = MqttBridgeService.getStatus();
    expect(status).toHaveProperty("connected");
    expect(status).toHaveProperty("broker");
    expect(status.topic).toBe("urbangrow/+/telemetry");
  });

  it("should mutate simulator state when receiving a valid telemetry payload", () => {
    const samplePayload: MqttTelemetryMessage = {
      device_id: "ESP32-ST-001",
      timestamp: new Date().toISOString(),
      telemetry: {
        ph: 7.35,
        tds_ppm: 685,
        water_temp_c: 26.4,
        air_temp_c: 29.8,
        humidity_pct: 68,
        lux: 15400,
        dissolved_oxygen_mg_l: 6.8,
        water_level_ok: true,
      },
    };

    MqttBridgeService.handleIncomingTelemetry(samplePayload);

    const currentTelemetry = simulator.getSnapshot();
    expect(currentTelemetry.sensors.ph).toBe(7.35);
    expect(currentTelemetry.sensors.tds).toBe(685);
    expect(currentTelemetry.sensors.waterTemperature).toBe(26.4);
    expect(currentTelemetry.sensors.dissolvedOxygen).toBe(6.8);
    expect(currentTelemetry.sensors.waterLevel).toBe(100);
  });

  it("should handle null or malformed payloads gracefully without crashing", () => {
    expect(() => {
      MqttBridgeService.handleIncomingTelemetry(null as any);
      MqttBridgeService.handleIncomingTelemetry({} as any);
    }).not.toThrow();
  });
});
