---
name: backend-engineering-elysia
description: Comprehensive backend engineering skill specialized in ElysiaJS, Bun runtime, TypeScript, Drizzle ORM, PostgreSQL/TimescaleDB time-series IoT ingestion, WebSocket/SSE telemetry, and clean architecture. Use when designing, building, refactoring, or optimizing backend APIs, IoT data pipelines, actuators, schemas, or database integrations for the UrbanGrow ecosystem.
---

# 🚀 Backend Engineering & Architecture Skill: ElysiaJS, Drizzle & IoT Telemetry

> **Core Focus**: High-performance, type-safe backend systems for **UrbanGrow Smart Aquaponics** powered by **ElysiaJS**, **Bun**, **Drizzle ORM**, and **TimescaleDB / PostgreSQL**.

---

## 🏗️ 1. ARCHITECTURE & CODE ORGANIZATION

Standard directory structure for `services/backend/src`:

```
services/backend/src/
├── config/
│   └── env.ts                 # TypeBox-validated environment variables
├── db/
│   ├── index.ts               # Drizzle database client & connection pool
│   ├── schema/
│   │   ├── sensors.ts         # Time-series telemetry tables
│   │   ├── actuators.ts       # Actuator state & control logs
│   │   ├── alerts.ts          # System threshold alert events
│   │   └── index.ts           # Schema aggregator export
│   └── migrations/            # Auto-generated Drizzle migration SQLs
├── modules/
│   ├── sensors/
│   │   ├── sensors.model.ts   # TypeBox DTO schemas & validations
│   │   ├── sensors.service.ts # Data aggregation & sensor business logic
│   │   └── sensors.controller.ts # Elysia route definitions
│   ├── actuators/
│   │   ├── actuators.model.ts
│   │   ├── actuators.service.ts
│   │   └── actuators.controller.ts
│   ├── telemetry/
│   │   ├── telemetry.ws.ts    # WebSocket stream handler for live UI updates
│   │   └── mock-generator.ts  # Simulated ESP32 telemetry feed
│   └── alerts/
│       ├── alerts.service.ts  # Threshold violation detector
│       └── alerts.controller.ts
├── common/
│   ├── errors/
│   │   ├── app-error.ts       # Standardized error hierarchy
│   │   └── error-handler.ts   # Centralized Elysia onError plugin
│   ├── middlewares/
│   │   └── logger.ts          # Request/response performance logger
│   └── types/
│       └── api-response.ts    # Standard JSON envelope
└── index.ts                   # Elysia application bootstrap & export type App
```

---

## ⚡ 2. ELYSIAJS & BUN CORE PRACTICES

### 2.A Standardized Response Envelope
All REST API endpoints MUST return responses adhering to a predictable JSON envelope:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    version?: string;
    total?: number;
    page?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### 2.B Route Validation with TypeBox (`t`)
Always define explicit schema validation on `body`, `query`, `params`, and `response`:

```typescript
import { Elysia, t } from "elysia";

export const SensorReadingDTO = t.Object({
  ph: t.Number({ minimum: 0, maximum: 14 }),
  tds: t.Number({ minimum: 0, maximum: 5000, description: "Total Dissolved Solids in ppm" }),
  waterTemperature: t.Number({ minimum: 0, maximum: 60, description: "Celsius" }),
  airTemperature: t.Number({ minimum: -10, maximum: 70, description: "Celsius" }),
  humidity: t.Number({ minimum: 0, maximum: 100, description: "Percentage" }),
  lightIntensity: t.Number({ minimum: 0, maximum: 100000, description: "Lux" }),
  deviceId: t.Optional(t.String({ default: "esp32-main" })),
});

export const sensorsController = new Elysia({ prefix: "/api/sensors" })
  .post("/ingest", async ({ body, set }) => {
    // Process ingestion
    set.status = 201;
    return { success: true, data: body };
  }, {
    body: SensorReadingDTO,
    detail: {
      summary: "Ingest IoT sensor telemetries",
      tags: ["Sensors"]
    }
  });
```

### 2.C Centralized Error Handling
Implement custom error classes and attach a global `onError` handler:

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = new Elysia({ name: "error-handler" })
  .onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: { code: error.code, message: error.message, details: error.details },
      };
    }

    if (code === "VALIDATION") {
      set.status = 422;
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid request payload", details: error.all },
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Resource not found" },
      };
    }

    set.status = 500;
    console.error("[UnhandledError]", error);
    return {
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" },
    };
  });
```

---

## 🌊 3. REAL-TIME TELEMETRY (WEBSOCKET & SSE)

For low-latency streaming of ESP32 sensor feeds to Next.js (`apps/web`) and Flutter (`apps/mobile`):

### WebSocket Stream Handler
```typescript
import { Elysia, t } from "elysia";

export const telemetryWS = new Elysia()
  .ws("/ws/telemetry", {
    body: t.Object({
      action: t.Union([t.Literal("subscribe"), t.Literal("ping")]),
      topic: t.Optional(t.String()),
    }),
    open(ws) {
      ws.subscribe("sensors:realtime");
      ws.send({ event: "connected", message: "Subscribed to UrbanGrow telemetry feed" });
    },
    message(ws, message) {
      if (message.action === "ping") {
        ws.send({ event: "pong", timestamp: Date.now() });
      }
    },
    close(ws) {
      ws.unsubscribe("sensors:realtime");
    }
  });
