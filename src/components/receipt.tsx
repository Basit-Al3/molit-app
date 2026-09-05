/** The monthly message, rendered as the receipt it basically is. */
export function Receipt({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const rows: [string, string][] = [
    ["Food & drink", "Rs 19,760"],
    ["Transport", "Rs 10,610"],
    ["Bills & subs", "Rs 9,180"],
    ["Groceries", "Rs 5,300"],
    ["Everything else", "Rs 3,350"],
  ];
  return (
    <div className={`receipt-edge bg-white/70 border-[1.5px] border-ink border-b-0 ${className}`} style={{ borderRadius: "14px 14px 0 0" }}>
      <div className={`${compact ? "px-4 pt-4 pb-5 text-[10px] leading-relaxed" : "px-6 sm:px-8 pt-6 pb-8 text-[13px] sm:text-sm leading-relaxed"} font-mono`}>
        <div className="flex items-baseline justify-between border-b border-dashed border-line-strong pb-3">
          <span className={`font-semibold tracking-tight ${compact ? "text-xs" : "text-base"}`}>Molit.</span>
          <span className="text-muted">01 Oct · 09:00</span>
        </div>
        <p className={`mt-4 font-sans leading-snug ${compact ? "text-[11px]" : "text-[15px]"}`}>
          September is over.
          <br />
          <br />
          You spent <span className="font-semibold">Rs 48,200</span> across 63 expenses.
          <br />
          That&apos;s about Rs 1,607 a day.
          <br />
          <span className="text-red font-medium">12% more than August.</span>
        </p>
        <div className="mt-5 border-t border-dashed border-line-strong pt-3 space-y-1.5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-ink-2">{k}</span>
              <span className="tabular-nums">{v}</span>
            </div>
          ))}
        </div>
        <div className={`mt-3 border-t-2 border-ink pt-3 flex justify-between font-semibold ${compact ? "text-xs" : "text-base"}`}>
          <span>Total</span>
          <span className="tabular-nums">Rs 48,200</span>
        </div>
        <p className={`mt-5 font-sans leading-snug ${compact ? "text-[11px]" : "text-[15px]"}`}>That&apos;s it. That&apos;s the app.</p>
        <p className="mt-6 text-center text-muted text-[11px] tracking-[0.2em] uppercase">* no tips * no advice * no upsell *</p>
      </div>
    </div>
  );
}
