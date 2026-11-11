import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { PredictionCohortConfig } from "../geminiChat";

export interface AutomationScheduleRow {
  id: string;
  title: string;
  triggerType: "time" | "sensor_threshold";
  scheduleTime: string | null;
  sensorMetric: string | null;
  operator: "<" | ">" | null;
  thresholdValue: number | null;
  actuatorId: string;
  targetState: boolean;
  notes: string;
  enabled: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export interface PersistedSensorRow {
  id: number;
  recordedAt: string;
  deviceId: string;
  ph: number | null;
  tds: number | null;
  waterTemperature: number | null;
  airTemperature: number | null;
  humidity: number | null;
  lightIntensity: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
}

export interface ActuatorLogRow {
  id: number;
  actuatorId: string;
  actuatorName: string;
  state: boolean;
  triggeredBy: string;
  note: string;
  recordedAt: string;
}

export interface PersistedAlertRow {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  metric: string;
  isResolved: boolean;
  recordedAt: string;
}

export interface CohortAuditRow {
  id: number;
  fishMode: "both" | "nila" | "lele";
  nilaCount: number;
  nilaStockingDate: string;
  nilaInitialLengthCm: number;
  nilaTargetLengthCm: number;
  leleCount: number;
  leleStockingDate: string;
  leleInitialLengthCm: number;
  leleTargetLengthCm: number;
  pakcoySeedingDate: string;
  pakcoyPlantCount: number;
  kangkungSeedingDate: string;
  kangkungPlantCount: number;
  recordedAt: string;
}

interface PredictionCohortDbRow {
  id: string;
  fish_mode: string;
  nila_enabled: number;
  nila_count: number;
  nila_stocking_date: string;
  nila_initial_length_cm: number;
  nila_target_length_cm: number;
  lele_enabled: number;
  lele_count: number;
  lele_stocking_date: string;
  lele_initial_length_cm: number;
  lele_target_length_cm: number;
  pakcoy_seeding_date: string;
  pakcoy_plant_count: number;
  kangkung_seeding_date: string;
  kangkung_plant_count: number;
  updated_at: string;
}

function resolveDbPath(): string {
  if (process.env.URBANGROW_DB_PATH && process.env.URBANGROW_DB_PATH.trim()) {
    return process.env.URBANGROW_DB_PATH.trim();
  }
  if (process.env.NODE_ENV === "test") {
    return ":memory:";
  }
  const dataDir = process.env.URBANGROW_DATA_DIR
    ? resolve(process.env.URBANGROW_DATA_DIR)
    : resolve(import.meta.dir, "../../data");
  return resolve(dataDir, "urbangrow.sqlite");
}

let dbInstance: Database | null = null;
let activeDbPath = resolveDbPath();

export function initDatabase(): Database {
  if (dbInstance) return dbInstance;

  activeDbPath = resolveDbPath();
  if (activeDbPath !== ":memory:") {
    mkdirSync(dirname(activeDbPath), { recursive: true });
  }

  const db = new Database(activeDbPath, { create: true });
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = NORMAL;");
  db.exec("PRAGMA busy_timeout = 5000;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS prediction_cohorts (
      id TEXT PRIMARY KEY,
      fish_mode TEXT NOT NULL CHECK (fish_mode IN ('both', 'nila', 'lele')),
      nila_enabled INTEGER NOT NULL DEFAULT 1,
      nila_count INTEGER NOT NULL,
      nila_stocking_date TEXT NOT NULL,
      nila_initial_length_cm REAL NOT NULL,
      nila_target_length_cm REAL NOT NULL,
      lele_enabled INTEGER NOT NULL DEFAULT 1,
      lele_count INTEGER NOT NULL,
      lele_stocking_date TEXT NOT NULL,
      lele_initial_length_cm REAL NOT NULL,
      lele_target_length_cm REAL NOT NULL,
      pakcoy_seeding_date TEXT NOT NULL,
      pakcoy_plant_count INTEGER NOT NULL,
      kangkung_seeding_date TEXT NOT NULL,
      kangkung_plant_count INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prediction_cohort_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fish_mode TEXT NOT NULL,
      nila_count INTEGER NOT NULL,
      nila_stocking_date TEXT NOT NULL,
      nila_initial_length_cm REAL NOT NULL,
      nila_target_length_cm REAL NOT NULL,
      lele_count INTEGER NOT NULL,
      lele_stocking_date TEXT NOT NULL,
      lele_initial_length_cm REAL NOT NULL,
      lele_target_length_cm REAL NOT NULL,
      pakcoy_seeding_date TEXT NOT NULL,
      pakcoy_plant_count INTEGER NOT NULL,
      kangkung_seeding_date TEXT NOT NULL,
      kangkung_plant_count INTEGER NOT NULL,
      recorded_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_prediction_cohort_logs_recorded_at
      ON prediction_cohort_logs (recorded_at DESC);

    CREATE TABLE IF NOT EXISTS automation_schedules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time', 'sensor_threshold')),
      schedule_time TEXT,
      sensor_metric TEXT,
      operator TEXT,
      threshold_value REAL,
      actuator_id TEXT NOT NULL,
      target_state INTEGER NOT NULL DEFAULT 1,
      notes TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      last_triggered_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recorded_at TEXT NOT NULL,
      device_id TEXT NOT NULL,
      ph REAL,
      tds REAL,
      water_temp REAL,
      air_temp REAL,
      humidity REAL,
      light_intensity REAL,
      dissolved_oxygen REAL,
      water_level REAL
    );

    CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at
      ON sensor_readings (recorded_at DESC);

    CREATE TABLE IF NOT EXISTS actuator_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actuator_id TEXT NOT NULL,
      actuator_name TEXT NOT NULL,
      state INTEGER NOT NULL,
      triggered_by TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      recorded_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_actuator_logs_recorded_at
      ON actuator_logs (recorded_at DESC);

    CREATE TABLE IF NOT EXISTS system_alerts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
      metric TEXT NOT NULL DEFAULT 'system',
      is_resolved INTEGER NOT NULL DEFAULT 0,
      recorded_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_system_alerts_recorded_at
      ON system_alerts (recorded_at DESC);
  `);

  migrateLegacyNonNullSensorColumns(db);

  dbInstance = db;
  seedDefaultSchedulesAndLogs(db);
  return db;
}

function migrateLegacyNonNullSensorColumns(db: Database): void {
  const columns = db
    .query<{ name: string; notnull: number }, []>("PRAGMA table_info(sensor_readings)")
    .all();

  const metricCols = new Set([
    "ph",
    "tds",
    "water_temp",
    "air_temp",
    "humidity",
    "light_intensity",
    "dissolved_oxygen",
    "water_level",
  ]);

  const needsMigration = columns.some(
    (col) => metricCols.has(col.name) && col.notnull === 1
  );
  if (!needsMigration) return;

  db.exec(`
    BEGIN IMMEDIATE;
    ALTER TABLE sensor_readings RENAME TO sensor_readings_legacy;
    CREATE TABLE sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recorded_at TEXT NOT NULL,
      device_id TEXT NOT NULL,
      ph REAL,
      tds REAL,
      water_temp REAL,
      air_temp REAL,
      humidity REAL,
      light_intensity REAL,
      dissolved_oxygen REAL,
      water_level REAL
    );
    INSERT INTO sensor_readings (
      id, recorded_at, device_id, ph, tds, water_temp, air_temp,
      humidity, light_intensity, dissolved_oxygen, water_level
    )
    SELECT
      id, recorded_at, device_id, ph, tds, water_temp, air_temp,
      humidity, light_intensity, dissolved_oxygen, water_level
    FROM sensor_readings_legacy;
    DROP TABLE sensor_readings_legacy;
    CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at
      ON sensor_readings (recorded_at DESC);
    COMMIT;
  `);
}

function seedDefaultSchedulesAndLogs(db: Database): void {
  const schedCount = db
    .query<{ cnt: number }, []>("SELECT COUNT(*) as cnt FROM automation_schedules")
    .get();
  if ((schedCount?.cnt ?? 0) === 0) {
    const nowIso = new Date().toISOString();
    const insertSched = db.query(
      `INSERT INTO automation_schedules (
        id, title, trigger_type, schedule_time, sensor_metric, operator, threshold_value,
        actuator_id, target_state, notes, enabled, last_triggered_at, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 1, NULL, ?11)`
    );
    insertSched.run(
      "sched-feed-morning",
      "Pemberian Pakan Pagi (35g)",
      "time",
      "07:00",
      null,
      null,
      null,
      "feeder",
      1,
      "Pakan pelet apung protein 32% untuk kolam Ikan Nila L3 & Lele L1.",
      nowIso
    );
    insertSched.run(
      "sched-feed-afternoon",
      "Pemberian Pakan Sore (35g)",
      "time",
      "16:30",
      null,
      null,
      null,
      "feeder",
      1,
      "Siklus pakan sore sebelum penurunan suhu malam.",
      nowIso
    );
    insertSched.run(
      "sched-temp-aerator",
      "Proteksi Suhu & Oksigen Kolam Nila L3",
      "sensor_threshold",
      null,
      "waterTemperature",
      ">",
      28.5,
      "aerator",
      1,
      "Otomatis menyalakan Aerator Venturi jika suhu air naik di atas 28.5°C.",
      nowIso
    );
  }

  const alertCount = db
    .query<{ cnt: number }, []>("SELECT COUNT(*) as cnt FROM system_alerts")
    .get();
  if ((alertCount?.cnt ?? 0) === 0) {
    const nowIso = new Date().toISOString();
    const insertAlert = db.query(
      `INSERT INTO system_alerts (id, title, message, severity, metric, is_resolved, recorded_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
    );
    insertAlert.run(
      "init-alert-1",
      "Inisialisasi Database & Gateway Telemetri",
      "Database SQLite siap merekam data riil dari node ESP32-GROW-01 begitu paket telemetri pertama diterima.",
      "info",
      "system",
      1,
      nowIso
    );
    insertAlert.run(
      "init-alert-2",
      "Konfigurasi Default Sirkulasi 4-Level Siap",
      "Status target awal relay dimuat ke memori dan menunggu sinkronisasi dari mikrokontroler ESP32.",
      "info",
      "waterPump",
      1,
      nowIso
    );
  }
}

