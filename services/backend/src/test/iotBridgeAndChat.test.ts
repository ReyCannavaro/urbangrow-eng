import { beforeEach, describe, expect, it } from "bun:test";
import { app } from "../index";
import { simulator } from "../simulator";
import { AgriBotEngine } from "../geminiChat";

describe("Hybrid IoT Bridge, Actuator Sync & AgriBot AI Tests", () => {
  beforeEach(() => {
    simulator.resetLiveOverrides();
    simulator.setLiveSensorTtlMs(15000);
    simulator.setAnomaly("none");
    simulator.setActuator("growLight", false, "manual");
    simulator.setActuator("waterPump", true, "auto");
  });

  it("should accept partial LDR-only ESP32 telemetry and keep pH/temp on auto_dummy", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/sensors/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: "ESP32-LDR-01",
          lux: 185,
          wifi_rssi_dbm: -52,
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.device_id).toBe("ESP32-LDR-01");
    expect(body.accepted_fields).toEqual(["lightIntensity"]);
    expect(body.sensorSources.lightIntensity).toBe("live_iot");
    expect(body.sensorSources.ph).toBe("auto_dummy");
    expect(body.sensorSources.waterTemperature).toBe("auto_dummy");
    expect(body.commands.actuators).toHaveProperty("waterPump");

    const snap = simulator.getSnapshot();
    expect(snap.sensors.lightIntensity).toBe(185);
    expect(snap.system.mode).toBe("hybrid_live_iot");
    expect(snap.system.edgeOnline).toBe(true);
  });

  it("should automatically fall back to auto_dummy when live sensor stops sending after TTL", async () => {
    simulator.setLiveSensorTtlMs(100);

    await app.handle(
      new Request("http://localhost/api/sensors/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: "ESP32-LDR-01",
          lux: 120,
        }),
      })
    );

    expect(simulator.getSensorSources().lightIntensity).toBe("live_iot");

    await new Promise((r) => setTimeout(r, 150));

    const snap = simulator.getSnapshot();
    expect(snap.sensorSources.lightIntensity).toBe("auto_dummy");
    expect(snap.system.mode).toBe("auto_dummy_simulation");
  });

  it("should synchronize actuator toggles to /api/iot/commands and enforce pump dry-run protection", async () => {
    // 1. Toggle growLight ON via API
    const lightRes = await app.handle(
      new Request("http://localhost/api/actuators/growLight/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: true }),
      })
    );
    expect(lightRes.status).toBe(200);

    // Verify ESP32 polling endpoint sees growLight = true
    const cmdRes = await app.handle(
      new Request("http://localhost/api/iot/commands?device_id=ESP32-LDR-01")
    );
    expect(cmdRes.status).toBe(200);
    const cmdJson = await cmdRes.json();
    expect(cmdJson.actuators.growLight).toBe(true);

    // 2. Test pump dry-run protection (turning OFF pump, setting water level dry, trying to turn ON)
    simulator.setActuator("waterPump", false, "manual");
    simulator.overrideSensors({ waterLevel: 10 }, { deviceId: "ESP32-LDR-01" });

    const pumpBlockRes = await app.handle(
      new Request("http://localhost/api/actuators/pump/toggle", {
        method: "POST",
      })
    );
    expect(pumpBlockRes.status).toBe(400);
    const errJson = await pumpBlockRes.json();
    expect(errJson.success).toBe(false);
    expect(errJson.message).toContain("POMPA DITAHAN");
  });

  it("should generate 3-domain plant/water/fish diagnosis and harvest predictions reacting to low LDR light", async () => {
    await app.handle(
      new Request("http://localhost/api/sensors/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: "ESP32-LDR-01",
          lux: 140,
        }),
      })
    );

    const res = await app.handle(
      new Request("http://localhost/api/ai/diagnostics")
    );
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.sensorSources.lightIntensity).toBe("live_iot");
    expect(json.diagnosis.plant.status).toBe("WARNING");
    expect(json.diagnosis.water).toHaveProperty("status");
    expect(json.diagnosis.fish).toHaveProperty("status");
    expect(json.predictions.harvest.pakcoy.lightEfficiencyPct).toBeLessThan(80);
    expect(json.predictions.trends.emergingSymptoms.length).toBeGreaterThan(0);
    expect(
      json.suggestedActions.some((a: any) => a.actuatorId === "growLight")
    ).toBe(true);
  });

  it("should handle /api/ai/chat gracefully even without valid Gemini API key via ECAD fallback", async () => {
    const prevKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "PASTE_API_KEY_GEMINI_KAMU_DI_SINI";

    try {
      const chatRes = await AgriBotEngine.chat({
        message: "Diagnosa kondisi tumbuhan, air, dan ikan sekarang plus prediksi panen",
      });

      expect(chatRes.success).toBe(true);
      expect(chatRes.provider).toBe("ecad_local_fallback");
      expect(chatRes.reply).toContain("Pakcoy");
      expect(chatRes.reply).toContain("Tumbuhan");
      expect(chatRes.diagnostics.predictions.harvest.kangkung).toHaveProperty(
        "estimatedDaysRemaining"
      );
    } finally {
      if (prevKey !== undefined) {
        process.env.GEMINI_API_KEY = prevKey;
      } else {
        delete process.env.GEMINI_API_KEY;
      }
    }
  });
});

