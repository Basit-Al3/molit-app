import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { requireEnv } from "@/lib/env";

/**
 * A single postgres-js pool per process. In dev, Next hot-reloads modules,
 * so the pool is stashed on globalThis to avoid leaking connections.
 * `prepare: false` keeps it compatible with Supabase's transaction pooler.
 */
const globalForDb = globalThis as unknown as { __molitSql?: ReturnType<typeof postgres> };

function getSql() {
  if (!globalForDb.__molitSql) {
    globalForDb.__molitSql = postgres(requireEnv("DATABASE_URL"), {
      max: 5,
      prepare: false,
      idle_timeout: 20,
    });
  }
  return globalForDb.__molitSql;
}

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function db() {
  if (!_db) _db = drizzle(getSql(), { schema });
  return _db;
}

export { schema };