export function loadActivePredictionCohort(
  createDefault: () => PredictionCohortConfig
): PredictionCohortConfig {
  const db = initDatabase();
  const row = db
    .query<PredictionCohortDbRow, [string]>(
      "SELECT * FROM prediction_cohorts WHERE id = ?1 LIMIT 1"
    )
    .get("active");

  if (!row) {
    const initial = createDefault();
    saveActivePredictionCohort(initial, false);
    return initial;
  }

  const fishMode: PredictionCohortConfig["fishMode"] =
    row.fish_mode === "nila" || row.fish_mode === "lele" || row.fish_mode === "both"
      ? row.fish_mode
      : "both";

  return {
    fishMode,
    nila: {
      enabled: fishMode === "both" || fishMode === "nila",
      species: "nila",
      count: row.nila_count,
      stockingDate: row.nila_stocking_date,
      initialLengthCm: row.nila_initial_length_cm,
      targetHarvestLengthCm: row.nila_target_length_cm,
    },
    lele: {
      enabled: fishMode === "both" || fishMode === "lele",
      species: "lele",
      count: row.lele_count,
      stockingDate: row.lele_stocking_date,
      initialLengthCm: row.lele_initial_length_cm,
      targetHarvestLengthCm: row.lele_target_length_cm,
    },
    pakcoy: {
      seedingDate: row.pakcoy_seeding_date,
      plantCount: row.pakcoy_plant_count,
    },
    kangkung: {
      seedingDate: row.kangkung_seeding_date,
      plantCount: row.kangkung_plant_count,
    },
    updatedAt: row.updated_at,
  };
}

