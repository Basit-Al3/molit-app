import Link from "next/link";
import { Logo } from "./logo";
import { waLink } from "@/lib/wa-link";

export function SiteFooter() {
  return (
    <footer className="rule mt-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo size={24} />
          <p className="mt-4 text-sm text-ink-2 max-w-xs">
            Money literacy. Full stop.
            <br />
            A small idea from 2026 that intends to get bigger.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <div className="eyebrow mb-3">Product</div>
          <a className="block hover:underline" href={waLink("hi")} target="_blank" rel="noreferrer">
            Start on WhatsApp
          </a>
          <Link className="block hover:underline" href="/app">
            Dashboard
          </Link>
          <Link className="block hover:underline" href="/login">
            Sign in
          </Link>
        </div>
        <div className="text-sm space-y-2">
          <div className="eyebrow mb-3">Company</div>
          <Link className="block hover:underline" href="/brand">
            Brand
          </Link>
          <Link className="block hover:underline" href="/#honest">
            Honest FAQ
          </Link>
          <span className="block text-muted">© {new Date().getFullYear()} Molit</span>
        </div>
      </div>
    </footer>
  );
}
