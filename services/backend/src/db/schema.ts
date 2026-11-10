import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core";

/**
 * Sensor Readings TimescaleDB Hypertable
 * Partitioned by 1-day chunks on the 'time' column.
 */
export const sensorReadings = pgTable(
  "sensor_readings",
  {
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
  },
  (table) => ({
    deviceTimeIdx: index("idx_sensor_readings_device_time").on(table.deviceId, table.time),
  })
);

/**
 * Actuator Command and State Audit Log
 */
export const actuatorLogs = pgTable("actuator_logs", {
  id: serial("id").primaryKey(),
  actuatorId: text("actuator_id").notNull(),
  state: boolean("state").notNull(),
  triggeredBy: text("triggered_by").notNull(), // "user_manual", "ai_automation", "safety_failsafe"
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * System Alerts & Biological Anomalies
 */
export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  severity: text("severity").notNull(), // "INFO", "WARNING", "CRITICAL"
  type: text("type").notNull(),
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Active Fish Stocking & Seed-to-Harvest Crop Cohort Configuration
 */
export const predictionCohorts = pgTable("prediction_cohorts", {
  id: text("id").primaryKey(),
  fishMode: text("fish_mode").notNull().default("both"), // "both" | "nila" | "lele"
  nilaEnabled: boolean("nila_enabled").notNull().default(true),
  nilaCount: integer("nila_count").notNull().default(35),
  nilaStockingDate: text("nila_stocking_date").notNull(),
  nilaInitialLengthCm: numeric("nila_initial_length_cm", { precision: 5, scale: 2 }).notNull(),
  nilaTargetLengthCm: numeric("nila_target_length_cm", { precision: 5, scale: 2 }).notNull(),
  leleEnabled: boolean("lele_enabled").notNull().default(true),
  leleCount: integer("lele_count").notNull().default(45),
  leleStockingDate: text("lele_stocking_date").notNull(),
  leleInitialLengthCm: numeric("lele_initial_length_cm", { precision: 5, scale: 2 }).notNull(),
  leleTargetLengthCm: numeric("lele_target_length_cm", { precision: 5, scale: 2 }).notNull(),
  pakcoySeedingDate: text("pakcoy_seeding_date").notNull(),
  pakcoyPlantCount: integer("pakcoy_plant_count").notNull().default(20),
  kangkungSeedingDate: text("kangkung_seeding_date").notNull(),
  kangkungPlantCount: integer("kangkung_plant_count").notNull().default(24),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Historical Audit Log of Fish Stocking & Seed Planting Batches
 */
export const predictionCohortLogs = pgTable("prediction_cohort_logs", {
  id: serial("id").primaryKey(),
  fishMode: text("fish_mode").notNull(),
  nilaCount: integer("nila_count").notNull(),
  nilaStockingDate: text("nila_stocking_date").notNull(),
  nilaInitialLengthCm: numeric("nila_initial_length_cm", { precision: 5, scale: 2 }).notNull(),
  nilaTargetLengthCm: numeric("nila_target_length_cm", { precision: 5, scale: 2 }).notNull(),
  leleCount: integer("lele_count").notNull(),
  leleStockingDate: text("lele_stocking_date").notNull(),
  leleInitialLengthCm: numeric("lele_initial_length_cm", { precision: 5, scale: 2 }).notNull(),
  leleTargetLengthCm: numeric("lele_target_length_cm", { precision: 5, scale: 2 }).notNull(),
  pakcoySeedingDate: text("pakcoy_seeding_date").notNull(),
  pakcoyPlantCount: integer("pakcoy_plant_count").notNull(),
  kangkungSeedingDate: text("kangkung_seeding_date").notNull(),
  kangkungPlantCount: integer("kangkung_plant_count").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
});