export function saveActivePredictionCohort(
  config: PredictionCohortConfig,
  recordAuditLog: boolean = true
): PredictionCohortConfig {
  const db = initDatabase();
  const nowIso = config.updatedAt || new Date().toISOString();

  db.query(
    `INSERT INTO prediction_cohorts (
      id,
      fish_mode,
      nila_enabled,
      nila_count,
      nila_stocking_date,
      nila_initial_length_cm,
      nila_target_length_cm,
      lele_enabled,
      lele_count,
      lele_stocking_date,
      lele_initial_length_cm,
      lele_target_length_cm,
      pakcoy_seeding_date,
      pakcoy_plant_count,
      kangkung_seeding_date,
      kangkung_plant_count,
      updated_at
    ) VALUES (
      'active', ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16
    )
    ON CONFLICT(id) DO UPDATE SET
      fish_mode = excluded.fish_mode,
      nila_enabled = excluded.nila_enabled,
      nila_count = excluded.nila_count,
      nila_stocking_date = excluded.nila_stocking_date,
      nila_initial_length_cm = excluded.nila_initial_length_cm,
      nila_target_length_cm = excluded.nila_target_length_cm,
      lele_enabled = excluded.lele_enabled,
      lele_count = excluded.lele_count,
      lele_stocking_date = excluded.lele_stocking_date,
      lele_initial_length_cm = excluded.lele_initial_length_cm,
      lele_target_length_cm = excluded.lele_target_length_cm,
      pakcoy_seeding_date = excluded.pakcoy_seeding_date,
      pakcoy_plant_count = excluded.pakcoy_plant_count,
      kangkung_seeding_date = excluded.kangkung_seeding_date,
      kangkung_plant_count = excluded.kangkung_plant_count,
      updated_at = excluded.updated_at`
  ).run(
    config.fishMode,
    config.nila.enabled ? 1 : 0,
    config.nila.count,
    config.nila.stockingDate,
    config.nila.initialLengthCm,
    config.nila.targetHarvestLengthCm,
    config.lele.enabled ? 1 : 0,
    config.lele.count,
    config.lele.stockingDate,
    config.lele.initialLengthCm,
    config.lele.targetHarvestLengthCm,
    config.pakcoy.seedingDate,
    config.pakcoy.plantCount,
    config.kangkung.seedingDate,
    config.kangkung.plantCount,
    nowIso
  );

  if (recordAuditLog) {
    db.query(
      `INSERT INTO prediction_cohort_logs (
        fish_mode,
        nila_count,
        nila_stocking_date,
        nila_initial_length_cm,
        nila_target_length_cm,
        lele_count,
        lele_stocking_date,
        lele_initial_length_cm,
        lele_target_length_cm,
        pakcoy_seeding_date,
        pakcoy_plant_count,
        kangkung_seeding_date,
        kangkung_plant_count,
        recorded_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`
    ).run(
      config.fishMode,
      config.nila.count,
      config.nila.stockingDate,
      config.nila.initialLengthCm,
      config.nila.targetHarvestLengthCm,
      config.lele.count,
      config.lele.stockingDate,
      config.lele.initialLengthCm,
      config.lele.targetHarvestLengthCm,
      config.pakcoy.seedingDate,
      config.pakcoy.plantCount,
      config.kangkung.seedingDate,
      config.kangkung.plantCount,
      nowIso
    );
  }

  return {
    ...config,
    updatedAt: nowIso,
  };
}

