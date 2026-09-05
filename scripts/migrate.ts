/**
 * Applies every drizzle/*.sql file in order. Idempotent — the SQL uses
 * `if not exists`, and applied file names are recorded in `_migrations`.
 *
 *   DATABASE_URL=postgres://... npm run db:migrate
 */
import "./load-env";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1, prepare: false });
  await sql`create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())`;
  const applied = new Set((await sql`select name from _migrations`).map((r) => r.name as string));
  const dir = join(process.cwd(), "drizzle");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    process.stdout.write(`applying ${file}... `);
    await sql.unsafe(readFileSync(join(dir, file), "utf8"));
    await sql`insert into _migrations (name) values (${file})`;
    console.log("ok");
  }
  await sql.end();
  console.log("migrations complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
