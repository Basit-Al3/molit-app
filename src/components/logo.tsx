import { MARKS, MarkTile, markById, type Tile } from "./marks";
import { WORDMARK } from "./wordmark-paths";

/** Change this one line to switch the brand mark. Options live in src/components/marks.tsx and /brand/logos. */
export const BRAND_MARK_ID = "receipt-solid";

/*
 * The lockup is one SVG. Everything is in the wordmark's own units
 * (1000 per em, ascender of "l" at y=0, baseline at y=710), so the mark's
 * drawn ink, not its bounding box, is measured against the letters:
 *
 *   mark ink height = ratio × letter height, centred on the letters or
 *                     sitting on the baseline (per mark)
 *   gap             = half the letter height (355)
 *   clear space     = one letter height (710) on every side
 */
export const LOCKUP = { letter: WORDMARK.capTop / 1000, xHeight: WORDMARK.xHeight / 1000, gap: WORDMARK.capTop / 2000 };

export type Palette = { mark: string; detail: string; word: string; dot: string; tile?: string };

export const PALETTE_LIGHT: Palette = { mark: "currentColor", detail: "var(--paper)", word: "currentColor", dot: "var(--lime-deep)" };
export const PALETTE_DARK: Palette = { mark: "var(--lime)", detail: "var(--ink)", word: "var(--paper)", dot: "var(--lime)" };

export function Mark({
  size = 40,
  tile = "none",
  onDark = false,
  className,
  title = "Molit",
  id = BRAND_MARK_ID,
}: {
  size?: number;
  tile?: Tile;
  onDark?: boolean;
  className?: string;
  title?: string;
  id?: string;
}) {
  return <MarkTile mark={markById(id)} size={size} tile={tile} onDark={onDark} className={className} title={title} />;
}

type LogoProps = {
  /** Wordmark font size in px (the lockup is 0.71× this tall). */
  size?: number;
  id?: string;
  onDark?: boolean;
  /** Draw the mark on a tile; the tile then counts as the ink. */
  tile?: Tile;
  palette?: Palette;
  /** Draw the alignment guides (ascender, x-height, baseline, ink box, gap). */
  guides?: boolean;
  className?: string;
  title?: string;
};

export function logoGeometry(id: string, tile: Tile = "none") {
  const mark = markById(id);
  const H = WORDMARK.capTop;
  const ink = tile === "none" ? mark.ink : { x0: 0, y0: 0, x1: 64, y1: 64 };
  const inkH = ink.y1 - ink.y0;
  const T = mark.lockup.ratio * H;
  const s = T / inkH;
  const W = (ink.x1 - ink.x0) * s;
  const tx = -ink.x0 * s;
  const ty = (mark.lockup.align === "baseline" ? H - ink.y1 * s : (H - T) / 2 - ink.y0 * s) + mark.lockup.dy * T;
  const gap = H / 2; // half a letter height: enough air for a solid mark
  const wordX = W + gap - WORDMARK.inkLeft;
  const total = W + gap + (WORDMARK.inkRight - WORDMARK.inkLeft);
  const inkTop = ty + ink.y0 * s;
  return { mark, H, ink, s, W, tx, ty, gap, wordX, total, T, inkTop };
}

/** Mark + "molit." as one piece of geometry. The period is part of the name. */
export function Logo({ size = 28, id = BRAND_MARK_ID, onDark = false, tile = "none", palette, guides = false, className = "", title = "Molit" }: LogoProps) {
  const pal = palette ?? (onDark ? PALETTE_DARK : PALETTE_LIGHT);
  const g = logoGeometry(id, tile);
  const tileFill = tile === "ink" ? "var(--ink)" : "var(--lime)";
  const markFg = tile === "ink" ? "var(--lime)" : tile === "lime" ? "var(--ink)" : pal.mark;
  const markDetail = tile === "ink" ? "var(--ink)" : tile === "lime" ? "var(--lime)" : pal.detail;
  const height = size * LOCKUP.letter;
  const width = (height * g.total) / g.H;
  const xh = g.H - WORDMARK.xHeight;
  const markCx = g.W / 2;
  return (
    <svg
      viewBox={`0 0 ${g.total} ${g.H}`}
      width={width}
      height={height}
      role="img"
      aria-label={title}
      className={className}
      style={{ overflow: "visible", display: "block", flexShrink: 0 }}
    >
      <g transform={`translate(${g.tx} ${g.ty}) scale(${g.s})`}>
        {tile !== "none" && <rect width="64" height="64" rx="16" fill={pal.tile ?? tileFill} />}
        {g.mark.draw({ fg: markFg, detail: markDetail })}
      </g>
      <g transform={`translate(${g.wordX} 0)`}>
        <path d={WORDMARK.word} fill={pal.word} />
        <path d={WORDMARK.dot} fill={pal.dot} />
      </g>
      {guides && (
        <g fill="none" stroke="var(--red)" strokeWidth="5" strokeDasharray="14 10" opacity="0.85">
          <line x1={-g.H * 0.3} x2={g.total + g.H * 0.3} y1="0" y2="0" />
          <line x1={-g.H * 0.3} x2={g.total + g.H * 0.3} y1={xh} y2={xh} />
          <line x1={-g.H * 0.3} x2={g.total + g.H * 0.3} y1={g.H} y2={g.H} />
          <rect x="0" y={g.inkTop} width={g.W} height={g.T} strokeDasharray="none" />
          <rect x={g.W} y="0" width={g.gap} height={g.H} fill="var(--lime)" stroke="none" opacity="0.7" />
          <line x1={markCx} x2={markCx} y1={-g.H * 0.15} y2={g.H * 1.15} strokeDasharray="6 8" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}

export { MARKS };