export function getCohortAuditHistory(limit: number = 15): CohortAuditRow[] {
  const db = initDatabase();
  const rows = db
    .query<
      {
        id: number;
        fish_mode: string;
        nila_count: number;
        nila_stocking_date: string;
        nila_initial_length_cm: number;
        nila_target_length_cm: number;
        lele_count: number;
        lele_stocking_date: string;
        lele_initial_length_cm: number;
        lele_target_length_cm: number;
        pakcoy_seeding_date: string;
        pakcoy_plant_count: number;
        kangkung_seeding_date: string;
        kangkung_plant_count: number;
        recorded_at: string;
      },
      [number]
    >(
      "SELECT * FROM prediction_cohort_logs ORDER BY id DESC LIMIT ?1"
    )
    .all(Math.max(1, Math.min(100, limit)));

  return rows.map((r) => ({
    id: r.id,
    fishMode:
      r.fish_mode === "nila" || r.fish_mode === "lele" || r.fish_mode === "both"
        ? r.fish_mode
        : "both",
    nilaCount: r.nila_count,
    nilaStockingDate: r.nila_stocking_date,
    nilaInitialLengthCm: r.nila_initial_length_cm,
    nilaTargetLengthCm: r.nila_target_length_cm,
    leleCount: r.lele_count,
    leleStockingDate: r.lele_stocking_date,
    leleInitialLengthCm: r.lele_initial_length_cm,
    leleTargetLengthCm: r.lele_target_length_cm,
    pakcoySeedingDate: r.pakcoy_seeding_date,
    pakcoyPlantCount: r.pakcoy_plant_count,
    kangkungSeedingDate: r.kangkung_seeding_date,
    kangkungPlantCount: r.kangkung_plant_count,
    recordedAt: r.recorded_at,
  }));
}

