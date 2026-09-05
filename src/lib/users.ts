import { eq } from "drizzle-orm";
import { db, schema, } from "@/lib/db";
import type { User } from "@/lib/db/schema";
import { inferLocale } from "@/lib/money";

export function normalisePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Find or create the user for a WhatsApp number. Returns whether they're new. */
export async function findOrCreateUser(phoneRaw: string, name?: string): Promise<{ user: User; isNew: boolean }> {
  const phone = normalisePhone(phoneRaw);
  const existing = await db().query.users.findFirst({ where: eq(schema.users.phone, phone) });
  if (existing) {
    if (name && !existing.name) {
      const [updated] = await db().update(schema.users).set({ name }).where(eq(schema.users.id, existing.id)).returning();
      return { user: updated, isNew: false };
    }
    return { user: existing, isNew: false };
  }
  const locale = inferLocale(phone);
  const [created] = await db()
    .insert(schema.users)
    .values({ phone, name: name ?? null, currency: locale.currency, timezone: locale.timezone })
    .onConflictDoNothing()
    .returning();
  if (created) return { user: created, isNew: true };
  // Lost a race with a concurrent webhook; read the winner.
  const winner = await db().query.users.findFirst({ where: eq(schema.users.phone, phone) });
  return { user: winner!, isNew: false };
}

export async function getUserById(id: string): Promise<User | null> {
  const u = await db().query.users.findFirst({ where: eq(schema.users.id, id) });
  return u ?? null;
}

export async function updateUser(id: string, patch: Partial<Pick<User, "name" | "currency" | "timezone" | "monthlySummary" | "pendingDeleteUntil">>) {
  const [u] = await db().update(schema.users).set(patch).where(eq(schema.users.id, id)).returning();
  return u;
}
