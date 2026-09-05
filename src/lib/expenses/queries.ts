import { and, between, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Expense } from "@/lib/db/schema";
import { CATEGORY_LABEL, type Category } from "@/lib/categories";
import { addDays, boundsForMonthKey, todayIn, type YMD } from "@/lib/time";

export type Totals = { total: number; count: number };
export type CategoryTotal = { category: Category; label: string; total: number; count: number; share: number };
export type DayTotal = { date: YMD; total: number; count: number };

const num = (v: unknown) => Number(v ?? 0);

export async function totalsBetween(userId: string, start: YMD, end: YMD): Promise<Totals> {
  const [row] = await db()
    .select({ total: sql<string>`coalesce(sum(${schema.expenses.amount}), 0)`, count: sql<number>`count(*)::int` })
    .from(schema.expenses)
    .where(and(eq(schema.expenses.userId, userId), between(schema.expenses.localDate, start, end)));
  return { total: num(row?.total), count: num(row?.count) };
}

export async function totalsForMonth(userId: string, monthKey: string) {
  const { start, end } = boundsForMonthKey(monthKey);
  return totalsBetween(userId, start, end);
}

export async function totalsToday(userId: string, timeZone: string) {
  const today = todayIn(timeZone);
  return totalsBetween(userId, today, today);
}

export async function totalsLast7Days(userId: string, timeZone: string) {
  const today = todayIn(timeZone);
  return totalsBetween(userId, addDays(today, -6), today);
}

export async function byCategory(userId: string, start: YMD, end: YMD): Promise<CategoryTotal[]> {
  const rows = await db()
    .select({
      category: schema.expenses.category,
      total: sql<string>`sum(${schema.expenses.amount})`,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.expenses)
    .where(and(eq(schema.expenses.userId, userId), between(schema.expenses.localDate, start, end)))
    .groupBy(schema.expenses.category)
    .orderBy(desc(sql`sum(${schema.expenses.amount})`));
  const grand = rows.reduce((s, r) => s + num(r.total), 0);
  return rows.map((r) => {
    const category = (r.category in CATEGORY_LABEL ? r.category : "other") as Category;
    return {
      category,
      label: CATEGORY_LABEL[category],
      total: num(r.total),
      count: num(r.count),
      share: grand > 0 ? num(r.total) / grand : 0,
    };
  });
}

export async function byDay(userId: string, start: YMD, end: YMD): Promise<DayTotal[]> {
  const rows = await db()
    .select({
      date: schema.expenses.localDate,
      total: sql<string>`sum(${schema.expenses.amount})`,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.expenses)
    .where(and(eq(schema.expenses.userId, userId), gte(schema.expenses.localDate, start), lte(schema.expenses.localDate, end)))
    .groupBy(schema.expenses.localDate)
    .orderBy(schema.expenses.localDate);
  return rows.map((r) => ({ date: String(r.date), total: num(r.total), count: num(r.count) }));
}

export async function listBetween(userId: string, start: YMD, end: YMD, limit = 500): Promise<Expense[]> {
  return db()
    .select()
    .from(schema.expenses)
    .where(and(eq(schema.expenses.userId, userId), between(schema.expenses.localDate, start, end)))
    .orderBy(desc(schema.expenses.localDate), desc(schema.expenses.occurredAt))
    .limit(limit);
}

export async function recent(userId: string, limit = 10): Promise<Expense[]> {
  return db()
    .select()
    .from(schema.expenses)
    .where(eq(schema.expenses.userId, userId))
    .orderBy(desc(schema.expenses.occurredAt))
    .limit(limit);
}

/** Every month the user has data for, newest first, as "YYYY-MM". */
export async function monthsWithData(userId: string): Promise<string[]> {
  const rows = await db()
    .select({ m: sql<string>`to_char(${schema.expenses.localDate}, 'YYYY-MM')` })
    .from(schema.expenses)
    .where(eq(schema.expenses.userId, userId))
    .groupBy(sql`1`)
    .orderBy(desc(sql`1`));
  return rows.map((r) => r.m);
}