export function listAutomationSchedules(): AutomationScheduleRow[] {
  const db = initDatabase();
  const rows = db
    .query<
      {
        id: string;
        title: string;
        trigger_type: string;
        schedule_time: string | null;
        sensor_metric: string | null;
        operator: string | null;
        threshold_value: number | null;
        actuator_id: string;
        target_state: number;
        notes: string;
        enabled: number;
        last_triggered_at: string | null;
        created_at: string;
      },
      []
    >("SELECT * FROM automation_schedules ORDER BY created_at ASC")
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    triggerType: r.trigger_type === "sensor_threshold" ? "sensor_threshold" : "time",
    scheduleTime: r.schedule_time,
    sensorMetric: r.sensor_metric,
    operator: r.operator === "<" || r.operator === ">" ? r.operator : null,
    thresholdValue: r.threshold_value,
    actuatorId: r.actuator_id,
    targetState: r.target_state === 1,
    notes: r.notes,
    enabled: r.enabled === 1,
    lastTriggeredAt: r.last_triggered_at,
    createdAt: r.created_at,
  }));
}

export function createAutomationSchedule(input: {
  title: string;
  triggerType: "time" | "sensor_threshold";
  scheduleTime?: string;
  sensorMetric?: string;
  operator?: "<" | ">";
  thresholdValue?: number;
  actuatorId: string;
  targetState?: boolean;
  notes?: string;
}): AutomationScheduleRow {
  const db = initDatabase();
  const id = `sched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();
  const targetState = input.targetState !== undefined ? input.targetState : true;

  db.query(
    `INSERT INTO automation_schedules (
      id, title, trigger_type, schedule_time, sensor_metric, operator, threshold_value,
      actuator_id, target_state, notes, enabled, last_triggered_at, created_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 1, NULL, ?11)`
  ).run(
    id,
    input.title.trim(),
    input.triggerType,
    input.triggerType === "time" ? (input.scheduleTime || "08:00") : null,
    input.triggerType === "sensor_threshold" ? (input.sensorMetric || "waterTemperature") : null,
    input.triggerType === "sensor_threshold" ? (input.operator || ">") : null,
    input.triggerType === "sensor_threshold" ? (input.thresholdValue ?? 28.5) : null,
    input.actuatorId,
    targetState ? 1 : 0,
    (input.notes || "").trim(),
    nowIso
  );

  return {
    id,
    title: input.title.trim(),
    triggerType: input.triggerType,
    scheduleTime: input.triggerType === "time" ? (input.scheduleTime || "08:00") : null,
    sensorMetric: input.triggerType === "sensor_threshold" ? (input.sensorMetric || "waterTemperature") : null,
    operator: input.triggerType === "sensor_threshold" ? (input.operator || ">") : null,
    thresholdValue: input.triggerType === "sensor_threshold" ? (input.thresholdValue ?? 28.5) : null,
    actuatorId: input.actuatorId,
    targetState,
    notes: (input.notes || "").trim(),
    enabled: true,
    lastTriggeredAt: null,
    createdAt: nowIso,
  };
}

export function toggleAutomationSchedule(id: string): AutomationScheduleRow | null {
  const db = initDatabase();
  db.query("UPDATE automation_schedules SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ?1").run(id);
  return listAutomationSchedules().find((s) => s.id === id) ?? null;
}

export function markAutomationScheduleTriggered(id: string): void {
  const db = initDatabase();
  db.query("UPDATE automation_schedules SET last_triggered_at = ?1 WHERE id = ?2").run(
    new Date().toISOString(),
    id
  );
}

export function deleteAutomationSchedule(id: string): boolean {
  const db = initDatabase();
  const res = db.query("DELETE FROM automation_schedules WHERE id = ?1").run(id);
  return res.changes > 0;
}

export function recordSensorReading(sample: {
  deviceId: string;
  ph: number | null;
  tds: number | null;
  waterTemperature: number | null;
  airTemperature: number | null;
  humidity: number | null;
  lightIntensity: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
  recordedAt?: string;
}): void {
  const db = initDatabase();
  const ts = sample.recordedAt || new Date().toISOString();
  db.query(
    `INSERT INTO sensor_readings (
      recorded_at, device_id, ph, tds, water_temp, air_temp, humidity,
      light_intensity, dissolved_oxygen, water_level
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
  ).run(
    ts,
    sample.deviceId,
    sample.ph,
    sample.tds,
    sample.waterTemperature,
    sample.airTemperature,
    sample.humidity,
    sample.lightIntensity,
    sample.dissolvedOxygen,
    sample.waterLevel
  );

  // Keep latest 2000 telemetry rows so disk usage stays bounded
  db.exec(
    "DELETE FROM sensor_readings WHERE id NOT IN (SELECT id FROM sensor_readings ORDER BY id DESC LIMIT 2000)"
  );
}

