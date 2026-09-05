/**
 * The bot. One inbound message -> one reply. All the "voice" lives here:
 * short, plain, honest. No emojis raining down, no exclamation marks.
 */
import { db, schema } from "@/lib/db";
import type { Expense, User } from "@/lib/db/schema";
import { CATEGORY_LABEL, type Category } from "@/lib/categories";
import { createLoginLink } from "@/lib/auth/magic-link";
import { deleteAllExpenses, insertExpenses, undoLast } from "@/lib/expenses/mutations";
import { byCategory, recent, totalsLast7Days, totalsToday } from "@/lib/expenses/queries";
import { formatMoney, isKnownCurrency } from "@/lib/money";
import { llmAvailable, parseWithClaude } from "@/lib/parser/llm";
import { parseMessage, type Command, type ParsedExpense } from "@/lib/parser/parse";
import { buildMonthlySummary, monthSoFarLine } from "@/lib/summary";
import { boundsForMonthKey, dayLabel, monthKey, previousMonthKey, todayIn } from "@/lib/time";
import { findOrCreateUser, updateUser } from "@/lib/users";
import { markRead, sendText } from "./client";
import { extractMessages, messageText, type WebhookPayload } from "./types";

const DELETE_WINDOW_MS = 10 * 60_000;

export async function handleWebhook(payload: WebhookPayload) {
  for (const { message, name } of extractMessages(payload)) {
    try {
      await handleOne(message.id, message.from, name, message.type, messageText(message));
    } catch (error) {
      console.error(`failed handling message ${message.id}`, error);
    }
  }
}

async function alreadyProcessed(waMessageId: string): Promise<boolean> {
  const inserted = await db()
    .insert(schema.processedMessages)
    .values({ waMessageId })
    .onConflictDoNothing()
    .returning({ id: schema.processedMessages.waMessageId });
  return inserted.length === 0;
}

async function handleOne(waMessageId: string, from: string, name: string | undefined, type: string, text: string | undefined) {
  if (await alreadyProcessed(waMessageId)) return;
  void markRead(waMessageId);

  const { user, isNew } = await findOrCreateUser(from, name);

  if (text === undefined) {
    await sendText(user.phone, `I only read text for now. Type what you spent, like "lunch 900".`);
    return;
  }

  const reply = await replyFor(user, isNew, text, waMessageId);
  if (reply) await sendText(user.phone, reply);
}

/** Exported for tests and the web "add expense" box; pure apart from DB access. */
export async function replyFor(user: User, isNew: boolean, text: string, waMessageId?: string): Promise<string> {
  const parsed = parseMessage(text);

  if (parsed.kind === "command") {
    return runCommand(user, parsed.command, parsed.arg, isNew);
  }

  if (parsed.kind === "expenses") {
    return logExpenses(user, parsed.expenses, text, waMessageId);
  }

  if (isNew) return welcome(user);

  if (llmAvailable()) {
    const viaClaude = await parseWithClaude(text);
    if (viaClaude && viaClaude.length > 0) return logExpenses(user, viaClaude, text, waMessageId);
  }

  return `I didn't catch an amount in that. Try "coffee 250" — a thing and a number. Text "help" for more.`;
}

function welcome(user: User): string {
  return [
    `Hi. I'm Molit.`,
    ``,
    `Text me what you spend — "chai 80", "uber 600", "rent 25,000" — and I'll remember it.`,
    `On the 1st of every month I'll tell you the total. That's the whole thing.`,
    ``,
    `Your currency is ${user.currency}. Text "currency USD" (or any code) to change it.`,
    `Text "help" any time.`,
  ].join("\n");
}

function help(): string {
  return [
    `Log an expense: "coffee 250" or "250 coffee". Several at once: "uber 600, lunch 900".`,
    `Yesterday's: "dinner 1200 yesterday". Force a category: "chai 80 #fun".`,
    ``,
    `today — what you spent today`,
    `week — last 7 days`,
    `month — this month, by category`,
    `last month — the previous month`,
    `list — your last 10`,
    `undo — delete the last one`,
    `login — link to your dashboard`,
    `currency XXX — change currency`,
    `stop / summary on — monthly message off / on`,
    `delete everything — wipe your data`,
  ].join("\n");
}

async function logExpenses(user: User, items: ParsedExpense[], rawText: string, waMessageId?: string): Promise<string> {
  const rows = await insertExpenses(user, items, { source: waMessageId ? "whatsapp" : "web", rawText, waMessageId });
  const key = monthKey(todayIn(user.timezone));
  const soFar = await monthSoFarLine(user, key);

  if (rows.length === 1) {
    const e = rows[0];
    const when = e.localDate !== todayIn(user.timezone) ? ` (${dayLabel(String(e.localDate), user.timezone).toLowerCase()})` : "";
    return `Logged. ${line(e)}${when}\n${soFar}`;
  }
  const sum = rows.reduce((s, r) => s + Number(r.amount), 0);
  return [`Logged ${rows.length}:`, ...rows.map((e) => `• ${line(e)}`), `Total ${formatMoney(sum, user.currency)}.`, soFar].join("\n");
}

