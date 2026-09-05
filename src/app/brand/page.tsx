import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_MARK_ID, Logo, Mark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "Brand" };

const COLORS = [
  ["Paper", "#F3EFE6", "Background. Warm, not white. Everything sits on it."],
  ["Ink", "#101010", "Text, marks, bars. Near-black, never pure."],
  ["Lime", "#D8FF3D", "The highlighter. One accent. Used for emphasis, the mark tile, and the period."],
  ["Lime deep", "#B9E21A", "Lime on paper when it must be read as text or a hover state."],
  ["Red", "#E0442A", "Only for “you spent more”. Never decorative."],
  ["Muted", "#7A766C", "Eyebrows, hints, secondary labels."],
];

const VOICE: [string, string][] = [
  ["Say the number.", "“You spent Rs 48,200.” Not “Your spending this month was a bit above average.”"],
  ["Short sentences. Full stops.", "The period is the brand. Nothing trails off, nothing hedges."],
  ["Honest, not harsh.", "We tell the truth about the number, never judge the person. “That’s it.” not “Yikes.”"],
  ["No exclamation marks. No emoji rain.", "Enthusiasm is cheap. Accuracy isn’t."],
  ["Admit the obvious.", "“You could do this in Notes. You haven’t.” Saying the quiet part builds trust."],
  ["Small idea, said plainly.", "We don’t call ourselves a platform, an assistant, or a revolution. We’re a number and a note."],
];

