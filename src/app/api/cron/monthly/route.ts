/**
 * Runs on the 1st of each month (see vercel.json) and sends everyone their
 * summary for the month that just ended. Safe to call repeatedly: a row in
 * monthly_summaries guarantees one message per user per month.
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://your.app/api/cron/monthly
 */
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { optionalEnv, requireEnv } from "@/lib/env";
import { formatMoney } from "@/lib/money";
import { buildMonthlySummary } from "@/lib/summary";
import { monthKey, monthName, previousMonthKey, todayIn } from "@/lib/time";
import { sendTemplate, sendText } from "@/lib/whatsapp/client";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${requireEnv("CRON_SECRET")}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const users = await db().select().from(schema.users).where(eq(schema.users.monthlySummary, true));
  const template = optionalEnv("WHATSAPP_SUMMARY_TEMPLATE");
  const results: { phone: string; month: string; status: string }[] = [];

  for (const user of users) {
    // "Previous month" is relative to the user's own calendar.
    const key = previousMonthKey(monthKey(todayIn(user.timezone)));
    const monthStart = `${key}-01`;
    try {
      const summary = await buildMonthlySummary(user, key);
      if (summary.count === 0) {
        results.push({ phone: user.phone, month: key, status: "skipped-empty" });
        continue;
      }
      const claimed = await db()
        .insert(schema.monthlySummaries)
        .values({ userId: user.id, month: monthStart, total: summary.total.toFixed(2), count: summary.count })
        .onConflictDoNothing()
        .returning({ id: schema.monthlySummaries.id });
      if (claimed.length === 0) {
        results.push({ phone: user.phone, month: key, status: "already-sent" });
        continue;
      }
      if (template) {
        const top = summary.categories[0];
        await sendTemplate(user.phone, template, [
          monthName(key),
          formatMoney(summary.total, user.currency),
          String(summary.count),
          top ? `${top.label} (${Math.round(top.share * 100)}%)` : "nothing in particular",
        ]);
      } else {
        // Without an approved template this only lands inside a 24h window.
        await sendText(user.phone, summary.text);
      }
      results.push({ phone: user.phone, month: key, status: "sent" });
    } catch (error) {
      console.error(`monthly summary failed for ${user.phone}`, error);
      results.push({ phone: user.phone, month: key, status: "error" });
    }
  }

  return NextResponse.json({ ok: true, users: users.length, results });
}