export function getPersistedSensorReadings(limit: number = 250): PersistedSensorRow[] {
  const db = initDatabase();
  const rows = db
    .query<
      {
        id: number;
        recorded_at: string;
        device_id: string;
        ph: number | null;
        tds: number | null;
        water_temp: number | null;
        air_temp: number | null;
        humidity: number | null;
        light_intensity: number | null;
        dissolved_oxygen: number | null;
        water_level: number | null;
      },
      [number]
    >("SELECT * FROM sensor_readings ORDER BY id DESC LIMIT ?1")
    .all(Math.max(1, Math.min(2000, limit)));

  return rows.reverse().map((r) => ({
    id: r.id,
    recordedAt: r.recorded_at,
    deviceId: r.device_id,
    ph: r.ph,
    tds: r.tds,
    waterTemperature: r.water_temp,
    airTemperature: r.air_temp,
    humidity: r.humidity,
    lightIntensity: r.light_intensity,
    dissolvedOxygen: r.dissolved_oxygen,
    waterLevel: r.water_level,
  }));
}

export function recordActuatorLog(entry: {
  actuatorId: string;
  actuatorName: string;
  state: boolean;
  triggeredBy: string;
  note?: string;
}): void {
  const db = initDatabase();
  db.query(
    `INSERT INTO actuator_logs (actuator_id, actuator_name, state, triggered_by, note, recorded_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  ).run(
    entry.actuatorId,
    entry.actuatorName,
    entry.state ? 1 : 0,
    entry.triggeredBy,
    (entry.note || "").trim(),
    new Date().toISOString()
  );

  db.exec(
    "DELETE FROM actuator_logs WHERE id NOT IN (SELECT id FROM actuator_logs ORDER BY id DESC LIMIT 500)"
  );
}

export function getActuatorLogs(limit: number = 40): ActuatorLogRow[] {
  const db = initDatabase();
  const rows = db
    .query<
      {
        id: number;
        actuator_id: string;
        actuator_name: string;
        state: number;
        triggered_by: string;
        note: string;
        recorded_at: string;
      },
      [number]
    >("SELECT * FROM actuator_logs ORDER BY id DESC LIMIT ?1")
    .all(Math.max(1, Math.min(200, limit)));

  return rows.map((r) => ({
    id: r.id,
    actuatorId: r.actuator_id,
    actuatorName: r.actuator_name,
    state: r.state === 1,
    triggeredBy: r.triggered_by,
    note: r.note,
    recordedAt: r.recorded_at,
  }));
}

export function upsertSystemAlert(alert: {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  metric?: string;
  isResolved?: boolean;
}): void {
  const db = initDatabase();
  db.query(
    `INSERT INTO system_alerts (id, title, message, severity, metric, is_resolved, recorded_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       message = excluded.message,
       severity = excluded.severity,
       is_resolved = excluded.is_resolved,
       recorded_at = excluded.recorded_at`
  ).run(
    alert.id,
    alert.title,
    alert.message,
    alert.severity,
    alert.metric || "system",
    alert.isResolved ? 1 : 0,
    new Date().toISOString()
  );
}

export function getPersistedSystemAlerts(limit: number = 50): PersistedAlertRow[] {
  const db = initDatabase();
  const rows = db
    .query<
      {
        id: string;
        title: string;
        message: string;
        severity: string;
        metric: string;
        is_resolved: number;
        recorded_at: string;
      },
      [number]
    >("SELECT * FROM system_alerts ORDER BY recorded_at DESC LIMIT ?1")
    .all(Math.max(1, Math.min(200, limit)));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    severity:
      r.severity === "critical" || r.severity === "warning" ? r.severity : "info",
    metric: r.metric,
    isResolved: r.is_resolved === 1,
    recordedAt: r.recorded_at,
  }));
}

export function resolveAllPersistedAlerts(): void {
  const db = initDatabase();
  db.exec("UPDATE system_alerts SET is_resolved = 1");
}

export function getDatabaseStatus() {
  const db = initDatabase();
  const row = db
    .query<{ cnt: number }, []>("SELECT COUNT(*) as cnt FROM prediction_cohort_logs")
    .get();
  const schedRow = db
    .query<{ cnt: number }, []>("SELECT COUNT(*) as cnt FROM automation_schedules WHERE enabled = 1")
    .get();
  const readingRow = db
    .query<{ cnt: number }, []>("SELECT COUNT(*) as cnt FROM sensor_readings")
    .get();
  return {
    engine: "sqlite",
    ready: true,
    storage: activeDbPath === ":memory:" ? "memory" : "file",
    tables: [
      "prediction_cohorts",
      "prediction_cohort_logs",
      "automation_schedules",
      "sensor_readings",
      "actuator_logs",
      "system_alerts",
    ],
    cohortAuditCount: row?.cnt ?? 0,
    activeSchedulesCount: schedRow?.cnt ?? 0,
    persistedReadingsCount: readingRow?.cnt ?? 0,
  };
}

