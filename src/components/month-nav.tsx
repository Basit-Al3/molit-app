import Link from "next/link";
import { monthLabel, nextMonthKey, previousMonthKey } from "@/lib/time";

export function MonthNav({ monthKey, currentKey }: { monthKey: string; currentKey: string }) {
  const prev = previousMonthKey(monthKey);
  const next = nextMonthKey(monthKey);
  const atCurrent = monthKey >= currentKey;
  return (
    <div className="inline-flex items-center gap-1 card-soft p-1">
      <Link href={`/app?m=${prev}`} className="w-9 h-9 grid place-items-center rounded-full hover:bg-ink hover:text-paper" aria-label="Previous month">
        ←
      </Link>
      <span className="px-3 font-semibold tracking-tight min-w-40 text-center">{monthLabel(monthKey)}</span>
      {atCurrent ? (
        <span className="w-9 h-9 grid place-items-center rounded-full text-muted" aria-disabled>
          →
        </span>
      ) : (
        <Link href={`/app?m=${next}`} className="w-9 h-9 grid place-items-center rounded-full hover:bg-ink hover:text-paper" aria-label="Next month">
          →
        </Link>
      )}
    </div>
  );
}
