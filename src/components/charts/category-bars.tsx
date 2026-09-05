import { formatMoney } from "@/lib/money";

type Cat = { label: string; total: number; count: number; share: number };

/** Horizontal bars, sorted by size, directly labelled. No legend needed: one hue, magnitude only. */
export function CategoryBars({ categories, currency }: { categories: Cat[]; currency: string }) {
  const max = Math.max(1, ...categories.map((c) => c.total));
  if (categories.length === 0) {
    return <p className="text-muted text-sm">No categories yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {categories.map((c) => (
        <li key={c.label} className="group">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-sm font-medium">{c.label}</span>
            <span className="num text-sm">
              {formatMoney(c.total, currency)}
              <span className="text-muted ml-2 text-xs">{Math.round(c.share * 100)}%</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-paper-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-ink group-hover:bg-lime-deep transition-colors"
              style={{ width: `${Math.max(2, (c.total / max) * 100)}%` }}
              title={`${c.count} expense${c.count === 1 ? "" : "s"}`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
