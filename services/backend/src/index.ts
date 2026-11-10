import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { simulator } from "./simulator";
import { MqttBridgeService } from "./mqtt";
import { SafetyInterlockManager } from "./safety";
import { AiEngineClient } from "./aiClient";
import { TelemetryWebSocketManager } from "./websocket";
import { AgriBotEngine } from "./geminiChat";
import { getDatabaseStatus, initDatabase } from "./db/sqlite";

initDatabase();

const PORT = Number(process.env.PORT || 3000);

const TelemetryIngestBody = t.Object(
  {
    device_id: t.Optional(t.String()),
    deviceId: t.Optional(t.String()),
    timestamp: t.Optional(t.String()),
    wifi_rssi_dbm: t.Optional(t.Number()),
    firmware_version: t.Optional(t.String()),
    telemetry: t.Optional(t.Record(t.String(), t.Union([t.Number(), t.Boolean(), t.String()]))),
    ph: t.Optional(t.Number({ minimum: 0, maximum: 14 })),
    tds_ppm: t.Optional(t.Number({ minimum: 0 })),
    tds: t.Optional(t.Number({ minimum: 0 })),
    water_temp_c: t.Optional(t.Number({ minimum: -10, maximum: 80 })),
    waterTemperature: t.Optional(t.Number({ minimum: -10, maximum: 80 })),
    air_temp_c: t.Optional(t.Number({ minimum: -20, maximum: 80 })),
    airTemperature: t.Optional(t.Number({ minimum: -20, maximum: 80 })),
    humidity_pct: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    humidity: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    lux: t.Optional(t.Number({ minimum: 0 })),
    ldr: t.Optional(t.Number({ minimum: 0 })),
    lightIntensity: t.Optional(t.Number({ minimum: 0 })),
    dissolved_oxygen_mg_l: t.Optional(t.Number({ minimum: 0, maximum: 30 })),
    dissolved_oxygen: t.Optional(t.Number({ minimum: 0, maximum: 30 })),
    dissolvedOxygen: t.Optional(t.Number({ minimum: 0, maximum: 30 })),
    water_level_ok: t.Optional(t.Boolean()),
    waterLevel: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
  },
  { additionalProperties: true }
);

function checkPumpSafetyIfEnabling(id: string, targetOn: boolean): { allowed: boolean; reason?: string } {
  const resolvedId = simulator.resolveActuatorId(id);
  if (resolvedId !== "waterPump" || !targetOn) {
    return { allowed: true };
  }

  const snap = simulator.getSnapshot();
  return SafetyInterlockManager.canActivatePump({
    ph: snap.sensors.ph,
    tds_ppm: snap.sensors.tds,
    water_temp_c: snap.sensors.waterTemperature,
    air_temp_c: snap.sensors.airTemperature,
    humidity_pct: snap.sensors.humidity,
    lux: snap.sensors.lightIntensity,
    dissolved_oxygen_mg_l: snap.sensors.dissolvedOxygen,
    water_level_ok: snap.sensors.waterLevel > 20,
  });
}

