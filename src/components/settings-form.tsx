"use client";

import { useActionState } from "react";
import { updateSettingsAction, type SettingsState } from "@/app/app/actions";

type Props = { name: string; currency: string; timezone: string; monthlySummary: boolean; currencies: string[]; timezones: string[] };

export function SettingsForm({ name, currency, timezone, monthlySummary, currencies, timezones }: Props) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateSettingsAction, null);
  return (
    <form action={action} className="space-y-6 max-w-lg">
      <label className="block">
        <span className="eyebrow">Name</span>
        <input name="name" defaultValue={name} className="field mt-2" placeholder="Optional" maxLength={60} />
      </label>
      <label className="block">
        <span className="eyebrow">Currency</span>
        <select name="currency" defaultValue={currency} className="field mt-2 font-mono">
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="block mt-1.5 text-xs text-muted">New expenses use this unless you write a currency in the message.</span>
      </label>
      <label className="block">
        <span className="eyebrow">Timezone</span>
        <input name="timezone" defaultValue={timezone} className="field mt-2 font-mono" list="tz" />
        <datalist id="tz">
          {timezones.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <span className="block mt-1.5 text-xs text-muted">Decides when a day, and a month, ends for you.</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="monthlySummary" defaultChecked={monthlySummary} className="w-5 h-5 accent-[var(--ink)]" />
        <span>
          <span className="font-medium">Send me the monthly message on the 1st</span>
          <span className="block text-xs text-muted">This is the whole point. But it&apos;s your phone.</span>
        </span>
      </label>
      <div className="flex items-center gap-4">
        <button className="btn btn-ink" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        {state && (
          <span className={`text-sm ${state.ok ? "text-ink-2" : "text-red"}`} role="status">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
