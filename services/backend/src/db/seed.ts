import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sensorReadings, actuatorLogs, systemAlerts } from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://urbangrow_admin:urbangrow_secret_2026@localhost:5432/urbangrow";

async function seedDatabase() {
  console.log("[DB-SEED] Connecting to database...");
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log("[DB-SEED] Inserting initial baseline records...");
    const now = new Date();

    // 1. Initial sensor snapshot
    await db.insert(sensorReadings).values({
      time: now,
      deviceId: "esp32-urbangrow-01",
      ph: "6.85",
      tdsPpm: "620.0",
      waterTempC: "24.8",
      airTempC: "28.5",
      humidityPct: "72.0",
      lux: "18500.0",
      dissolvedOxygen: "5.8",
      waterLevelOk: true,
    });

    // 2. Initial actuator state logs
    await db.insert(actuatorLogs).values([
      { actuatorId: "pump", state: true, triggeredBy: "safety_failsafe" },
      { actuatorId: "aerator", state: true, triggeredBy: "safety_failsafe" },
      { actuatorId: "feeder", state: false, triggeredBy: "user_manual" },
      { actuatorId: "grow_light", state: true, triggeredBy: "ai_automation" },
    ]);

    // 3. Initial system welcome alert
    await db.insert(systemAlerts).values({
      severity: "INFO",
      type: "SYSTEM_INITIALIZED",
      message: "UrbanGrow Smart Aquaponic core database seeded and active.",
      isResolved: true,
    });

    console.log("[DB-SEED] Seeding completed successfully.");
  } catch (error) {
    console.error("[DB-SEED] Seeding failed:", error);
  } finally {
    await sql.end();
  }
}

if (import.meta.main) {
  seedDatabase();
}
