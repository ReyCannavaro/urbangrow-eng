import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { simulator } from "./simulator";

export const app = new Elysia()
  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .get("/", () => ({
    name: "UrbanGrow Backend API",
    version: "1.0.0",
    status: "running",
    mode: "generative_simulation",
    endpoints: {
      current: "/api/sensors/current",
      history: "/api/sensors/history",
      alerts: "/api/alerts",
      toggleActuator: "POST /api/actuators/:id/toggle",
      simulateAnomaly: "POST /api/simulation/anomaly",
    },
  }))
  // 1. Current real-time sensor snapshot
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

  // 4. Actuator toggling (pump, aerator, light, dosing)
  .post(
    "/api/actuators/:id/toggle",
    ({ params: { id }, set }) => {
      const updated = simulator.toggleActuator(id);
      if (!updated) {
        set.status = 404;
        return { success: false, message: `Actuator '${id}' not found` };
      }
      return { success: true, actuator: updated };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // 5. Trigger generative anomaly mode (ph_drop, heatwave, tds_spike, none)
  .post(
    "/api/simulation/anomaly",
    ({ body }) => {
      const result = simulator.setAnomaly(body.type as any);
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
      return { success: true, sensors: updated };
    }
  )
  // 7. Direct APK download for mobile testing
  .get("/download/urbangrow.apk", ({ set }) => {
    const { resolve } = require("path");
    const { existsSync } = require("fs");
    const apkPath = resolve(
      import.meta.dir,
      "../../../apps/mobile/build/app/outputs/flutter-apk/app-release.apk"
    );
    console.log("APK request! Resolved path:", apkPath, "Exists:", existsSync(apkPath));
    if (!existsSync(apkPath)) {
      set.status = 404;
      return "APK file not found on disk. Build in progress.";
    }
    const apkFile = Bun.file(apkPath);
    set.headers["Content-Type"] = "application/vnd.android.package-archive";
    set.headers["Content-Disposition"] = 'attachment; filename="UrbanGrow-v1.0.3.apk"';
    return apkFile;
  })
  .listen({
    port: 3000,
    hostname: "0.0.0.0",
  });

export type App = typeof app;

console.log(
  `🌱 UrbanGrow Backend (Elysia) running at http://${app.server?.hostname}:${app.server?.port}`
);
