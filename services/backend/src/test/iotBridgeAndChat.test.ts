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
      expect(Array.isArray(chatRes.charts)).toBe(true);
      expect(chatRes.charts?.length).toBe(0);
    } finally {
      if (prevKey !== undefined) {
        process.env.GEMINI_API_KEY = prevKey;
      } else {
        delete process.env.GEMINI_API_KEY;
      }
    }
  });

  it("should generate dynamic charts in fallback mode and accept multimodal images on /api/ai/chat", async () => {
    const prevKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "PASTE_API_KEY_GEMINI_KAMU_DI_SINI";

    try {
      // 1. Chart generation request with explicit style & chart type
      const chartReq = await app.handle(
        new Request("http://localhost/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Tolong ringkas data IoT saya dalam bentuk radar chart style neon",
          }),
        })
      );
      expect(chartReq.status).toBe(200);
      const chartJson = await chartReq.json();
      expect(chartJson.success).toBe(true);
      expect(Array.isArray(chartJson.charts)).toBe(true);
      expect(chartJson.charts.length).toBeGreaterThan(0);
      expect(chartJson.charts[0].chartType).toBe("radar");
      expect(chartJson.charts[0].style?.theme).toBe("neon");

      // 2. Multimodal image-only payload (empty message allowed when image exists)
      const imgReq = await app.handle(
        new Request("http://localhost/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "",
            images: [
              {
                mimeType: "image/png",
                data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
                name: "daun-sample.png",
              },
            ],
          }),
        })
      );
      expect(imgReq.status).toBe(200);
      const imgJson = await imgReq.json();
      expect(imgJson.success).toBe(true);
      expect(imgJson.reply).toContain("Gambar berhasil diterima");

      // 3. Reject completely empty payload (no message and no images)
      const emptyReq = await app.handle(
        new Request("http://localhost/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "   " }),
        })
      );
      expect(emptyReq.status).toBe(400);
    } finally {
      if (prevKey !== undefined) {
        process.env.GEMINI_API_KEY = prevKey;
      } else {
        delete process.env.GEMINI_API_KEY;
      }
    }
  });

  it("should allow configuring fish stocking & seed planting cohorts via /api/ai/cohort and recalculate harvest forecasts", async () => {
    const initialRes = await app.handle(
      new Request("http://localhost/api/ai/cohort")
    );
    expect(initialRes.status).toBe(200);
    const initialJson = await initialRes.json();
    expect(initialJson.success).toBe(true);
    expect(initialJson.cohort.fishMode).toBe("both");
    expect(initialJson.diagnostics.predictions.harvest.pakcoy.propagatedFromSeed).toBe(true);
    expect(initialJson.diagnostics.predictions.fish.nila).toBeDefined();
    expect(initialJson.diagnostics.predictions.fish.lele).toBeDefined();

    const todayIso = new Date().toISOString().split("T")[0];
    const updateRes = await app.handle(
      new Request("http://localhost/api/ai/cohort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fishMode: "nila",
          nila: {
            count: 50,
            stockingDate: todayIso,
            initialLengthCm: 6.0,
            targetHarvestLengthCm: 24.0,
          },
          pakcoy: {
            seedingDate: todayIso,
            plantCount: 28,
          },
          kangkung: {
            seedingDate: todayIso,
            plantCount: 32,
          },
        }),
      })
    );

    expect(updateRes.status).toBe(200);
    const updatedJson = await updateRes.json();
    expect(updatedJson.success).toBe(true);
    expect(updatedJson.cohort.fishMode).toBe("nila");
    expect(updatedJson.diagnostics.predictions.fish.nila.count).toBe(50);
    expect(updatedJson.diagnostics.predictions.fish.nila.daysElapsed).toBe(0);
    expect(updatedJson.diagnostics.predictions.fish.nila.estimatedDaysRemaining).toBeGreaterThan(50);
    expect(updatedJson.diagnostics.predictions.fish.lele).toBeUndefined();
    expect(updatedJson.diagnostics.predictions.harvest.pakcoy.seedingDate).toBe(todayIso);
    expect(updatedJson.diagnostics.predictions.harvest.pakcoy.plantCount).toBe(28);
    expect(updatedJson.diagnostics.predictions.harvest.pakcoy.daysSincePlanting).toBe(0);
    expect(updatedJson.diagnostics.predictions.harvest.kangkung.plantCount).toBe(32);
    expect(Array.isArray(updatedJson.history)).toBe(true);
    expect(updatedJson.history.length).toBeGreaterThanOrEqual(1);
    expect(updatedJson.history[0].nilaCount).toBe(50);

    const healthRes = await app.handle(new Request("http://localhost/health"));
    expect(healthRes.status).toBe(200);
    const healthJson = await healthRes.json();
    expect(healthJson.database.engine).toBe("sqlite");
    expect(healthJson.database.ready).toBe(true);
    expect(healthJson.database.tables).toContain("prediction_cohorts");
  });
});

