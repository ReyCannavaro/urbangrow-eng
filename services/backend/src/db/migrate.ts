import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://urbangrow_admin:urbangrow_secret_2026@localhost:5432/urbangrow";

async function runMigrations() {
  console.log("[DRIZZLE-MIGRATE] Connecting to PostgreSQL/TimescaleDB...");
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log("[DRIZZLE-MIGRATE] Running pending schema migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[DRIZZLE-MIGRATE] All database migrations applied successfully.");
  } catch (error) {
    console.error("[DRIZZLE-MIGRATE] Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

if (import.meta.main) {
  runMigrations();
}
