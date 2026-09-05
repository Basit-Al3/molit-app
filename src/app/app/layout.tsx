import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { currentUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/users";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const id = await currentUserId();
  const user = id ? await getUserById(id) : null;
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
        <Link href="/app" aria-label="Dashboard">
          <Logo size={24} />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link href="/app" className="px-3 py-2 rounded-full hover:bg-paper-2">
            This month
          </Link>
          <Link href="/app/settings" className="px-3 py-2 rounded-full hover:bg-paper-2">
            Settings
          </Link>
          <span className="hidden sm:inline font-mono text-xs text-muted px-3">+{user.phone}</span>
          <form action="/logout" method="post">
            <button className="btn btn-ghost btn-sm" type="submit">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-24">{children}</main>
    </div>
  );
}
