"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth/session";
import { deleteExpense, insertExpenses } from "@/lib/expenses/mutations";
import { isKnownCurrency } from "@/lib/money";
import { parseMessage } from "@/lib/parser/parse";
import { llmAvailable, parseWithClaude } from "@/lib/parser/llm";
import { isValidTimeZone } from "@/lib/time";
import { getUserById, updateUser } from "@/lib/users";

async function requireUser() {
  const id = await currentUserId();
  const user = id ? await getUserById(id) : null;
  if (!user) redirect("/login");
  return user;
}

export type AddState = { ok: boolean; message: string } | null;

/** Same parser as WhatsApp, so the web box teaches the WhatsApp syntax. */
export async function addExpenseAction(_prev: AddState, formData: FormData): Promise<AddState> {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { ok: false, message: "Type something like “coffee 250”." };

  const parsed = parseMessage(text);
  let items = parsed.kind === "expenses" ? parsed.expenses : [];
  if (items.length === 0 && parsed.kind === "unknown" && llmAvailable()) {
    items = (await parseWithClaude(text)) ?? [];
  }
  if (items.length === 0) {
    return { ok: false, message: "I didn’t catch an amount in that. A thing and a number: “chai 80”." };
  }
  const rows = await insertExpenses(user, items, { source: "web", rawText: text });
  revalidatePath("/app");
  return { ok: true, message: rows.length === 1 ? `Logged ${rows[0].note}.` : `Logged ${rows.length}.` };
}

export async function deleteExpenseAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (id) await deleteExpense(user.id, id);
  revalidatePath("/app");
}

export type SettingsState = { ok: boolean; message: string } | null;

export async function updateSettingsAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60) || null;
  const currency = String(formData.get("currency") ?? "").trim().toUpperCase();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const monthlySummary = formData.get("monthlySummary") === "on";

  if (!isKnownCurrency(currency)) return { ok: false, message: `“${currency}” isn’t a currency I know.` };
  if (!isValidTimeZone(timezone)) return { ok: false, message: `“${timezone}” isn’t a valid timezone.` };

  await updateUser(user.id, { name, currency, timezone, monthlySummary });
  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true, message: "Saved." };
}
