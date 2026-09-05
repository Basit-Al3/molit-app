import Link from "next/link";
import { ChatDemo } from "@/components/chat-demo";
import { DashboardPreview } from "@/components/dashboard-preview";
import { Receipt } from "@/components/receipt";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { waLink } from "@/lib/wa-link";

/** The skeptics. Every one of these is a real thing people say. */
const OBJECTIONS: { q: string; a: string }[] = [
  {
    q: "bro this is just a notes app with extra steps",
    a: "It's a notes app with fewer steps. WhatsApp is already open. Notes has never been open at the exact moment you paid for something. That's the whole trick.",
  },
  {
    q: "my bank app already shows me this??",
    a: "Your bank shows \"POS 4471 KHI\". It doesn't show the Rs 350 cash chai, the bill you split, or what that Rs 4,200 actually was. And be honest: when did you last open it to look?",
  },
  {
    q: "why not excel or a proper budgeting app",
    a: "You've downloaded three. What did you spend last Tuesday? Exactly. Those apps die because setting them up is homework. This one is a text.",
  },
  {
    q: "it doesn't even do budgets lol",
    a: "Correct. A budget without a baseline is a wish. First you learn the number. Budgets are a later chapter, if there is one.",
  },
  {
    q: "what if I forget to text it",
    a: "Then that expense doesn't exist and your total is a lie. Same as every other method. Ours takes four seconds, so you'll forget less.",
  },
  {
    q: "this is too simple to be a real thing",
    a: "Today, yes. That's what starting looks like. It's a small idea. It's going to get bigger. It's not going to get dishonest.",
  },
  {
    q: "you're gonna sell my data",
    a: "It's \"chai 80\". Nobody is buying that. And if this ever costs money, you'll hear it from us before you see it on a card.",
  },
  {
    q: "AI could do this better",
    a: "AI reads your message when you write a sentence. There's no AI \"insight\" layer, because \"you spend a lot on food\" isn't insight. It's a number you already saw.",
  },
];

const EXAMPLES = [
  "chai 80",
  "uber 600, lunch 900",
  "rent 25,000",
  "dinner 1200 yesterday",
  "$4.50 latte",
  "petrol 3000",
  "netflix 1100 #bills",
  "gave mom 5k",
  "2 samosas 60",
  "k-electric 9,200",
  "month",
  "undo",
  "paid 450 for careem",
  "groceries 4.2k",
];

const COMPARE = {
  cols: ["Notes app", "Bank app", "Budget apps", "Molit"],
  rows: [
    ["Setup", "None", "Log in, again", "An evening", "Say hi"],
    ["Logging a cash chai", "Open, type, forget", "Impossible", "Six taps, a category", "chai 80"],
    ["What it shows", "A list, no total", "\u201cPOS 4471 KHI\u201d", "Dashboards, forecasts, nags", "The number"],
    ["Monthly total", "Do the maths", "Buried", "If you set it up", "Sent to you on the 1st"],
    ["Did you keep doing it?", "No", "Never started", "Three weeks", "It's a text"],
  ],
};

const WHO: [string, string, string][] = [
  ["Students", "Cash, split bills, and a stipend that vanishes by the 20th. Nobody ever showed you where.", "canteen 150"],
  ["Freelancers", "Money arrives in lumps and leaves in drips. The drips are the problem.", "adobe 6,200 #bills"],
  ["Anyone paid in cash", "Your bank app has no idea. Neither do you. This fixes the second part.", "sabzi 480"],
  ["The chronically \u201cI'll start Monday\u201d", "You've downloaded three apps. This one you already have installed.", "ok fine. chai 80"],
];

const REFUSALS: [string, string][] = [
  ["Connect to your bank.", "We don't want your password. You shouldn't want to give it out."],
  ["Set budgets.", "You'd ignore them. We'd nag. Nobody wins."],
  ["Give investment advice.", "We track what you spent. Nothing more."],
  ["Gamify it.", "No streaks, no badges, no confetti. Your money isn't a game."],
  ["Call itself an AI finance assistant.", "It's a note and a number. You can do the maths."],
  ["Charge you quietly.", "Free for now. If that changes, you'll be told first."],
];

