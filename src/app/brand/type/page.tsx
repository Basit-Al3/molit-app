import type { Metadata } from "next";
import Link from "next/link";
import {
  Albert_Sans,
  DM_Sans,
  Figtree,
  Geist,
  Hanken_Grotesk,
  Inter,
  Manrope,
  Onest,
  Plus_Jakarta_Sans,
  Schibsted_Grotesk,
} from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { TypeSpecimen } from "@/components/type-specimen";

export const metadata: Metadata = { title: "Type options" };

const geist = Geist({ subsets: ["latin"], weight: "variable" });
const inter = Inter({ subsets: ["latin"], weight: "variable" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: "variable" });
const manrope = Manrope({ subsets: ["latin"], weight: "variable" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: "variable" });
const onest = Onest({ subsets: ["latin"], weight: "variable" });
const figtree = Figtree({ subsets: ["latin"], weight: "variable" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: "variable" });
const schibsted = Schibsted_Grotesk({ subsets: ["latin"], weight: "variable" });
const albert = Albert_Sans({ subsets: ["latin"], weight: "variable" });

const CANDIDATES = [
  { name: "Geist", font: geist, note: "Live. Vercel's neutral grotesk. Closest free cousin to Lovable's Camera Plain, with real weight at 700+.", live: true },
  { name: "Inter", font: inter, note: "The default of the modern web. Invisible in a good way; a little anonymous." },
  { name: "Plus Jakarta Sans", font: jakarta, note: "Geometric with soft corners. Friendly, very popular with startups, slightly rounder ‘m’." },
  { name: "Manrope", font: manrope, note: "Cool, slightly wide, tight apertures. Reads modern and calm at heavy weights." },
  { name: "DM Sans", font: dmSans, note: "Low contrast geometric. Warm, compact, good tabular numbers." },
  { name: "Onest", font: onest, note: "Quiet humanist grotesk. Excellent body text, understated headlines." },
  { name: "Figtree", font: figtree, note: "Rounded and cheerful. The most ‘friendly app’ of the set." },
  { name: "Hanken Grotesk", font: hanken, note: "A classic grotesk feel with generous x-height. Confident, a touch editorial." },
  { name: "Schibsted Grotesk", font: schibsted, note: "Newspaper-born grotesk. Sturdy, honest, unfussy." },
  { name: "Albert Sans", font: albert, note: "Scandinavian geometric. Crisp, slightly narrow, very clean at 700." },
];

export default function TypeOptionsPage() {
  return (
    <main>
      <SiteNav />
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-12">
        <div className="eyebrow">Brand · type options</div>
        <h1 className="display text-5xl sm:text-7xl mt-4 max-w-4xl">Ten faces. Same words.</h1>
        <p className="mt-6 text-lg text-ink-2 max-w-2xl leading-snug">
          Each card shows the lockup (mark aligned to that font&apos;s own measured letters), the hero line at 700, body copy at 400, and a number at 600.
          Pick one; the whole site and the vector wordmark get rebuilt in it.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 grid gap-5 lg:grid-cols-2">
        {CANDIDATES.map((c) => (
          <TypeSpecimen key={c.name} name={c.name} note={c.note} className={c.font.className} live={c.live} />
        ))}
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 text-sm text-ink-2">
        Back to the{" "}
        <Link className="underline" href="/brand">
          brand page
        </Link>{" "}
        or the{" "}
        <Link className="underline" href="/brand/logos">
          mark options
        </Link>
        .
      </section>
      <SiteFooter />
    </main>
  );
}
