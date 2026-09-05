import { formatCompact, formatMoney } from "@/lib/money";
import { boundsForMonthKey } from "@/lib/time";

type Day = { date: string; total: number; count: number };

type Props = {
  monthKey: string;
  days: Day[];
  currency: string;
  /** "YYYY-MM-DD" in the user's zone; days after it render as empty slots. */
  today: string;
  height?: number;
};

/**
 * One thin bar per calendar day. Single hue (ink) because the job is
 * magnitude, not identity. Hover reveals the exact figure.
 */
export function DailyBars({ monthKey, days, currency, today, height = 180 }: Props) {
  const { days: n } = boundsForMonthKey(monthKey);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const max = Math.max(1, ...days.map((d) => d.total));
  const W = 640;
  const H = height;
  const padB = 22;
  const padT = 20;
  const gap = 3;
  const slot = W / n;
  const barW = Math.max(3, slot - gap);
  const plotH = H - padB - padT;
  const maxDay = days.reduce<Day | null>((m, d) => (m === null || d.total > m.total ? d : m), null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={`Spending per day, ${monthKey}`}>
      <line x1="0" x2={W} y1={H - padB + 0.5} y2={H - padB + 0.5} stroke="var(--line-strong)" strokeWidth="1" />
      {Array.from({ length: n }, (_, i) => {
        const day = i + 1;
        const date = `${monthKey}-${String(day).padStart(2, "0")}`;
        const d = byDate.get(date);
        const future = date > today;
        const h = d ? Math.max(4, (d.total / max) * plotH) : 0;
        const x = i * slot + gap / 2;
        const y = H - padB - h;
        const showLabel = day === 1 || day % 7 === 0 || day === n;
        const isMax = maxDay && d && d.date === maxDay.date && d.total > 0;
        const tipX = Math.min(Math.max(x + barW / 2, 60), W - 60);
        return (
          <g key={date} className="bar-group" tabIndex={d ? 0 : -1}>
            {/* generous hit target */}
            <rect x={i * slot} y={0} width={slot} height={H - padB} fill="transparent" />
            {d ? (
              <rect className="bar" x={x} y={y} width={barW} height={h} rx="2" fill="var(--ink)" />
            ) : (
              <rect x={x} y={H - padB - 2} width={barW} height={2} rx="1" fill={future ? "var(--paper-3)" : "var(--line-strong)"} />
            )}
            {date === today && (
              <circle cx={x + barW / 2} cy={H - padB + 13} r="2.5" fill="var(--lime-deep)" />
            )}
            {showLabel && (
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
                {day}
              </text>
            )}
            {isMax && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)" fontFamily="var(--font-mono)">
                {formatCompact(d!.total)}
              </text>
            )}
            {d && (
              <g className="tip">
                <rect x={tipX - 58} y={2} width={116} height={22} rx="6" fill="var(--ink)" />
                <text x={tipX} y={17} textAnchor="middle" fontSize="11" fill="var(--paper)" fontFamily="var(--font-mono)">
                  {`${day} · ${formatMoney(d.total, currency)} · ${d.count}`}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
