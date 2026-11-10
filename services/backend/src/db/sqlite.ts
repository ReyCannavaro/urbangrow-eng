import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { PredictionCohortConfig } from "../geminiChat";

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
  `);

  dbInstance = db;
  return db;
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

export function getDatabaseStatus() {
  const db = initDatabase();
  const row = db
    .query<{ cnt: number }, []>("SELECT COUNT(*) as cnt FROM prediction_cohort_logs")
    .get();
  return {
    engine: "sqlite",
    ready: true,
    storage: activeDbPath === ":memory:" ? "memory" : "file",
    tables: ["prediction_cohorts", "prediction_cohort_logs"],
    cohortAuditCount: row?.cnt ?? 0,
  };
}

