import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null;

export const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
}) : null;

export const db = pool ? drizzle(pool, { schema }) : null;

export function assertDatabaseReady() {
  if (!db) {
    throw new Error(
      "Database is not configured yet. Set DATABASE_URL (or POSTGRES_URL) before using database-backed routes.",
    );
  }

  return db;
}

export async function testDatabaseConnection() {
  if (!db) {
    return {
      ok: false,
      message: "Database is not configured. Add DATABASE_URL to enable persistent storage.",
    };
  }

  try {
    await db.execute("SELECT 1");
    return { ok: true, message: "Database connection successful." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export * from "./schema";
