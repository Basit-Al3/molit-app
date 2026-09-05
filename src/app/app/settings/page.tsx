import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";
import { currentUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/users";
import { waLink } from "@/lib/wa-link";

export const metadata: Metadata = { title: "Settings" };

const CURRENCIES = ["PKR", "INR", "USD", "EUR", "GBP", "AED", "SAR", "QAR", "KWD", "BDT", "LKR", "NPR", "CAD", "AUD", "SGD", "MYR", "JPY", "TRY", "EGP", "NGN", "KES", "ZAR", "BRL", "MXN", "CHF", "SEK", "NOK", "DKK", "PLN", "IDR", "PHP", "CNY", "KRW", "NZD", "OMR", "BHD"];

export default async function SettingsPage() {
  const id = await currentUserId();
  const user = id ? await getUserById(id) : null;
  if (!user) redirect("/login");

  const timezones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];

  return (
    <div className="pt-6">
      <div className="eyebrow">Settings</div>
      <h1 className="display-md text-4xl sm:text-5xl mt-3">Four things. That&apos;s all there is to set.</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <SettingsForm
          name={user.name ?? ""}
          currency={user.currency}
          timezone={user.timezone}
          monthlySummary={user.monthlySummary}
          currencies={CURRENCIES.includes(user.currency) ? CURRENCIES : [user.currency, ...CURRENCIES]}
          timezones={timezones}
        />
        <aside className="space-y-8 text-sm">
          <div className="card-soft p-5">
            <div className="eyebrow mb-2">Your number</div>
            <div className="font-mono">+{user.phone}</div>
            <p className="text-muted mt-2">This is your account. There is no other login.</p>
          </div>
          <div className="card-soft p-5">
            <div className="eyebrow mb-2">Delete everything</div>
            <p className="text-ink-2">
              Text <span className="font-mono text-ink">delete everything</span> to Molit. We ask once to be sure. Then it&apos;s gone, and we mean gone.
            </p>
            <a className="btn btn-ghost btn-sm mt-4" href={waLink("delete everything")} target="_blank" rel="noreferrer">
              Do it on WhatsApp →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
