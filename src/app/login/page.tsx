import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { env } from "@/lib/env";
import { displayNumber, waLink } from "@/lib/wa-link";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-5 sm:px-8 py-6">
        <Link href="/" aria-label="Molit home">
          <Logo size={26} />
        </Link>
      </header>
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl w-full mx-auto px-5 sm:px-8 pb-20 grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <div className="eyebrow rise d1">Sign in</div>
            <h1 className="display text-5xl sm:text-7xl mt-4 rise d2">
              Signing in happens
              <br />
              <span className="hl">on WhatsApp.</span>
            </h1>
            <p className="mt-7 text-lg text-ink-2 max-w-lg leading-snug rise d3">
              Text <span className="font-mono text-ink">login</span> to Molit. You get a link back. Tap it. No password, no email, no
              &ldquo;create account&rdquo;.
            </p>
            {error === "expired" && (
              <p className="mt-5 text-sm text-red font-medium rise d3">That link has expired or was already used. Text &ldquo;login&rdquo; again for a fresh one.</p>
            )}
            {error === "missing" && <p className="mt-5 text-sm text-red font-medium rise d3">That link was missing its token. Text &ldquo;login&rdquo; for a new one.</p>}
            <div className="mt-8 flex flex-wrap gap-3 rise d4">
              <a className="btn btn-ink" href={waLink("login")} target="_blank" rel="noreferrer">
                Text &ldquo;login&rdquo; to Molit <span aria-hidden>→</span>
              </a>
            </div>
            <p className="mt-5 text-sm text-muted rise d5">
              Or send <span className="font-mono">login</span> to {displayNumber()} from your phone. Links last 15 minutes and work once.
            </p>
          </div>
          <div className="card p-6 bg-paper shadow-[12px_12px_0_0_var(--ink)] rise d3 max-w-sm w-full lg:justify-self-end">
            <div className="eyebrow">What you&apos;ll see</div>
            <div className="mt-4 space-y-2.5 text-[13.5px]">
              <div className="flex justify-end">
                <div className="bg-lime rounded-2xl rounded-br-md px-3.5 py-2.5">login</div>
              </div>
              <div className="flex">
                <div className="bg-ink text-paper rounded-2xl rounded-bl-md px-3.5 py-2.5 whitespace-pre-line">
                  {"Your dashboard link (valid 15 minutes, one use):\n"}
                  <span className="underline decoration-lime underline-offset-2 break-all">{env.appUrl}/auth/verify?t=…</span>
                  {"\n\nIt's just you and your numbers in there."}
                </div>
              </div>
            </div>
            {env.isDev && (
              <form action="/api/dev/login" method="get" className="mt-6 rule pt-5">
                <div className="eyebrow mb-2">Dev only · sign in by phone</div>
                <div className="flex gap-2">
                  <input className="field font-mono" name="phone" placeholder="923001234567" defaultValue="923001234567" />
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Go
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
