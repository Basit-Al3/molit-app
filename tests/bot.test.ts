/**
 * Runs the real bot against the real (local) database. Needs DATABASE_URL.
 * Simulates the exact conversation shown on the landing page.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { replyFor } from "@/lib/whatsapp/handle";
import { findOrCreateUser } from "@/lib/users";
import type { User } from "@/lib/db/schema";
import { totalsForMonth } from "@/lib/expenses/queries";
import { monthKey, todayIn } from "@/lib/time";
import { buildMonthlySummary } from "@/lib/summary";

const PHONE = "920000000001";
let user: User;

async function say(text: string) {
  const fresh = (await db().query.users.findFirst({ where: eq(schema.users.id, user.id) }))!;
  return replyFor(fresh, false, text, `wamid.test.${Math.random()}`);
}

beforeAll(async () => {
  await db().delete(schema.users).where(eq(schema.users.phone, PHONE));
  const r = await findOrCreateUser(PHONE, "Test Person");
  user = r.user;
  expect(r.isNew).toBe(true);
  expect(user.currency).toBe("PKR");
  expect(user.timezone).toBe("Asia/Karachi");
});

afterAll(async () => {
  await db().delete(schema.users).where(eq(schema.users.phone, PHONE));
});

describe("bot conversation", () => {
  it("welcomes a new user", async () => {
    const reply = await replyFor(user, true, "hi");
    expect(reply).toContain("I'm Molit");
    expect(reply).toContain("PKR");
  });

  it("logs a single expense and reports month so far", async () => {
    const reply = await say("coffee 350");
    expect(reply).toContain("Logged. Coffee · Rs 350");
    expect(reply).toMatch(/so far: Rs 350 · 1 expense$/);
  });

  it("logs several at once", async () => {
    const reply = await say("uber 600, lunch 900");
    expect(reply).toContain("Logged 2:");
    expect(reply).toContain("• Uber · Rs 600");
    expect(reply).toContain("• Lunch · Rs 900");
    expect(reply).toContain("Total Rs 1,500.");
    expect(reply).toMatch(/so far: Rs 1,850 · 3 expenses$/);
  });

  it("reports the month by category", async () => {
    const reply = await say("month");
    expect(reply).toContain("Rs 1,850 across 3 expenses");
    expect(reply).toContain("Food & drink — Rs 1,250 (68%)");
    expect(reply).toContain("Transport — Rs 600 (32%)");
    expect(reply.trim().endsWith("That's it.")).toBe(true);
  });

  it("today and week", async () => {
    expect(await say("today")).toContain("Today: Rs 1,850");
    expect(await say("week")).toContain("Last 7 days: Rs 1,850");
  });

  it("logs yesterday's expense on yesterday's date", async () => {
    const reply = await say("dinner 1200 yesterday");
    expect(reply).toContain("Logged. Dinner · Rs 1,200 (yesterday)");
    const today = await say("today");
    expect(today).toContain("Rs 1,850"); // unchanged
  });

  it("undo removes the last logged", async () => {
    const reply = await say("undo");
    expect(reply).toContain("Removed: Dinner · Rs 1,200");
    expect(await say("undo")).not.toContain("Nothing to undo");
    // that removed Lunch (last created of the batch); restore state for later tests
    await say("lunch 900");
  });

  it("lists recent", async () => {
    const reply = await say("list");
    expect(reply).toContain("Last ");
    expect(reply).toContain("Lunch · Rs 900");
  });

  it("explicit currency is kept per expense", async () => {
    const reply = await say("$5 app store");
    expect(reply).toContain("App store · $5");
  });

  it("changes default currency", async () => {
    expect(await say("currency usd")).toContain("Currency set to USD");
    expect(await say("currency xyz")).toContain("I don't know");
    await say("currency pkr");
  });

  it("login returns a one-time link", async () => {
    const reply = await say("login");
    expect(reply).toMatch(/\/auth\/verify\?t=[A-Za-z0-9_-]{40,}/);
  });

  it("unknown text asks for a number", async () => {
    expect(await say("what's up bro")).toContain("didn't catch an amount");
  });

  it("delete everything needs confirmation", async () => {
    expect(await say("yes delete")).toContain("No deletion pending");
    expect(await say("delete everything")).toContain("YES DELETE");
    const done = await say("YES DELETE");
    expect(done).toMatch(/Done\. \d+ expenses gone/);
    const t = await totalsForMonth(user.id, monthKey(todayIn(user.timezone)));
    expect(t.count).toBe(0);
  });

  it("monthly summary text for an empty month is honest", async () => {
    const s = await buildMonthlySummary(user, "2020-01");
    expect(s.text).toContain("You sent me nothing");
  });

  it("summary off/on", async () => {
    expect(await say("stop")).toContain("No monthly message");
    expect(await say("summary on")).toContain("on the 1st");
  });
});
