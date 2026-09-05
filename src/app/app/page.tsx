import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddExpenseForm } from "@/components/add-expense-form";
import { CategoryBars } from "@/components/charts/category-bars";
import { DailyBars } from "@/components/charts/daily-bars";
import { ExpenseList } from "@/components/expense-list";
import { MonthNav } from "@/components/month-nav";
import { currentUserId } from "@/lib/auth/session";
import { byCategory, byDay, listBetween, totalsBetween, totalsForMonth } from "@/lib/expenses/queries";
import { formatMoney } from "@/lib/money";
import { boundsForMonthKey, monthKey as keyOf, monthName, previousMonthKey, todayIn } from "@/lib/time";
import { getUserById } from "@/lib/users";
import { waLink } from "@/lib/wa-link";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard(props: PageProps<"/app">) {
  const id = await currentUserId();
  const user = id ? await getUserById(id) : null;
  if (!user) redirect("/login");

  const sp = await props.searchParams;
  const today = todayIn(user.timezone);
  const currentKey = keyOf(today);
  const requested = typeof sp.m === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.m) ? sp.m : currentKey;
  const monthKey = requested > currentKey ? currentKey : requested;
  const { start, end, days: daysInMonth } = boundsForMonthKey(monthKey);
  const isCurrent = monthKey === currentKey;
  const elapsedDays = isCurrent ? Number(today.slice(8, 10)) : daysInMonth;

  const [totals, prev, perDay, cats, rows] = await Promise.all([
    totalsBetween(user.id, start, end),
    totalsForMonth(user.id, previousMonthKey(monthKey)),
    byDay(user.id, start, end),
    byCategory(user.id, start, end),
    listBetween(user.id, start, end),
  ]);

  const delta = prev.total > 0 ? Math.round(((totals.total - prev.total) / prev.total) * 100) : null;
  const perDayAvg = totals.total / Math.max(1, elapsedDays);
  const greeting = user.name ? user.name.split(" ")[0] : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-6">
        <div>
          <div className="eyebrow">{greeting ? `${greeting} · ` : ""}{isCurrent ? "so far this month" : "the whole month"}</div>
          <MonthNavWrapper monthKey={monthKey} currentKey={currentKey} />
        </div>
        {isCurrent && (
          <a className="text-sm text-ink-2 underline underline-offset-4 decoration-line hover:decoration-ink" href={waLink("month")} target="_blank" rel="noreferrer">
            Ask for this on WhatsApp instead →
          </a>
        )}
      </div>

      {/* Hero number */}
      <section className="mt-8 rule-strong pt-6">
        <div className="eyebrow">You&apos;ve spent</div>
        <div className="num display text-[3.4rem] sm:text-8xl mt-3 break-words">{formatMoney(totals.total, user.currency)}</div>
        <div className="mt-4 text-ink-2 flex flex-wrap gap-x-5 gap-y-1 text-sm sm:text-base">
          <span>
            {totals.count} expense{totals.count === 1 ? "" : "s"}
          </span>
          {totals.count > 0 && <span>about {formatMoney(perDayAvg, user.currency)} a day</span>}
          {delta !== null && (
            <span className={delta > 0 ? "text-red font-medium" : delta < 0 ? "text-ink font-medium" : ""}>
              {delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "same"} vs {monthName(previousMonthKey(monthKey))}
            </span>
          )}
        </div>
      </section>

      {/* Add box */}
      {isCurrent && (
        <section className="mt-8">
          <AddExpenseForm />
          <p className="mt-2 text-xs text-muted">Same words you&apos;d text. This box exists so you learn the syntax, not so you stop using WhatsApp.</p>
        </section>
      )}

      {totals.count === 0 ? (
        <section className="mt-14 card-soft p-8 sm:p-12 text-center">
          <p className="display-md text-3xl sm:text-4xl">Nothing here{isCurrent ? " yet" : ""}.</p>
          <p className="mt-4 text-ink-2 max-w-md mx-auto">
            {isCurrent ? (
              <>
                Text <span className="font-mono text-ink">chai 80</span> to Molit on WhatsApp and refresh. Or use the box above.
              </>
            ) : (
              <>You didn&apos;t send anything in {monthName(monthKey)}. That&apos;s allowed.</>
            )}
          </p>
          {isCurrent && (
            <a className="btn btn-ink mt-8" href={waLink("chai 80")} target="_blank" rel="noreferrer">
              Open WhatsApp →
            </a>
          )}
        </section>
      ) : (
        <>
          <section className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="eyebrow mb-3">Per day</div>
              <DailyBars monthKey={monthKey} days={perDay} currency={user.currency} today={today} />
            </div>
            <div>
              <div className="eyebrow mb-3">Where it went</div>
              <CategoryBars categories={cats} currency={user.currency} />
            </div>
          </section>

          <section className="mt-14">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="display-md text-2xl sm:text-3xl">Every expense</h2>
              <span className="text-xs text-muted">{rows.length} shown</span>
            </div>
            <ExpenseList expenses={rows} timeZone={user.timezone} />
          </section>
        </>
      )}
    </div>
  );
}

function MonthNavWrapper({ monthKey, currentKey }: { monthKey: string; currentKey: string }) {
  return (
    <div className="mt-3">
      <MonthNav monthKey={monthKey} currentKey={currentKey} />
    </div>
  );
}
