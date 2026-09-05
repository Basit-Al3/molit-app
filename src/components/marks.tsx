import type { ReactNode } from "react";

/**
 * Candidate marks for Molit. All bare by default (no tile), all on a 64×64
 * grid with an 8-unit margin, one stroke weight (8, round caps and joins),
 * dots at 1.4× stroke, angles at 45° where a line changes direction.
 * `fg` is the mark colour, `detail` is used only where a shape is filled and
 * needs lines cut into it.
 */
export type MarkColors = { fg: string; detail: string };
/**
 * `ink` is the mark's real drawn bounds on the 64 grid (what the eye sees, not
 * the SVG box). `lockup` sizes that ink against the wordmark: `ratio` = ink
 * height / letter height; `align` = centre on the letters or sit on the
 * baseline; `dy` = optical nudge as a fraction of ink height (+ = down).
 */
export type Ink = { x0: number; y0: number; x1: number; y1: number };
export type Lockup = { ratio: number; align: "center" | "baseline"; dy: number };
export type MarkDef = { id: string; name: string; idea: string; ink: Ink; lockup: Lockup; draw: (c: MarkColors) => ReactNode };

const S = 8; // stroke
const cap = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const MARKS: MarkDef[] = [
  {
    id: "m-period",
    name: "M, full stop",
    idea: "An M whose last leg is a period. The wordmark's own idea, as a mark.",
    ink: { x0: 6, y0: 12, x1: 55.6, y1: 56 },
    lockup: { ratio: 1, align: "baseline", dy: 0 },
    draw: ({ fg }) => (
      <>
        <polyline points="10,52 10,16 30,36 50,16" fill="none" stroke={fg} strokeWidth={S} {...cap} />
        <circle cx="50" cy="47" r="5.6" fill={fg} />
      </>
    ),
  },
  {
    id: "m-rise",
    name: "M rising",
    idea: "An M drawn as a line: down, up, then up further. Ends on a dot.",
    ink: { x0: 6, y0: 8.4, x1: 57.6, y1: 56 },
    lockup: { ratio: 1.04, align: "baseline", dy: 0 },
    draw: ({ fg }) => (
      <>
        <polyline points="10,52 10,20 30,40 52,14" fill="none" stroke={fg} strokeWidth={S} {...cap} />
        <circle cx="52" cy="14" r="5.6" fill={fg} />
      </>
    ),
  },
  {
    id: "m-mono",
    name: "M.",
    idea: "A complete M, narrow, with the period beside it. Reads as ‘M.’ at every size.",
    ink: { x0: 4, y0: 12, x1: 60.6, y1: 56 },
    lockup: { ratio: 1, align: "baseline", dy: 0 },
    draw: ({ fg }) => (
      <>
        <polyline points="8,52 8,16 25,33 42,16 42,52" fill="none" stroke={fg} strokeWidth={S} {...cap} />
        <circle cx="55" cy="47" r="5.6" fill={fg} />
      </>
    ),
  },
  {
    id: "m-lower",
    name: "lowercase m",
    idea: "The m from molit, drawn in one weight. Friendly, no chart metaphor.",
    ink: { x0: 7, y0: 18.5, x1: 62.1, y1: 56 },
    lockup: { ratio: 0.78, align: "baseline", dy: 0 },
    draw: ({ fg }) => (
      <>
        <path d="M11 52V27M11 32a9.5 9.5 0 0 1 19 0v20M30 32a9.5 9.5 0 0 1 19 0v20" fill="none" stroke={fg} strokeWidth={S} {...cap} />
        <circle cx="57.5" cy="48" r="4.6" fill={fg} />
      </>
    ),
  },
  {
    id: "receipt-line",
    name: "Receipt, outline",
    idea: "A receipt drawn with one line. Two entries inside. No tile needed.",
    ink: { x0: 14, y0: 9, x1: 50, y1: 55 },
    lockup: { ratio: 1.04, align: "center", dy: 0 },
    draw: ({ fg }) => (
      <>
        <path d="M17 12h30v40l-5-4.5-5 4.5-5-4.5-5 4.5-5-4.5-5 4.5z" fill="none" stroke={fg} strokeWidth="6" {...cap} />
        <path d="M25 24h14M25 33h8" fill="none" stroke={fg} strokeWidth="6" {...cap} />
      </>
    ),
  },
  {
    id: "receipt-solid",
    name: "Receipt, solid",
    idea: "A receipt filled in, two entries cut out, a bold total. Reads at 16px, works as an app icon.",
    ink: { x0: 14, y0: 6, x1: 50, y1: 56 },
    lockup: { ratio: 1.04, align: "center", dy: 0.01 },
    draw: ({ fg, detail }) => (
      <>
        <path d="M14 11a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v45l-6-5-6 5-6-5-6 5-6-5-6 5z" fill={fg} />
        <path d="M23 20h18M23 29h11" fill="none" stroke={detail} strokeWidth="4.5" {...cap} />
        <path d="M23 40h18" fill="none" stroke={detail} strokeWidth="6" {...cap} />
      </>
    ),
  },
  {
    id: "bubble-period",
    name: "Bubble, full stop",
    idea: "A message with nothing in it but a period. Said. Done.",
    ink: { x0: 9, y0: 10, x1: 55, y1: 54 },
    lockup: { ratio: 1.02, align: "center", dy: 0 },
    draw: ({ fg }) => (
      <>
        <path d="M22 13h20a10 10 0 0 1 10 10v10a10 10 0 0 1-10 10H28l-9 8v-8.4A10 10 0 0 1 12 33V23a10 10 0 0 1 10-10z" fill="none" stroke={fg} strokeWidth="6" {...cap} />
        <circle cx="32" cy="28.5" r="5.2" fill={fg} />
      </>
    ),
  },
];

export type Tile = "none" | "ink" | "lime";

export function colorsFor(tile: Tile, onDark = false): { tile: string; fg: string; detail: string } {
  if (tile === "ink") return { tile: "var(--ink)", fg: "var(--lime)", detail: "var(--ink)" };
  if (tile === "lime") return { tile: "var(--lime)", fg: "var(--ink)", detail: "var(--lime)" };
  return onDark ? { tile: "none", fg: "var(--lime)", detail: "var(--ink)" } : { tile: "none", fg: "currentColor", detail: "var(--paper)" };
}

export function MarkTile({
  mark,
  size = 40,
  tile = "none",
  onDark = false,
  title = "Molit",
  className,
}: {
  mark: MarkDef;
  size?: number;
  tile?: Tile;
  onDark?: boolean;
  title?: string;
  className?: string;
}) {
  const c = colorsFor(tile, onDark);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title} className={className} style={{ flexShrink: 0, display: "block" }}>
      {tile !== "none" && <rect width="64" height="64" rx="16" fill={c.tile} />}
      {mark.draw({ fg: c.fg, detail: c.detail })}
    </svg>
  );
}

export function markById(id: string): MarkDef {
  return MARKS.find((m) => m.id === id) ?? MARKS[0];
}

/** Mirror of logo.tsx BRAND_MARK_ID for client components that must not import server-only modules. */
export const BRAND_MARK_ID_FALLBACK = "receipt-solid";