const FAQ: [string, string][] = [
  ["Is it free?", "Yes, for now. When it starts costing us real money, we'll tell you before we charge you a rupee."],
  ["Can I delete everything?", "Text \"delete everything\". We ask once to be sure, then it's gone."],
  ["Does it understand \"paid two hundred for lunch\"?", "Mostly. Plain \"lunch 200\" always works. Full sentences usually do. If it's unsure, it asks instead of guessing."],
  ["Which currencies?", "Whatever your number's country uses, by default. Text \"currency USD\" to change it, or write \"$4.50\" in the message."],
  ["Is there an app to install?", "No. WhatsApp is the app. The dashboard is a website you get a link to when you text \"login\"."],
];

export default function Landing() {
  return (
    <main className="overflow-x-clip">
      <SiteNav />

      {/* ------------------------------------------------ Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-20 pb-20 grid gap-12 lg:grid-cols-[1.15fr_1fr] items-center">
        <div>
          <h1 className="display text-[2.8rem] sm:text-6xl lg:text-[4.6rem] rise d1">
            You could track your spending in Notes.
            <br />
            <span className="hl mt-2">You haven&apos;t.</span>
          </h1>
          <p className="mt-7 text-lg sm:text-xl text-ink-2 max-w-md leading-snug rise d2">
            Molit is a WhatsApp number. Text it what you spent. On the 1st it tells you the total. That&apos;s it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 rise d3">
            <a className="btn btn-ink" href={waLink("hi")} target="_blank" rel="noreferrer">
              Start on WhatsApp <span aria-hidden>→</span>
            </a>
            <Link className="text-sm font-medium underline underline-offset-4 decoration-line hover:decoration-ink" href="/login">
              I already use it
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted rise d4">Free. No app, no account, no card.</p>
        </div>
        <div className="rise d2 relative w-full max-w-md lg:justify-self-end min-h-[620px] flex items-center justify-center">
          {/* soft lime glow */}
          <div className="absolute inset-x-6 top-10 bottom-10 rounded-[48px] bg-lime/60 blur-2xl" aria-hidden />
          {/* the receipt, peeking out behind the phone */}
          <div className="absolute -right-4 lg:-right-10 top-1/2 -translate-y-[38%] w-[230px] hidden sm:block" style={{ transform: "rotate(7deg)" }} aria-hidden>
            <Receipt compact />
          </div>
          <div className="relative">
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ What people actually text */}
      <section className="border-y border-line bg-paper-2/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center gap-6">
          <span className="eyebrow shrink-0 hidden sm:block">Things people text it</span>
          <div className="marquee flex-1 overflow-hidden">
            <div className="marquee-track gap-3">
              {[0, 1].map((k) => (
                <span key={k} className="flex gap-3">
                  {EXAMPLES.map((t) => (
                    <span key={t} className="bubble-you px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap">
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Objections */}
      <section id="why" className="bg-ink text-paper dotgrid-dark">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-10 self-start">
            <div className="eyebrow text-lime/70">The group chat</div>
            <h2 className="display text-5xl sm:text-6xl lg:text-7xl mt-4">
              Why this simple <span className="text-lime">f***ing</span> app?
            </h2>
            <p className="mt-6 text-paper/70 text-lg leading-snug max-w-md">
              Fair question. We get it a lot. Here&apos;s every version of it we&apos;ve heard, and the honest answer to each.
            </p>
            <a className="btn btn-lime mt-8" href={waLink("hi")} target="_blank" rel="noreferrer">
              Fine, I&apos;ll try it <span aria-hidden>→</span>
            </a>
          </div>
          <ol className="space-y-7">
            {OBJECTIONS.map((o, i) => (
              <li key={o.q} className="space-y-2.5">
                <div className="flex justify-end">
                  <div className="bubble-you max-w-[88%] px-4 py-3 text-[15px] leading-snug font-medium" style={{ transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)` }}>
                    {o.q}
                  </div>
                </div>
                <div className="flex justify-start items-end gap-2">
                  <span className="w-7 h-7 rounded-full bg-lime text-ink grid place-items-center text-[11px] font-bold shrink-0" aria-hidden>
                    m.
                  </span>
                  <div className="max-w-[88%] px-4 py-3 text-[15px] leading-snug rounded-[18px] rounded-bl-md border border-paper/20 text-paper/90">{o.a}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ Comparison */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="eyebrow">Honest comparison</div>
        <h2 className="display-md text-4xl sm:text-6xl mt-4 max-w-3xl">Every way you&apos;ve tried this. Rated by whether you kept doing it.</h2>
        <div className="mt-12 overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] text-[15px] border-collapse">
            <thead>
              <tr className="text-left">
                <th className="py-3 pr-4 font-medium text-muted w-[34%]"></th>
                {COMPARE.cols.map((c, i) => (
                  <th key={c} className={`py-3 px-3 font-semibold ${i === COMPARE.cols.length - 1 ? "bg-lime rounded-t-2xl text-ink" : "text-ink-2"}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.rows.map(([label, ...cells]) => (
                <tr key={label} className="border-t border-line">
                  <td className="py-3.5 pr-4 font-medium">{label}</td>
                  {cells.map((v, i) => (
                    <td key={i} className={`py-3.5 px-3 text-ink-2 ${i === cells.length - 1 ? "bg-lime/70 font-medium text-ink" : ""}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-sm text-muted">We left out the row where Molit loses: charts, forecasts, and bank sync. It loses on purpose.</p>
      </section>

      {/* ------------------------------------------------ Who it's for */}
      <section className="bg-paper-2/60 border-y border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
          <div className="eyebrow">Who it&apos;s for</div>
          <h2 className="display-md text-4xl sm:text-6xl mt-4 max-w-3xl">People who have never once known the number.</h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHO.map(([t, d, ex]) => (
              <li key={t} className="card-soft p-6 flex flex-col">
                <h3 className="text-xl font-semibold tracking-tight leading-tight">{t}</h3>
                <p className="mt-3 text-ink-2 leading-snug text-[15px] flex-1">{d}</p>
                <span className="mt-5 self-start bubble-you px-3 py-1.5 text-[12.5px] font-medium">{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ How it works */}
      <section id="how" className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="eyebrow">How it works</div>
        <h2 className="display-md text-4xl sm:text-6xl mt-4 max-w-3xl">Three steps. The third one is on us.</h2>
        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            ["1", "Save the number.", "Or tap the button. WhatsApp opens. Say hi. Molit says hi back and explains itself in four lines."],
            ["2", "Text what you spent.", "“chai 80” is enough. “uber 600, lunch 900” logs two. “dinner 1200 yesterday” does what it says. Four seconds, tops."],
            ["3", "On the 1st, we tell you the truth.", "One message: what you spent, per day, where it went, how it compares to last month. Then silence until you text again."],
          ].map(([n, t, d], i) => (
            <li key={n} className="card-soft p-6 sm:p-7 relative" style={{ transform: `rotate(${i === 1 ? 0.8 : i === 2 ? -0.5 : -0.8}deg)` }}>
              <span className="absolute -top-4 -left-3 w-12 h-12 rounded-full bg-lime border-[1.5px] border-ink grid place-items-center num text-xl font-semibold shadow-[3px_3px_0_0_var(--ink)]">
                {n}
              </span>
              <h3 className="mt-5 text-2xl font-bold tracking-tight leading-tight">{t}</h3>
              <p className="mt-3 text-ink-2 leading-snug">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------ The 1st */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
        <div>
          <div className="eyebrow">The 1st of the month</div>
          <h2 className="display-md text-4xl sm:text-6xl mt-4">
            One message. <span className="scribble">The number.</span> Nothing to unpack.
          </h2>
          <p className="mt-6 text-ink-2 text-lg leading-snug max-w-lg">
            No PDF report. No &ldquo;your financial wellness score&rdquo;. No tips. A receipt for the month, written like a person would say it. What you do about it is
            your business.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-2">
            {["Per day, so you see the shape of the month", "By category, so you see where it went", "Against last month, so you see the trend", "Then it shuts up"].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="text-lime-deep font-bold">✓</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative max-w-sm w-full mx-auto lg:mx-0 lg:justify-self-end">
          <div style={{ transform: "rotate(1.5deg)" }}>
            <Receipt />
          </div>
          <span className="sticker sticker-lime absolute -top-4 -right-3" style={{ transform: "rotate(5deg)" }}>
            this is the whole product
          </span>
        </div>
      </section>

      {/* ------------------------------------------------ Dashboard */}
      <section className="bg-paper-2/60 border-y border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 grid gap-10 lg:grid-cols-[1fr_1.5fr] items-start">
          <div className="lg:sticky lg:top-8">
            <div className="eyebrow">The dashboard, if you want one</div>
            <h2 className="display-md text-4xl sm:text-5xl mt-4">Big number. Small bars. Nothing to configure.</h2>
            <p className="mt-6 text-ink-2 leading-snug">
              Text <span className="font-mono text-ink">login</span> and you get a link. Same data you texted, laid out so you can see a month. No goals, no projections, no
              &ldquo;you could save 12% by&hellip;&rdquo;. Just what happened.
            </p>
            <Link href="/login" className="btn btn-ghost mt-8">
              Open the dashboard
            </Link>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* ------------------------------------------------ Refusals */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="eyebrow">What Molit refuses to do</div>
        <h2 className="display-md text-4xl sm:text-6xl mt-4 max-w-3xl">Most finance apps are busy. Busy is how they hide the number.</h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REFUSALS.map(([t, d], i) => (
            <li key={t} className="card p-6 bg-paper" style={{ transform: `rotate(${[-0.6, 0.5, -0.4, 0.7, -0.5, 0.4][i]}deg)` }}>
              <span className="num text-red text-2xl leading-none" aria-hidden>
                ✕
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight leading-tight">{t}</h3>
              <p className="mt-2 text-ink-2 leading-snug text-[15px]">{d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-20 max-w-3xl">
          <p className="display text-3xl sm:text-5xl leading-[1.02]">
            This is a small idea. <span className="hl">It&apos;s going to get bigger.</span> Right now it does one thing, and it does it every single day you send a message.
          </p>
          <p className="mt-8 text-ink-2 text-lg leading-snug">
            Financial literacy doesn&apos;t start with a course. It starts with knowing the number. Most people don&apos;t. Not because they can&apos;t, because nobody made
            writing it down this easy.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section id="honest" className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <div className="eyebrow">Honest FAQ</div>
          <h2 className="display-md text-4xl sm:text-5xl mt-4">The boring questions, also answered honestly.</h2>
        </div>
        <div className="rule-strong">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b border-line">
              <summary className="flex items-start justify-between gap-6 py-5 text-lg sm:text-xl font-semibold tracking-tight">
                <span>{q}</span>
                <span className="chev num text-2xl leading-none text-muted" aria-hidden>
                  +
                </span>
              </summary>
              <p className="pb-6 -mt-1 text-ink-2 leading-snug max-w-2xl">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Final CTA */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-8">
        <div className="card p-8 sm:p-14 bg-lime text-ink grid gap-8 md:grid-cols-[1.4fr_1fr] items-center shadow-[12px_12px_0_0_var(--ink)] relative">
          <span className="sticker absolute -top-4 left-8" style={{ transform: "rotate(-3deg)" }}>
            takes 4 seconds
          </span>
          <div>
            <h2 className="display text-4xl sm:text-6xl">Send one message. That&apos;s the sign-up.</h2>
            <p className="mt-5 text-ink/75 text-lg leading-snug max-w-lg">
              Type what you just spent. Molit remembers. On the 1st you&apos;ll know the number. Then decide what to do about it.
            </p>
          </div>
          <div className="flex md:justify-end">
            <a className="btn btn-ink text-lg px-8 py-5 wiggle" href={waLink("hi")} target="_blank" rel="noreferrer">
              Open WhatsApp <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
