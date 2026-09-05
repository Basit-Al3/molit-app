import { DailyBars } from "./charts/daily-bars";
import { CategoryBars } from "./charts/category-bars";

/** Static sample of the real dashboard, built from the real components. */
export function DashboardPreview() {
  const monthKey = "2026-09";
  const seed = [1400, 0, 2300, 860, 0, 3100, 1250, 540, 0, 4200, 900, 1100, 0, 2650, 700, 1900, 0, 0, 3300, 1200, 880, 0, 2100];
  const days = seed.map((total, i) => ({ date: `${monthKey}-${String(i + 1).padStart(2, "0")}`, total, count: total ? 1 + (i % 3) : 0 })).filter((d) => d.total > 0);
  const total = days.reduce((s, d) => s + d.total, 0);
  const cats = [
    { label: "Food & drink", total: total * 0.41, count: 19, share: 0.41 },
    { label: "Transport", total: total * 0.22, count: 11, share: 0.22 },
    { label: "Bills & subs", total: total * 0.21, count: 4, share: 0.21 },
    { label: "Groceries", total: total * 0.11, count: 5, share: 0.11 },
    { label: "Other", total: total * 0.05, count: 2, share: 0.05 },
  ];
  return (
    <div className="card p-5 sm:p-7 bg-paper shadow-[12px_12px_0_0_var(--ink)]">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow">September 2026 · so far</div>
          <div className="num display text-5xl sm:text-6xl mt-2">Rs 32,580</div>
          <div className="text-sm text-ink-2 mt-2">
            41 expenses · about Rs 1,416 a day · <span className="text-red font-medium">+12% vs August</span>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="eyebrow mb-3">Per day</div>
          <DailyBars monthKey={monthKey} days={days} currency="PKR" today="2026-09-23" height={150} />
        </div>
        <div>
          <div className="eyebrow mb-3">Where it went</div>
          <CategoryBars categories={cats} currency="PKR" />
        </div>
      </div>
    </div>
  );
}