function line(e: Expense): string {
  return `${e.note} · ${formatMoney(Number(e.amount), e.currency)}`;
}

async function runCommand(user: User, command: Command, arg: string | undefined, isNew: boolean): Promise<string> {
  const today = todayIn(user.timezone);
  const thisMonth = monthKey(today);
  const c = user.currency;

  switch (command) {
    case "hello":
      return isNew ? welcome(user) : `Hi again. Text me what you spent, or "month" for the total so far.`;

    case "help":
      return help();

    case "undo": {
      const removed = await undoLast(user.id);
      if (!removed) return `Nothing to undo.`;
      return `Removed: ${line(removed)}\n${await monthSoFarLine(user, thisMonth)}`;
    }

    case "today": {
      const t = await totalsToday(user.id, user.timezone);
      if (t.count === 0) return `Nothing logged today. Yet.`;
      return `Today: ${formatMoney(t.total, c)} across ${t.count} expense${t.count === 1 ? "" : "s"}.`;
    }

    case "week": {
      const t = await totalsLast7Days(user.id, user.timezone);
      if (t.count === 0) return `Nothing logged in the last 7 days.`;
      return `Last 7 days: ${formatMoney(t.total, c)} across ${t.count} expense${t.count === 1 ? "" : "s"}. About ${formatMoney(t.total / 7, c)} a day.`;
    }

    case "month":
      return monthReport(user, thisMonth, true);

    case "lastmonth":
      return (await buildMonthlySummary(user, previousMonthKey(thisMonth))).text;

    case "list": {
      const rows = await recent(user.id, 10);
      if (rows.length === 0) return `Nothing logged yet. Send me something like "chai 80".`;
      return [`Last ${rows.length}:`, ...rows.map((e) => `• ${dayLabel(String(e.localDate), user.timezone)} — ${line(e)}`)].join("\n");
    }

    case "login": {
      const url = await createLoginLink(user.id);
      return `Your dashboard link (valid 15 minutes, one use):\n${url}\n\nIt's just you and your numbers in there.`;
    }

    case "currency": {
      if (!arg || !isKnownCurrency(arg)) return `I don't know "${arg ?? ""}". Use a 3-letter code like PKR, INR, USD, AED, GBP.`;
      await updateUser(user.id, { currency: arg });
      return `Currency set to ${arg}. New expenses will use it.`;
    }

    case "delete_all":
      await updateUser(user.id, { pendingDeleteUntil: new Date(Date.now() + DELETE_WINDOW_MS) });
      return `This deletes every expense you've ever sent me. Reply "YES DELETE" within 10 minutes to confirm.`;

    case "confirm_delete": {
      const pending = user.pendingDeleteUntil && user.pendingDeleteUntil.getTime() > Date.now();
      if (!pending) return `No deletion pending. Text "delete everything" first if you mean it.`;
      const n = await deleteAllExpenses(user.id);
      await updateUser(user.id, { pendingDeleteUntil: null });
      return `Done. ${n} expense${n === 1 ? "" : "s"} gone. Clean slate.`;
    }

    case "summary_off":
      await updateUser(user.id, { monthlySummary: false });
      return `Okay. No monthly message. I'll still remember what you send. Text "summary on" to turn it back.`;

    case "summary_on":
      await updateUser(user.id, { monthlySummary: true });
      return `Monthly message is on. You'll hear from me on the 1st.`;
  }
}

async function monthReport(user: User, key: string, inProgress: boolean): Promise<string> {
  const { start, end } = boundsForMonthKey(key);
  const cats = await byCategory(user.id, start, end);
  const total = cats.reduce((s, x) => s + x.total, 0);
  const count = cats.reduce((s, x) => s + x.count, 0);
  if (count === 0) return `Nothing logged this month. Send me something like "chai 80".`;
  const lines = [
    `${inProgress ? "So far this month" : key}: ${formatMoney(total, user.currency)} across ${count} expense${count === 1 ? "" : "s"}.`,
    ``,
  ];
  for (const cat of cats.slice(0, 5)) {
    lines.push(`${CATEGORY_LABEL[cat.category as Category]} — ${formatMoney(cat.total, user.currency)} (${Math.round(cat.share * 100)}%)`);
  }
  lines.push(``, `That's it.`);
  return lines.join("\n");
}
