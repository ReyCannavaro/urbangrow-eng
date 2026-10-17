import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://urbangrow_admin:urbangrow_secret_2026@localhost:5432/urbangrow",
  },
  verbose: true,
  strict: true,
});