```

Broadcast real-time sensor updates to all connected subscribers whenever new sensor data arrives or when mock ticks occur:
```typescript
// Inside background telemetry worker or ingestion hook:
app.server?.publish("sensors:realtime", JSON.stringify(telemetryPayload));
```

---

## 🗄️ 4. DRIZZLE ORM & TIMESCALEDB SCHEMA DESIGN

### 4.A Time-Series Hypertable Schema (`db/schema/sensors.ts`)
```typescript
import { pgTable, serial, text, real, timestamp, integer, index } from "drizzle-orm/pg-core";

export const sensorReadings = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().default("esp32-main"),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  ph: real("ph").notNull(),
  tds: integer("tds").notNull(),
  waterTemperature: real("water_temperature").notNull(),
  airTemperature: real("air_temperature").notNull(),
  humidity: real("humidity").notNull(),
  lightIntensity: integer("light_intensity").notNull(),
}, (table) => ({
  timestampIdx: index("sensor_readings_timestamp_idx").on(table.timestamp),
  deviceTimeIdx: index("sensor_readings_device_time_idx").on(table.deviceId, table.timestamp),
}));

export type SensorReadingRecord = typeof sensorReadings.$inferSelect;
export type NewSensorReading = typeof sensorReadings.$inferInsert;
```

### 4.B Actuator & Alert Schema (`db/schema/actuators.ts`, `alerts.ts`)
```typescript
import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const actuators = pgTable("actuators", {
  id: text("id").primaryKey(), // e.g. "water-pump-1", "aerator-1", "grow-light-1"
  name: text("name").notNull(),
  type: text("type").notNull(), // "pump" | "aerator" | "light" | "feeder" | "dosing"
  isOn: boolean("is_on").notNull().default(false),
  mode: text("mode").notNull().default("auto"), // "auto" | "manual"
  lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const systemAlerts = pgTable("system_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  severity: text("severity").notNull(), // "info" | "warning" | "critical"
  metric: text("metric").notNull(),     // "ph" | "water_temp" | "tds" | "connectivity"
  message: text("message").notNull(),
  value: real("value"),
  threshold: real("threshold"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
```

### 4.C Database Client Setup (`db/index.ts`)
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/urbangrow";
const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
```

---

## 🎛️ 5. AQUAPONICS THRESHOLD & ACTUATOR LOGIC

Threshold values for common aquaponic systems (Tilapia + Lettuce / Herbs):

| Parameter | Safe Minimum | Safe Maximum | Critical Action |
|---|---|---|---|
| **pH** | `6.5` | `7.5` | Trigger pH buffer alerts (Acid/Base dosing) |
| **Water Temp** | `20.0 °C` | `28.0 °C` | Water heater or cooler alert |
| **TDS / EC** | `300 ppm` | `800 ppm` | Nutrient supplement or water flush |
| **Air Temp** | `18.0 °C` | `32.0 °C` | Exhaust fan activation |
| **Humidity** | `50 %` | `80 %` | Misting / ventilation |
| **Light** | `300 lux (night)` | `25,000 lux (day)` | Grow light timer control |

### Automated Rule Evaluator:
```typescript
export function evaluateThresholds(reading: SensorReadingDTO) {
  const alerts = [];
  if (reading.ph < 6.5) {
    alerts.push({ severity: "warning", metric: "ph", message: `Low pH detected: ${reading.ph}` });
  } else if (reading.ph > 7.8) {
    alerts.push({ severity: "critical", metric: "ph", message: `High pH danger: ${reading.ph}` });
  }
  if (reading.waterTemperature > 29.0) {
    alerts.push({ severity: "warning", metric: "water_temp", message: `High water temperature: ${reading.waterTemperature}°C` });
  }
  return alerts;
}
```

---

## 🔗 6. END-TO-END TYPE SAFETY WITH EDEN TREATY

Export the Elysia type in `services/backend/src/index.ts`:

```typescript
const app = new Elysia()
  .use(errorHandler)
  .use(sensorsController)
  .use(actuatorsController)
  .use(telemetryWS)
  .listen(3000);

export type App = typeof app;
```

In `apps/web` (Next.js):
```typescript
import { treaty } from "@elysiajs/eden";
import type { App } from "../../../services/backend/src";

export const api = treaty<App>("localhost:3000");

// In React components:
const { data, error } = await api.api.sensors.current.get();
```

---

## 🚫 ANTI-PATTERNS & QUALITY CHECKLIST

1. **NO untyped handlers**: Never write raw `(req, res) => ...`. Use TypeBox schema bindings for strict compile-time & runtime validation.
2. **NO database logic inside controllers**: Keep controllers thin; delegate all queries & business rules to `.service.ts`.
3. **NO plain string error throws**: Always throw typed `AppError` or handle errors through `onError`.
4. **NO hardcoded secrets**: Read all connection strings and secrets through a validated `config/env.ts` schema.
5. **NO missing timestamps on time-series**: Every sensor log must have an explicit ISO UTC timestamp and indexed device identity.
