/**
 * Client-side simulation of the bot for the landing page. Uses the real
 * parser and the real reply wording, with an in-memory running total
 * instead of the database. No network, no account.
 */
import { CATEGORY_LABEL, type Category } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import { parseMessage } from "@/lib/parser/parse";

export type DemoExpense = { note: string; amount: number; category: Category };
export type DemoState = { expenses: DemoExpense[]; currency: string; month: string };

export const initialDemoState: DemoState = {
  currency: "PKR",
  month: "September",
  expenses: [
    { note: "Chai", amount: 80, category: "food" },
    { note: "Careem", amount: 450, category: "transport" },
    { note: "Groceries", amount: 4200, category: "groceries" },
    { note: "Netflix", amount: 1100, category: "bills" },
    { note: "Biryani", amount: 650, category: "food" },
    { note: "Petrol", amount: 3000, category: "transport" },
    { note: "Pharmacy", amount: 780, category: "health" },
    { note: "Chai", amount: 80, category: "food" },
    { note: "Lunch", amount: 900, category: "food" },
    { note: "Jazz load", amount: 500, category: "bills" },
    { note: "Samosa", amount: 120, category: "food" },
    { note: "Bykea", amount: 250, category: "transport" },
    { note: "Coffee", amount: 350, category: "food" },
  ],
};

function soFar(s: DemoState) {
  const total = s.expenses.reduce((a, e) => a + e.amount, 0);
  return `${s.month} so far: ${formatMoney(total, s.currency)} · ${s.expenses.length} expense${s.expenses.length === 1 ? "" : "s"}`;
}

export function demoReply(text: string, state: DemoState): { reply: string; state: DemoState } {
  const parsed = parseMessage(text);
  const c = state.currency;

  if (parsed.kind === "expenses") {
    const added = parsed.expenses.map((e) => ({ note: e.note || "No note", amount: e.amount, category: e.category }));
    const next = { ...state, expenses: [...state.expenses, ...added] };
    if (added.length === 1) {
      const when = parsed.expenses[0].daysAgo === 1 ? " (yesterday)" : parsed.expenses[0].daysAgo > 1 ? ` (${parsed.expenses[0].daysAgo} days ago)` : "";
      return { reply: `Logged. ${added[0].note} · ${formatMoney(added[0].amount, c)}${when}\n${soFar(next)}`, state: next };
    }
    const sum = added.reduce((a, e) => a + e.amount, 0);
    return {
      reply: [`Logged ${added.length}:`, ...added.map((e) => `• ${e.note} · ${formatMoney(e.amount, c)}`), `Total ${formatMoney(sum, c)}.`, soFar(next)].join("\n"),
      state: next,
    };
  }

  if (parsed.kind === "command") {
    switch (parsed.command) {
      case "hello":
        return { reply: `Hi. Text me what you spend — "chai 80", "uber 600" — and I'll remember it. On the 1st I'll tell you the total.`, state };
      case "help":
        return { reply: `"coffee 250" logs one. "uber 600, lunch 900" logs two. "month" shows the total. "undo" removes the last. That's most of it.`, state };
      case "undo": {
        if (state.expenses.length === 0) return { reply: `Nothing to undo.`, state };
        const last = state.expenses[state.expenses.length - 1];
        const next = { ...state, expenses: state.expenses.slice(0, -1) };
        return { reply: `Removed: ${last.note} · ${formatMoney(last.amount, c)}\n${soFar(next)}`, state: next };
      }
      case "month":
      case "today":
      case "week":
      case "lastmonth": {
        const byCat = new Map<Category, number>();
        for (const e of state.expenses) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount);
        const total = state.expenses.reduce((a, e) => a + e.amount, 0);
        const lines = [`So far this month: ${formatMoney(total, c)} across ${state.expenses.length} expenses.`, ``];
        for (const [cat, amt] of [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)) {
          lines.push(`${CATEGORY_LABEL[cat]} — ${formatMoney(amt, c)} (${Math.round((amt / total) * 100)}%)`);
        }
        lines.push(``, `That's it.`);
        return { reply: lines.join("\n"), state };
      }
      case "list":
        return {
          reply: [`Last ${Math.min(5, state.expenses.length)}:`, ...state.expenses.slice(-5).reverse().map((e) => `• ${e.note} · ${formatMoney(e.amount, c)}`)].join("\n"),
          state,
        };
      case "login":
        return { reply: `Your dashboard link (valid 15 minutes, one use):\nmolit.app/auth/verify?t=…\n\nIt's just you and your numbers in there.`, state };
      case "currency":
        return { reply: `Currency set to ${parsed.arg}. New expenses will use it.`, state: { ...state, currency: parsed.arg ?? c } };
      case "delete_all":
        return { reply: `This deletes every expense you've ever sent me. Reply "YES DELETE" within 10 minutes to confirm.`, state };
      case "confirm_delete":
        return { reply: `Done. ${state.expenses.length} expenses gone. Clean slate.`, state: { ...state, expenses: [] } };
      case "summary_off":
        return { reply: `Okay. No monthly message. Text "summary on" to turn it back.`, state };
      case "summary_on":
        return { reply: `Monthly message is on. You'll hear from me on the 1st.`, state };
    }
  }

  return { reply: `I didn't catch an amount in that. Try "coffee 250" — a thing and a number.`, state };
}
