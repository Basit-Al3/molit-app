"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Mark } from "./logo";
import { markById, BRAND_MARK_ID_FALLBACK } from "./marks";

type Metrics = { cap: number; baseline: number; dot: number };

/**
 * One font candidate. The lockup here is laid out from live canvas
 * measurements of the font (cap height, baseline position, period width), so
 * the mark meets the letters the same way it does in the real vector lockup.
 */
export function TypeSpecimen({
  name,
  note,
  className,
  weight = 700,
  markId = BRAND_MARK_ID_FALLBACK,
  live = false,
}: {
  name: string;
  note: string;
  className: string;
  weight?: number;
  markId?: string;
  live?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [m, setM] = useState<Metrics | null>(null);
  const F = 56;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const fam = getComputedStyle(el).fontFamily;
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = `${weight} ${F}px ${fam}`;
      const l = c.measureText("l");
      const dot = c.measureText(".");
      const fA = l.fontBoundingBoxAscent;
      const fD = l.fontBoundingBoxDescent;
      // line-height = F → baseline offset inside the line box:
      const baseline = (F - (fA + fD)) / 2 + fA;
      setM({ cap: l.actualBoundingBoxAscent, baseline, dot: dot.width });
    });
    return () => {
      cancelled = true;
    };
  }, [weight]);

  const mark = markById(markId);
  const inkH = mark.ink.y1 - mark.ink.y0;
  const inkW = mark.ink.x1 - mark.ink.x0;
  let markStyle: React.CSSProperties = { visibility: "hidden" };
  let markSize = 0;
  let padLeft = 0;
  if (m) {
    const T = mark.lockup.ratio * m.cap;
    const s = T / inkH;
    markSize = 64 * s;
    const W = inkW * s;
    const top = (mark.lockup.align === "baseline" ? m.baseline - mark.ink.y1 * s : m.baseline - m.cap / 2 - T / 2 - mark.ink.y0 * s) + mark.lockup.dy * T;
    markStyle = { position: "absolute", left: -mark.ink.x0 * s, top, width: markSize, height: markSize };
    padLeft = W + m.cap / 2;
  }

  return (
    <div className={`card overflow-hidden ${live ? "ring-4 ring-lime" : ""}`}>
      <div className="flex items-baseline justify-between px-5 pt-4">
        <h3 className={`text-lg font-bold tracking-tight ${className}`}>{name}</h3>
        {live && <span className="text-xs font-semibold text-lime-deep">live</span>}
      </div>
      <p className="px-5 pt-1 text-sm text-ink-2 leading-snug">{note}</p>
      <div className="mt-4 grid sm:grid-cols-2 border-t border-line">
        <div className="p-6 flex items-center bg-paper">
          <span className="relative inline-block" style={{ height: F }}>
            <span style={markStyle}>
              <Mark size={markSize} id={markId} />
            </span>
            <span
              ref={ref}
              className={`block ${className}`}
              style={{ fontSize: F, lineHeight: 1, fontWeight: weight, letterSpacing: "-0.045em", paddingLeft: padLeft, whiteSpace: "nowrap" }}
            >
              Molit<span style={{ color: "var(--lime-deep)" }}>.</span>
            </span>
          </span>
        </div>
        <div className="p-6 bg-ink text-paper">
          <p className={`${className} text-[26px] leading-[1.02] tracking-[-0.03em]`} style={{ fontWeight: weight }}>
            You could track your spending in Notes. <span className="text-lime">You haven&apos;t.</span>
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end px-6 py-5 border-t border-line bg-paper-2/50">
        <p className={`${className} text-[15px] text-ink-2 leading-snug`} style={{ fontWeight: 400 }}>
          Molit is a WhatsApp number. Text it what you spent. On the 1st it tells you the total. That&apos;s it.
        </p>
        <p className={`${className} text-3xl tabular-nums tracking-tight`} style={{ fontWeight: 600 }}>
          Rs 48,200
        </p>
      </div>
    </div>
  );
}
