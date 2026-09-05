import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { BRAND_MARK_ID, Logo } from "@/components/logo";
import { MARKS, MarkTile } from "@/components/marks";

export const metadata: Metadata = { title: "Logo options" };

export default function LogoOptionsPage() {
  return (
    <main>
      <SiteNav />
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-12">
        <div className="eyebrow">Brand · logo options</div>
        <h1 className="display text-5xl sm:text-7xl mt-4 max-w-4xl">Seven marks. Bare, one weight.</h1>
        <p className="mt-6 text-lg text-ink-2 max-w-2xl leading-snug">
          No tiles this time. Every mark is one stroke weight, round joins, 45° turns, dots sized off the stroke, drawn on the same 64px grid with
          the same margins. Shown in the lockup on light and dark, then bare at 56 / 32 / 24 / 16px, then on tiles only as an app-icon option.
          Currently live:{" "}
          <span className="font-mono text-ink">{BRAND_MARK_ID}</span>.
        </p>
      </section>

      {/* ---- The rule ---- */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <div className="card p-6 sm:p-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
          <LockupDiagram />
          <div className="text-sm space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">How the lockup is aligned</h2>
            <p className="text-ink-2 leading-snug">
              The lockup is a single piece of geometry: the wordmark is converted to vector paths from the font file, and each mark declares
              its real drawn bounds. What gets aligned is ink against letters, never box against box.
            </p>
            <ol className="space-y-2 text-ink-2 list-decimal pl-5">
              <li>
                <span className="text-ink font-medium">Mark ink height</span> ≈ letter height (the &ldquo;M&rdquo;). Portrait marks get up
                to 4% more so they don&apos;t read small; the lowercase m sits at x-height.
              </li>
              <li>
                <span className="text-ink font-medium">Vertical position</span>: marks with a flat base sit on the baseline; symmetrical marks
                are centred between baseline and cap height. Never centred on the text box.
              </li>
              <li>
                <span className="text-ink font-medium">Gap</span> = half the letter height. Solid marks need more air than a line would.
              </li>
              <li>
                <span className="text-ink font-medium">Clear space</span> = one letter height on all four sides.
              </li>
              <li>
                <span className="text-ink font-medium">Minimum</span>: 16px mark alone, 20px wordmark height in the lockup.
              </li>
            </ol>
            <p className="text-muted text-xs leading-snug">
              Ratios: letter 0.71em · x-height 0.536em · gap 0.355em (Geist 700, read from the font file). Sources: Akrivi lockup grid, GOV.UK and Android
              brand rules, LogoDesign.net optical alignment.
            </p>
          </div>
        </div>
      </section>

      {/* ---- The options ---- */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        <ol className="grid gap-5 md:grid-cols-2">
          {MARKS.map((m, i) => (
            <li key={m.id} className={`card overflow-hidden ${m.id === BRAND_MARK_ID ? "ring-4 ring-lime" : ""}`}>
              <div className="flex items-center justify-between px-5 pt-4">
                <div className="flex items-baseline gap-3">
                  <span className="num text-muted text-sm">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-bold tracking-tight text-lg">{m.name}</h3>
                </div>
                <span className="font-mono text-xs text-muted">{m.id}</span>
              </div>
              <p className="px-5 pt-1 text-sm text-ink-2 leading-snug">{m.idea}</p>

              <div className="mt-4 grid grid-cols-2">
                <div className="p-6 grid place-items-center bg-paper border-t border-r border-line min-h-32">
                  <Logo size={40} id={m.id} />
                </div>
                <div className="p-6 grid place-items-center bg-ink text-paper border-t border-line min-h-32">
                  <Logo size={40} id={m.id} onDark />
                </div>
              </div>
              <div className="flex items-end justify-between gap-4 px-5 py-4 bg-paper-2/60 border-t border-line">
                <div className="flex items-end gap-4">
                  <MarkTile mark={m} size={56} />
                  <MarkTile mark={m} size={32} />
                  <MarkTile mark={m} size={24} />
                  <MarkTile mark={m} size={16} />
                </div>
                <div className="flex items-center gap-3">
                  <MarkTile mark={m} size={40} tile="ink" className="opacity-80" />
                  <MarkTile mark={m} size={40} tile="lime" className="opacity-80" />
                  <a href={`/brand/${m.id}-ink.svg`} download className="btn btn-ghost btn-sm">
                    svg
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-ink-2 max-w-2xl">
          To switch, change <span className="font-mono text-ink">BRAND_MARK_ID</span> in <span className="font-mono text-ink">src/components/logo.tsx</span>.
          Everything (nav, dashboard, favicon component, share image) follows. Back to the{" "}
          <Link className="underline" href="/brand">
            brand page
          </Link>
          .
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}

/** The rule, drawn: the real lockup with its guides switched on. */
function LockupDiagram() {
  return (
    <div className="overflow-x-auto py-10 pl-8">
      <Logo size={120} guides />
      <div className="mt-8 flex gap-5 text-[11px] font-mono text-red">
        <span>— ascender · x-height · baseline</span>
        <span>▭ mark ink box</span>
        <span className="text-lime-deep">▮ gap = ½ letter height</span>
      </div>
    </div>
  );
}
