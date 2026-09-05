/**
 * The monthly message. This is the product's one promise:
 * "at the end of the month it tells you what you spent."
 */
import type { User } from "@/lib/db/schema";
import { byCategory, totalsForMonth } from "@/lib/expenses/queries";
import { formatMoney } from "@/lib/money";
import { boundsForMonthKey, monthName, previousMonthKey } from "@/lib/time";

export type MonthlySummary = {
  monthKey: string;
  total: number;
  count: number;
  categories: { label: string; total: number; share: number }[];
  previousTotal: number | null;
  text: string;
};

export async function buildMonthlySummary(user: User, monthKey: string): Promise<MonthlySummary> {
  const { start, end, days } = boundsForMonthKey(monthKey);
  const [totals, cats, prev] = await Promise.all([
    totalsForMonth(user.id, monthKey),
    byCategory(user.id, start, end),
    totalsForMonth(user.id, previousMonthKey(monthKey)),
  ]);
  const previousTotal = prev.count > 0 ? prev.total : null;
  const name = monthName(monthKey);
  const c = user.currency;

  let text: string;
  if (totals.count === 0) {
    text = `${name} is over. You sent me nothing, so I have nothing to tell you. Next month, text me what you spend.`;
  } else {
    const lines = [
      `${name} is over.`,
      ``,
      `You spent ${formatMoney(totals.total, c)} across ${totals.count} expense${totals.count === 1 ? "" : "s"}.`,
      `That's about ${formatMoney(totals.total / days, c)} a day.`,
    ];
    if (previousTotal !== null && previousTotal > 0) {
      const pct = Math.round(((totals.total - previousTotal) / previousTotal) * 100);
      if (pct > 0) lines.push(`${pct}% more than ${monthName(previousMonthKey(monthKey))}.`);
      else if (pct < 0) lines.push(`${Math.abs(pct)}% less than ${monthName(previousMonthKey(monthKey))}.`);
      else lines.push(`Same as ${monthName(previousMonthKey(monthKey))}.`);
    }
    if (cats.length > 0) {
      lines.push(``, `Where it went:`);
      for (const cat of cats.slice(0, 4)) {
        lines.push(`• ${cat.label} — ${formatMoney(cat.total, c)} (${Math.round(cat.share * 100)}%)`);
      }
    }
    lines.push(``, `That's it. That's the app. Text "login" for the dashboard.`);
    text = lines.join("\n");
  }

  return {
    monthKey,
    total: totals.total,
    count: totals.count,
    categories: cats.map((x) => ({ label: x.label, total: x.total, share: x.share })),
    previousTotal,
    text,
  };
}

/** Short one-liner used after every logged expense: "September so far: Rs 12,450 · 14 expenses" */
export async function monthSoFarLine(user: User, monthKey: string): Promise<string> {
  const t = await totalsForMonth(user.id, monthKey);
  return `${monthName(monthKey)} so far: ${formatMoney(t.total, user.currency)} · ${t.count} expense${t.count === 1 ? "" : "s"}`;
}
