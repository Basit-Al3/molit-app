import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS: [string, string][] = [
  [
    "What we collect",
    "Your WhatsApp phone number, the display name WhatsApp gives us, and the messages you send to Molit: the amount, the note, and when you sent it. If you sign into the dashboard, a cookie that keeps you signed in. That is the full list.",
  ],
  [
    "What we do with it",
    "Store it so we can add it up and show it back to you, on WhatsApp and on the dashboard. Send you one message on the 1st of the month with the total, unless you text “stop”. Nothing else.",
  ],
  [
    "What we don’t do",
    "We don’t sell your data. We don’t show you ads. We don’t connect to your bank. We don’t read anything you send to anyone other than Molit. We don’t share your number with anyone.",
  ],
  [
    "Who else touches it",
    "WhatsApp (Meta) carries the messages; their terms apply to the chat itself. Our database and servers are hosted by Supabase and Vercel. If you write a full sentence Molit can’t parse with its own rules, the text of that one message may be sent to Anthropic’s API to extract the amount, and is not stored by them for training.",
  ],
  [
    "Deleting everything",
    "Text “delete everything” to Molit. It asks once to be sure, then removes every expense you ever sent. Text “stop” to turn off the monthly message. To remove your account entirely, including your number, email hello@molit.io from any address and say which number.",
  ],
  [
    "Security",
    "Every webhook from WhatsApp is signature-checked. Dashboard login links work once and expire in 15 minutes. There are no passwords to leak because there are no passwords.",
  ],
  [
    "Changes",
    "If this policy changes in a way that matters, Molit will tell you on WhatsApp before it takes effect.",
  ],
];

export default function PrivacyPage() {
  return (
    <main>
      <SiteNav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-24">
        <div className="eyebrow">Privacy</div>
        <h1 className="display text-5xl sm:text-6xl mt-4">It&apos;s &ldquo;chai 80&rdquo;. Here&apos;s what happens to it.</h1>
        <p className="mt-6 text-lg text-ink-2 leading-snug">Effective 6 September 2026. Written to be read, not scrolled past.</p>
        <div className="mt-12 space-y-10">
          {SECTIONS.map(([h, p]) => (
            <section key={h}>
              <h2 className="text-2xl font-bold tracking-tight">{h}</h2>
              <p className="mt-3 text-ink-2 leading-relaxed">{p}</p>
            </section>
          ))}
        </div>
        <p className="mt-14 text-sm text-muted">Questions: hello@molit.io</p>
      </section>
      <SiteFooter />
    </main>
  );
}