export default function BrandPage() {
  return (
    <main>
      <SiteNav />
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-16">
        <div className="eyebrow">Brand</div>
        <h1 className="display text-5xl sm:text-7xl mt-4 max-w-4xl">One mark, two fonts, one highlighter. Then stop.</h1>
        <p className="mt-6 text-lg text-ink-2 max-w-2xl leading-snug">
          Molit is short for money literacy. The name is said <span className="font-mono text-ink">MO-lit</span>. The period at the end of the wordmark
          isn&apos;t decoration; it&apos;s the whole attitude. Say the number. Full stop.
        </p>
      </section>

      {/* Logo */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="eyebrow mb-4">Mark &amp; wordmark</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-10 sm:p-16 grid place-items-center bg-paper">
            <Logo size={64} />
          </div>
          <div className="card p-10 sm:p-16 grid place-items-center bg-ink text-paper">
            <Logo size={64} onDark />
          </div>
          <div className="card p-10 grid place-items-center bg-lime">
            <Mark size={120} />
          </div>
          <div className="card p-10 grid grid-cols-4 gap-6 place-items-center bg-paper-2">
            <Mark size={64} />
            <Mark size={48} tile="ink" />
            <Mark size={32} />
            <Mark size={16} />
          </div>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2 text-sm">
          <div>
            <h3 className="font-semibold text-base">What the mark is</h3>
            <p className="mt-2 text-ink-2 leading-snug">
              An M drawn as one line: down, up, then up further, ending on a dot. Money, a line going somewhere, and a full stop, in one stroke.
              No tile by default; the tile exists only for app icons.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-base">Rules</h3>
            <ul className="mt-2 text-ink-2 leading-snug space-y-1 list-disc pl-5">
              <li>Ink on paper. Lime on ink. Bare by default; the tile is for app icons only.</li>
              <li>Never rotate, outline, gradient, or shadow the mark.</li>
              <li>Lockup: mark = 1.15× the letter height, centred on the letters; gap = the width of the period; clear space = one letter height.</li>
              <li>Minimum size 16px. It survives as a favicon; that&apos;s the test.</li>
              <li>The wordmark is “Molit.” with a capital M, and always ends with a period.</li>
            </ul>
            <p className="mt-4">
              <Link href="/brand/logos" className="btn btn-lime btn-sm">
                See all 7 mark options →
              </Link>{" "}
              <Link href="/brand/type" className="btn btn-ghost btn-sm">
                Try 10 fonts →
              </Link>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[`${BRAND_MARK_ID}-ink`, `${BRAND_MARK_ID}-lime`, `${BRAND_MARK_ID}-tile-ink`, `${BRAND_MARK_ID}-tile-lime`].map((f) => (
                <a key={f} className="btn btn-ghost btn-sm" href={`/brand/${f}.svg`} download>
                  {f}.svg
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Color */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="eyebrow mb-4">Colour</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLORS.map(([name, hex, use]) => (
            <div key={name} className="card overflow-hidden">
              <div className="h-28" style={{ background: hex }} />
              <div className="p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{name}</span>
                  <span className="font-mono text-xs text-muted">{hex}</span>
                </div>
                <p className="text-sm text-ink-2 mt-1 leading-snug">{use}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-2 max-w-2xl">
          Charts use a single hue (ink) because the job is magnitude, not identity. Red appears in exactly one place: when this month is more than
          last month. If you want a second accent, you want a different brand.
        </p>
      </section>

      {/* Type */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="eyebrow mb-4">Type</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-8">
            <div className="eyebrow">Geist · display &amp; text</div>
            <p className="display text-6xl mt-4">Aa</p>
            <p className="display text-3xl mt-3">You haven&apos;t.</p>
            <p className="mt-4 text-ink-2">
              Bold at −4% tracking for headlines, regular for body. A neutral grotesk, a touch heavier than most. One family does everything,
              so the product never looks like it&apos;s trying.
            </p>
          </div>
          <div className="card p-8">
            <div className="eyebrow">Geist Mono · numbers</div>
            <p className="num text-6xl mt-4 font-semibold">Rs 48,200</p>
            <p className="num text-xl mt-3">2026-09-01 · 63 expenses</p>
            <p className="mt-4 text-ink-2">
              Every amount, date, and count is set in mono with tabular figures. Money is data; it should look like data. Also used for eyebrows
              and commands like <span className="font-mono text-ink">login</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Voice */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
          <div className="eyebrow text-lime/70 mb-4">Voice</div>
          <h2 className="display-md text-4xl sm:text-5xl max-w-3xl">Brutally honest is a tone, not an excuse.</h2>
          <ul className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {VOICE.map(([t, d]) => (
              <li key={t} className="border-t border-paper/15 pt-5">
                <h3 className="text-xl font-bold tracking-tight">{t}</h3>
                <p className="mt-2 text-paper/70 leading-snug">{d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-paper/15 p-6">
              <div className="eyebrow text-lime/70 mb-3">Do</div>
              <p className="whitespace-pre-line text-paper/90 text-[15px] leading-snug">
                {"September is over.\n\nYou spent Rs 48,200 across 63 expenses.\nThat's about Rs 1,607 a day.\n12% more than August.\n\nThat's it. That's the app."}
              </p>
            </div>
            <div className="rounded-2xl border border-paper/15 p-6">
              <div className="eyebrow text-red/80 mb-3">Don&apos;t</div>
              <p className="whitespace-pre-line text-paper/60 text-[15px] leading-snug line-through decoration-red/70">
                {"🎉 Great job this month!! 🎉\n\nYour spending journey is looking amazing 🚀 Here are some AI-powered insights to help you crush your goals 💪"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="eyebrow mb-4">Lines we use</div>
        <ul className="grid gap-3 md:grid-cols-2 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          <li className="rule pt-4">Money literacy. Full stop.</li>
          <li className="rule pt-4">You could do this in Notes. You haven&apos;t.</li>
          <li className="rule pt-4">Text it. Forget it. Know it on the 1st.</li>
          <li className="rule pt-4">Just the number.</li>
          <li className="rule pt-4">A small idea that intends to get bigger.</li>
          <li className="rule pt-4">That&apos;s it. That&apos;s the app.</li>
        </ul>
      </section>
      <SiteFooter />
    </main>
  );
}