export const app = new Elysia()
  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Device-Token", "X-Request-Id"],
    })
  )
  .onError(({ code, error, set }) => {
    const statusCode =
      code === "NOT_FOUND" ? 404 : code === "VALIDATION" ? 422 : 500;
    set.status = statusCode;
    const message =
      error instanceof Error ? error.message : "Unexpected backend error";
    console.error(`[API-ERROR] [${code}] ${message}`);
    return {
      success: false,
      error: message,
      code: statusCode,
    };
  })
  .get("/", () => {
    const snap = simulator.getSnapshot();
    return {
      name: "UrbanGrow Backend API",
      version: "1.1.0",
      status: "running",
      mode: snap.system.mode,
      edgeOnline: snap.system.edgeOnline,
      database: getDatabaseStatus(),
      endpoints: {
        health: "GET /health",
        current: "GET /api/sensors/current",
        history: "GET /api/sensors/history",
        alerts: "GET /api/alerts",
        telemetry: "POST /api/sensors/telemetry",
        iotCommands: "GET /api/iot/commands",
        iotStatus: "GET /api/iot/status",
        toggleActuator: "POST /api/actuators/:id/toggle",
        setActuator: "POST /api/actuators/:id/set",
        simulateAnomaly: "POST /api/simulation/anomaly",
        aiChat: "POST /api/ai/chat",
        aiCohort: "GET /api/ai/cohort",
        aiCohortUpdate: "POST /api/ai/cohort",
        aiDiagnostics: "GET /api/ai/diagnostics",
        aiPredictions: "GET /api/ai/predictions",
        aiPredict: "POST /api/ai/predict",
        aiClimateScore: "GET /api/ai/climate-score",
        wsTelemetry: "WS /api/telemetry/ws",
      },
    };
  })
  .get("/health", () => ({
    status: "ok",
    service: "urbangrow-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  }))

  // Edge MQTT & hybrid IoT bridge status
  .get("/api/mqtt/status", () => ({
    success: true,
    ...MqttBridgeService.getStatus(),
  }))

  // Dedicated IoT hardware connectivity & hybrid sensor source status
  .get("/api/iot/status", () => {
    const snap = simulator.getSnapshot();
    return {
      success: true,
      edgeOnline: snap.system.edgeOnline,
      mode: snap.system.mode,
      liveSensorCount: snap.system.liveSensorCount,
      lastTelemetryAt: snap.system.lastTelemetryAt,
      sensorSources: snap.sensorSources,
      devices: simulator.getIotDevices(),
      commands: simulator.getCommandsForEsp32(snap.system.edgeNode),
    };
  })

  // Lightweight command polling endpoint for ESP32 hardware actuators
  .get(
    "/api/iot/commands",
    ({ query }) => ({
      success: true,
      ...simulator.getCommandsForEsp32(query.device_id || "ESP32-GROW-01"),
    }),
    {
      query: t.Object({
        device_id: t.Optional(t.String()),
      }),
    }
  )

  // Flexible edge telemetry ingestion (supports partial payloads like LDR-only + auto-dummy fallback)
  .post(
    "/api/sensors/telemetry",
    ({ body }) => {
      const result = MqttBridgeService.handleIncomingTelemetry(body);
      TelemetryWebSocketManager.broadcastTelemetry("telemetry");
      const snap = simulator.getSnapshot();
      return {
        success: true,
        message: "Telemetry ingested",
        device_id: result.deviceId,
        accepted_fields: result.acceptedFields,
        sensorSources: snap.sensorSources,
        commands: simulator.getCommandsForEsp32(result.deviceId),
      };
    },
    {
      body: TelemetryIngestBody,
    }
  )

  // 1. Current real-time sensor snapshot (hybrid live IoT + smooth auto-dummy)
  .get("/api/sensors/current", () => simulator.getSnapshot())

  // 2. Historical sensor data for telemetry trend charts
  .get("/api/sensors/history", () => ({
    success: true,
    count: simulator.getHistory().length,
    data: simulator.getHistory(),
  }))

  // 3. Active system alerts
  .get("/api/alerts", () => ({
    success: true,
    alerts: simulator.evaluateAlerts(),
  }))

  // 4. Actuator toggling (waterPump/pump, aerator, growLight, feeder, dosingPump)
  .post(
    "/api/actuators/:id/toggle",
    ({ params: { id }, set }) => {
      const existing = simulator.getActuator(id);
      if (!existing) {
        set.status = 404;
        return { success: false, message: `Actuator '${id}' not found` };
      }

      const nextState = !existing.isOn;
      const safety = checkPumpSafetyIfEnabling(id, nextState);
      if (!safety.allowed) {
        set.status = 400;
        return { success: false, message: safety.reason };
      }

      const updated = simulator.toggleActuator(id);
      TelemetryWebSocketManager.broadcastTelemetry("actuator_update");
      return { success: true, actuator: updated };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // 4b. Explicit actuator state setter (ON/OFF command)
  .post(
    "/api/actuators/:id/set",
    ({ params: { id }, body, set }) => {
      const existing = simulator.getActuator(id);
      if (!existing) {
        set.status = 404;
        return { success: false, message: `Actuator '${id}' not found` };
      }

      const safety = checkPumpSafetyIfEnabling(id, body.state);
      if (!safety.allowed) {
        set.status = 400;
        return { success: false, message: safety.reason };
      }

      const updated = simulator.setActuator(id, body.state, body.mode || "manual");
      TelemetryWebSocketManager.broadcastTelemetry("actuator_update");
      return { success: true, actuator: updated };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        state: t.Boolean(),
        mode: t.Optional(t.Union([t.Literal("auto"), t.Literal("manual")])),
      }),
    }
  )

  // 5. Trigger generative anomaly mode (ph_drop, heatwave, tds_spike, none)
  .post(
    "/api/simulation/anomaly",
    ({ body }) => {
      const result = simulator.setAnomaly(body.type);
      TelemetryWebSocketManager.broadcastTelemetry("telemetry");
      return {
        success: true,
        message: `Simulation mode changed to: ${body.type}`,
        ...result,
      };
    },
    {
      body: t.Object({
        type: t.Union([
          t.Literal("none"),
          t.Literal("ph_drop"),
          t.Literal("heatwave"),
          t.Literal("tds_spike"),
        ]),
      }),
    }
  )

  // 6. Direct sensor override from IoT hardware simulator
  .post(
    "/api/simulation/sensor-override",
    ({ body }) => {
      const updated = simulator.overrideSensors(body as any);
      TelemetryWebSocketManager.broadcastTelemetry("telemetry");
      return { success: true, sensors: updated };
    },
    {
      body: t.Object(
        {
          ph: t.Optional(t.Number()),
          tds: t.Optional(t.Number()),
          waterTemperature: t.Optional(t.Number()),
          airTemperature: t.Optional(t.Number()),
          humidity: t.Optional(t.Number()),
          lightIntensity: t.Optional(t.Number()),
          dissolvedOxygen: t.Optional(t.Number()),
          waterLevel: t.Optional(t.Number()),
        },
        { additionalProperties: true }
      ),
    }
  )

  // 7. Manual feed dispense (3000ms fail-safe pulse)
  .post("/api/feed/dispense", () => {
    const durationMs = SafetyInterlockManager.getFeederDispenseDurationMs();
    simulator.triggerFeedPulse(durationMs);
    TelemetryWebSocketManager.broadcastTelemetry("actuator_update");
    return {
      success: true,
      duration_ms: durationMs,
      message: "Pakan berhasil didistribusikan (35g pelet)",
    };
  })

  // 8. Direct APK download for mobile testing
  .get("/download/urbangrow.apk", ({ set }) => {
    const { resolve } = require("path");
    const { existsSync } = require("fs");
    const apkPath = resolve(
      import.meta.dir,
      "../../../apps/mobile/build/app/outputs/flutter-apk/app-release.apk"
    );
    if (!existsSync(apkPath)) {
      set.status = 404;
      return "APK file not found on disk. Build in progress.";
    }
    const apkFile = Bun.file(apkPath);
    set.headers["Content-Type"] = "application/vnd.android.package-archive";
    set.headers["Content-Disposition"] = 'attachment; filename="UrbanGrow-v1.0.5.apk"';
    return apkFile;
  })

  // 9. Gemini AI Chatbot Copilot (Multimodal Vision + Chart Generation + IoT Diagnosis)
  .post(
    "/api/ai/chat",
    async ({ body, set }) => {
      const msg = (body.message ?? "").trim();
      const imgs = body.images ?? [];
      if (!msg && imgs.length === 0) {
        set.status = 400;
        return { success: false, message: "Pesan atau lampiran gambar wajib diisi." };
      }

      return await AgriBotEngine.chat({
        message: msg,
        history: body.history,
        images: imgs,
        cropDayPakcoy: body.cropDayPakcoy,
        cropDayKangkung: body.cropDayKangkung,
      });
    },
    {
      body: t.Object({
        message: t.Optional(t.String()),
        history: t.Optional(
          t.Array(
            t.Object({
              role: t.Union([
                t.Literal("user"),
                t.Literal("assistant"),
                t.Literal("bot"),
                t.Literal("model"),
              ]),
              text: t.String(),
            })
          )
        ),
        images: t.Optional(
          t.Array(
            t.Object({
              mimeType: t.String(),
              data: t.String({ maxLength: 5_500_000 }),
              name: t.Optional(t.String()),
            }),
            { maxItems: 3 }
          )
        ),
        cropDayPakcoy: t.Optional(t.Number({ minimum: 0, maximum: 90 })),
        cropDayKangkung: t.Optional(t.Number({ minimum: 0, maximum: 90 })),
      }),
    }
  )

  // 10. Structured AI Diagnostics & Predictions (Plant, Water, Fish, Trends, GDD Harvest)
  .get("/api/ai/cohort", () => ({
    success: true,
    cohort: AgriBotEngine.getCohortConfig(),
    history: AgriBotEngine.getCohortHistory(10),
    diagnostics: AgriBotEngine.buildDiagnostics(),
  }))
  .post(
    "/api/ai/cohort",
    ({ body }) => {
      const cohort = AgriBotEngine.updateCohortConfig(body as any);
      const diagnostics = AgriBotEngine.buildDiagnostics();
      return {
        success: true,
        cohort,
        history: AgriBotEngine.getCohortHistory(10),
        diagnostics,
      };
    },
    {
      body: t.Object({
        fishMode: t.Optional(t.Union([t.Literal("both"), t.Literal("nila"), t.Literal("lele")])),
        nila: t.Optional(
          t.Object({
            count: t.Optional(t.Number({ minimum: 1, maximum: 500 })),
            stockingDate: t.Optional(t.String()),
            initialLengthCm: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
            targetHarvestLengthCm: t.Optional(t.Number({ minimum: 5, maximum: 80 })),
          })
        ),
        lele: t.Optional(
          t.Object({
            count: t.Optional(t.Number({ minimum: 1, maximum: 500 })),
            stockingDate: t.Optional(t.String()),
            initialLengthCm: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
            targetHarvestLengthCm: t.Optional(t.Number({ minimum: 5, maximum: 80 })),
          })
        ),
        pakcoy: t.Optional(
          t.Object({
            seedingDate: t.Optional(t.String()),
            plantCount: t.Optional(t.Number({ minimum: 1, maximum: 500 })),
          })
        ),
        kangkung: t.Optional(
          t.Object({
            seedingDate: t.Optional(t.String()),
            plantCount: t.Optional(t.Number({ minimum: 1, maximum: 500 })),
          })
        ),
      }),
    }
  )
  .get(
    "/api/ai/diagnostics",
    ({ query }) => ({
      success: true,
      ...AgriBotEngine.buildDiagnostics(
        query.pakcoyDay ? Number(query.pakcoyDay) : undefined,
        query.kangkungDay ? Number(query.kangkungDay) : undefined
      ),
    }),
    {
      query: t.Object({
        pakcoyDay: t.Optional(t.String()),
        kangkungDay: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/api/ai/predictions",
    ({ query }) => {
      const report = AgriBotEngine.buildDiagnostics(
        query.pakcoyDay ? Number(query.pakcoyDay) : undefined,
        query.kangkungDay ? Number(query.kangkungDay) : undefined
      );
      return {
        success: true,
        timestamp: report.timestamp,
        overallStatus: report.overallStatus,
        sensorSources: report.sensorSources,
        cohort: report.cohort,
        predictions: report.predictions,
      };
    },
    {
      query: t.Object({
        pakcoyDay: t.Optional(t.String()),
        kangkungDay: t.Optional(t.String()),
      }),
    }
  )

  // 11. AI Engine Anomaly Evaluation Gateway
  .post("/api/ai/predict", async () => {
    const snap = simulator.getSnapshot();
    const result = await AiEngineClient.predictAnomaly({
      ph: snap.sensors.ph,
      tds_ppm: snap.sensors.tds,
      water_temp_c: snap.sensors.waterTemperature,
      air_temp_c: snap.sensors.airTemperature,
      humidity_pct: snap.sensors.humidity,
      lux: snap.sensors.lightIntensity,
      dissolved_oxygen: snap.sensors.dissolvedOxygen,
    });
    return { success: true, ...result };
  })

  // 12. AI Engine Climate Adaptation Score Gateway
  .get("/api/ai/climate-score", async () => {
    const snap = simulator.getSnapshot();
    const result = await AiEngineClient.calculateClimateScore({
      ph: snap.sensors.ph,
      tds_ppm: snap.sensors.tds,
      water_temp_c: snap.sensors.waterTemperature,
      air_temp_c: snap.sensors.airTemperature,
      humidity_pct: snap.sensors.humidity,
      lux: snap.sensors.lightIntensity,
      dissolved_oxygen: snap.sensors.dissolvedOxygen,
    });
    return { success: true, ...result };
  })

  // 13. Full-duplex WebSocket Telemetry Stream
  .ws("/api/telemetry/ws", {
    open(ws) {
      TelemetryWebSocketManager.addClient({
        id: ws.id,
        send: (msg) => ws.send(msg),
      });
    },
    message(ws, message: any) {
      if (message === "ping" || (typeof message === "object" && message?.type === "pong")) {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    },
    close(ws) {
      TelemetryWebSocketManager.removeClient({
        id: ws.id,
        send: () => {},
      });
    },
  });

export type App = typeof app;

if (import.meta.main) {
  app.listen({
    port: PORT,
    hostname: "0.0.0.0",
  });

  console.log(
    `🌱 UrbanGrow Backend (Elysia) running at http://${app.server?.hostname}:${app.server?.port}`
  );

  const shutdown = () => {
    console.log("[BACKEND] Shutting down gracefully...");
    TelemetryWebSocketManager.shutdown();
    app.stop(true);
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
