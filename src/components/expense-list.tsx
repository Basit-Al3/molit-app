import type { Expense } from "@/lib/db/schema";
import { CATEGORY_LABEL, type Category } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import { dayLabel } from "@/lib/time";
import { deleteExpenseAction } from "@/app/app/actions";

export function ExpenseList({ expenses, timeZone }: { expenses: Expense[]; timeZone: string }) {
  const groups = new Map<string, Expense[]>();
  for (const e of expenses) {
    const k = String(e.localDate);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([date, items]) => {
        const dayTotal = items.reduce((s, e) => s + Number(e.amount), 0);
        return (
          <section key={date}>
            <div className="flex items-baseline justify-between rule-strong pt-3 mb-1">
              <h3 className="font-semibold tracking-tight">{dayLabel(date, timeZone)}</h3>
              <span className="num text-sm text-ink-2">{formatMoney(dayTotal, items[0].currency)}</span>
            </div>
            <ul>
              {items.map((e) => (
                <li key={e.id} className="group flex items-center gap-4 py-2.5 border-b border-line last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{e.note}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {CATEGORY_LABEL[(e.category as Category) in CATEGORY_LABEL ? (e.category as Category) : "other"]}
                      {e.source === "web" && " · web"}
                    </div>
                  </div>
                  <div className="num font-medium">{formatMoney(Number(e.amount), e.currency)}</div>
                  <form action={deleteExpenseAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      className="w-8 h-8 rounded-full grid place-items-center text-muted hover:bg-red hover:text-paper transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Delete ${e.note}`}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
