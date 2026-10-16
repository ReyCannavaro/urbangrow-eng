# 🗄️ Backend Database & Drizzle Schema Specification (`services/backend/src/db`)

> **Teknologi**: Drizzle ORM, node-postgres / postgres.js, TimescaleDB  
> **Status**: Production Reference Standard

---

## 📜 1. Definisi Skema Drizzle ORM (`src/db/schema.ts`)

```typescript
import { pgTable, serial, text, timestamp, numeric, boolean, integer, index } from "drizzle-orm/pg-core";

export const sensorReadings = pgTable("sensor_readings", {
  time: timestamp("time", { withTimezone: true }).notNull(),
  deviceId: text("device_id").notNull(),
  ph: numeric("ph", { precision: 4, scale: 2 }).notNull(),
  tdsPpm: numeric("tds_ppm", { precision: 6, scale: 1 }).notNull(),
  waterTempC: numeric("water_temp_c", { precision: 4, scale: 2 }).notNull(),
  airTempC: numeric("air_temp_c", { precision: 4, scale: 2 }).notNull(),
  humidityPct: numeric("humidity_pct", { precision: 4, scale: 1 }).notNull(),
  lux: numeric("lux", { precision: 7, scale: 1 }).notNull(),
  dissolvedOxygen: numeric("dissolved_oxygen", { precision: 4, scale: 2 }).notNull(),
  waterLevelOk: boolean("water_level_ok").notNull().default(true),
}, (table) => ({
  deviceTimeIdx: index("idx_sensor_readings_device_time").on(table.deviceId, table.time),
}));

export const actuatorLogs = pgTable("actuator_logs", {
  id: serial("id").primaryKey(),
  actuatorId: text("actuator_id").notNull(),
  state: boolean("state").notNull(),
  triggeredBy: text("triggered_by").notNull(), // "user_manual", "ai_automation", "safety_failsafe"
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  severity: text("severity").notNull(), // "INFO", "WARNING", "CRITICAL"
  type: text("type").notNull(),
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```
