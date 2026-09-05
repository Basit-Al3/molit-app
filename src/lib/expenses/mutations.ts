import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Expense, User } from "@/lib/db/schema";
import type { ParsedExpense } from "@/lib/parser/parse";
import { addDays, localDate } from "@/lib/time";

export async function insertExpenses(
  user: User,
  parsed: ParsedExpense[],
  opts: { source: "whatsapp" | "web"; rawText?: string; waMessageId?: string },
): Promise<Expense[]> {
  const now = new Date();
  const rows = parsed.map((p) => {
    const occurredAt = new Date(now.getTime() - p.daysAgo * 86_400_000);
    return {
      userId: user.id,
      amount: p.amount.toFixed(2),
      currency: (p.currency ?? user.currency).toUpperCase(),
      note: p.note || "No note",
      category: p.category,
      occurredAt,
      localDate: p.daysAgo ? addDays(localDate(now, user.timezone), -p.daysAgo) : localDate(now, user.timezone),
      source: opts.source,
      rawText: opts.rawText ?? null,
      waMessageId: opts.waMessageId ?? null,
    };
  });
  return db().insert(schema.expenses).values(rows).returning();
}

/** Removes the most recently *logged* expense (by creation time), returns it. */
export async function undoLast(userId: string): Promise<Expense | null> {
  const [last] = await db()
    .select()
    .from(schema.expenses)
    .where(eq(schema.expenses.userId, userId))
    .orderBy(desc(schema.expenses.createdAt))
    .limit(1);
  if (!last) return null;
  await db().delete(schema.expenses).where(eq(schema.expenses.id, last.id));
  return last;
}

export async function deleteExpense(userId: string, id: string): Promise<boolean> {
  const deleted = await db()
    .delete(schema.expenses)
    .where(and(eq(schema.expenses.id, id), eq(schema.expenses.userId, userId)))
    .returning({ id: schema.expenses.id });
  return deleted.length > 0;
}

export async function deleteAllExpenses(userId: string): Promise<number> {
  const deleted = await db().delete(schema.expenses).where(eq(schema.expenses.userId, userId)).returning({ id: schema.expenses.id });
  return deleted.length;
}
