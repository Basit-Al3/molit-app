import Link from "next/link";
import { Logo } from "./logo";

export function SiteNav({ cta = true }: { cta?: boolean }) {
  return (
    <header className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
      <Link href="/" aria-label="Molit home" className="hover:opacity-80 transition-opacity">
        <Logo size={26} />
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
        <Link href="/#why" className="px-3 py-2 rounded-full hover:bg-paper-2 hidden sm:inline-block">
          Why?
        </Link>
        <Link href="/#how" className="px-3 py-2 rounded-full hover:bg-paper-2 hidden sm:inline-block">
          How it works
        </Link>
        <Link href="/#honest" className="px-3 py-2 rounded-full hover:bg-paper-2 hidden sm:inline-block">
          Honest FAQ
        </Link>
        <Link href="/brand" className="px-3 py-2 rounded-full hover:bg-paper-2 hidden md:inline-block">
          Brand
        </Link>
        {cta && (
          <Link href="/app" className="btn btn-ghost btn-sm ml-2">
            Open dashboard
          </Link>
        )}
      </nav>
    </header>
  );
}
