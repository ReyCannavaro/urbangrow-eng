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

  it("should accept partial LDR-only ESP32 telemetry and mark unsent sensors offline with null values", async () => {
    // 0. Baseline before any ESP32 connects must be completely offline
    const initRes = await app.handle(new Request("http://localhost/api/iot/status"));
    expect(initRes.status).toBe(200);
    const initBody = await initRes.json();
    expect(initBody.edgeOnline).toBe(false);
    expect(initBody.mode).toBe("offline");
    expect(initBody.liveSensorCount).toBe(0);
    expect(initBody.sensorSources.ph).toBe("offline");

    // 1. Partial LDR-only payload
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
    expect(body.sensorSources.ph).toBe("offline");
    expect(body.sensorSources.waterTemperature).toBe("offline");
    expect(body.commands.actuators).toHaveProperty("waterPump");

    const snap = simulator.getSnapshot();
    expect(snap.sensors.lightIntensity).toBe(185);
    expect(snap.sensors.ph).toBeNull();
    expect(snap.system.mode).toBe("partial_live_iot");
    expect(snap.system.edgeOnline).toBe(true);
    expect(snap.system.wifiSignalDbm).toBe(-52);

    // 2. Heartbeat-only payload from ESP32 without sensors must keep edgeOnline=true
    const hbRes = await app.handle(
      new Request("http://localhost/api/sensors/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: "ESP32-HB-01",
          wifi_rssi_dbm: -49,
          firmware_version: "2.1.0",
        }),
      })
    );
    expect(hbRes.status).toBe(200);
    const statusRes = await app.handle(new Request("http://localhost/api/iot/status"));
    const statusJson = await statusRes.json();
    expect(statusJson.edgeOnline).toBe(true);
    expect(statusJson.lastTelemetryAt).not.toBeNull();
  });

  it("should mark live sensor offline and reset reading to null after TTL expires", async () => {
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
    expect(snap.sensorSources.lightIntensity).toBe("offline");
    expect(snap.sensors.lightIntensity).toBeNull();
    expect(snap.system.mode).toBe("offline");
    expect(snap.system.edgeOnline).toBe(false);
    expect(snap.system.wifiSignalDbm).toBeNull();
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

    const todayIso = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
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
    expect(healthJson.database.tables).toContain("automation_schedules");
    expect(healthJson.database.tables).toContain("sensor_readings");
    expect(healthJson.database.tables).toContain("actuator_logs");
  });

  it("should manage automation schedules, persist actuator logs, and export sensor CSV from SQLite", async () => {
    // 1. List seeded schedules
    const listRes = await app.handle(new Request("http://localhost/api/schedules"));
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    expect(listJson.schedules.length).toBeGreaterThanOrEqual(3);

    // 2. Create a new time-based schedule
    const createRes = await app.handle(
      new Request("http://localhost/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nyalakan Grow Light Pagi",
          triggerType: "time",
          scheduleTime: "06:00",
          actuatorId: "growLight",
          targetState: true,
          notes: "Fotoperiode awal Rak Pakcoy Level 4",
        }),
      })
    );
    expect(createRes.status).toBe(200);
    const createJson = await createRes.json();
    expect(createJson.success).toBe(true);
    expect(createJson.schedule.title).toBe("Nyalakan Grow Light Pagi");

    // 3. Toggle and delete the schedule
    const schedId = createJson.schedule.id;
    const toggleRes = await app.handle(
      new Request(`http://localhost/api/schedules/${schedId}/toggle`, {
        method: "PATCH",
      })
    );
    expect(toggleRes.status).toBe(200);
    const toggleJson = await toggleRes.json();
    expect(toggleJson.schedule.enabled).toBe(false);

    const delRes = await app.handle(
      new Request(`http://localhost/api/schedules/${schedId}`, {
        method: "DELETE",
      })
    );
    expect(delRes.status).toBe(200);

    // 4. Verify actuator logs and CSV export
    const logsRes = await app.handle(new Request("http://localhost/api/logs/actuators"));
    expect(logsRes.status).toBe(200);
    const logsJson = await logsRes.json();
    expect(logsJson.success).toBe(true);
    expect(Array.isArray(logsJson.logs)).toBe(true);

    const csvRes = await app.handle(new Request("http://localhost/api/sensors/export.csv"));
    expect(csvRes.status).toBe(200);
    const csvText = await csvRes.text();
    expect(csvText).toContain("Timestamp_UTC,Device_ID,pH_Air");

    // 5. Verify /api/ai/predict and /api/ai/climate-score report OFFLINE honestly when unsent
    const predictRes = await app.handle(
      new Request("http://localhost/api/ai/predict", { method: "POST" })
    );
    expect(predictRes.status).toBe(200);
    const predictJson = await predictRes.json();
    expect(predictJson.offline).toBe(true);
    expect(predictJson.risk_level).toBe("OFFLINE");

    const climateRes = await app.handle(new Request("http://localhost/api/ai/climate-score"));
    expect(climateRes.status).toBe(200);
    const climateJson = await climateRes.json();
    expect(climateJson.offline).toBe(true);
    expect(climateJson.resilience_grade).toBe("OFFLINE");
    expect(climateJson.climate_adaptation_score).toBeNull();
  });
});

