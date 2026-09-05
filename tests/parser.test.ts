import { describe, expect, it } from "vitest";
import { parseMessage } from "@/lib/parser/parse";
import { categorise } from "@/lib/categories";
import { formatMoney, inferLocale } from "@/lib/money";
import { addDays, monthBounds, previousMonthKey } from "@/lib/time";

function expenses(text: string) {
  const r = parseMessage(text);
  if (r.kind !== "expenses") throw new Error(`expected expenses, got ${r.kind} for "${text}"`);
  return r.expenses;
}

describe("parseMessage — expenses", () => {
  it("note then amount", () => {
    const [e] = expenses("coffee 250");
    expect(e.amount).toBe(250);
    expect(e.note).toBe("Coffee");
    expect(e.category).toBe("food");
    expect(e.currency).toBeUndefined();
  });

  it("amount then note", () => {
    const [e] = expenses("250 coffee");
    expect(e).toMatchObject({ amount: 250, note: "Coffee" });
  });

  it("sentence form", () => {
    const [e] = expenses("spent 1200 on groceries");
    expect(e).toMatchObject({ amount: 1200, note: "Groceries", category: "groceries" });
  });

  it("I paid ... for ...", () => {
    const [e] = expenses("I paid 3500 for the electricity bill today");
    expect(e).toMatchObject({ amount: 3500, note: "Electricity bill", category: "bills" });
  });

  it("Rs prefix keeps user's default currency", () => {
    const [e] = expenses("Rs 350 chai");
    expect(e).toMatchObject({ amount: 350, note: "Chai", currency: undefined });
  });

  it("explicit currency symbols", () => {
    expect(expenses("$4.50 latte")[0]).toMatchObject({ amount: 4.5, currency: "USD", note: "Latte" });
    expect(expenses("₹300 auto")[0]).toMatchObject({ amount: 300, currency: "INR", category: "transport" });
    expect(expenses("lunch 45 aed")[0]).toMatchObject({ amount: 45, currency: "AED" });
    expect(expenses("20 quid pub")[0]).toMatchObject({ amount: 20, currency: "GBP" });
  });

  it("k suffix and thousands separators", () => {
    expect(expenses("1.5k shoes")[0]).toMatchObject({ amount: 1500, note: "Shoes", category: "shopping" });
    expect(expenses("2,500 rent")[0]).toMatchObject({ amount: 2500, category: "bills" });
    expect(expenses("rent 25,000")[0]).toMatchObject({ amount: 25000 });
  });

  it("multiple expenses separated by commas / and / newlines", () => {
    const list = expenses("uber 600, lunch 900");
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ amount: 600, note: "Uber", category: "transport" });
    expect(list[1]).toMatchObject({ amount: 900, note: "Lunch", category: "food" });

    expect(expenses("chai 80 and samosa 40")).toHaveLength(2);
    expect(expenses("chai 80\nsamosa 40\nbus 50")).toHaveLength(3);
  });

  it("does not split a comma inside a note when the other side has no amount", () => {
    const list = expenses("fish, chips and mushy peas 900");
    expect(list).toHaveLength(1);
    expect(list[0].amount).toBe(900);
  });

  it("quantity vs price: picks the money-looking token", () => {
    expect(expenses("2 coffees 500")[0].amount).toBe(500);
    expect(expenses("500 for 2 coffees")[0].amount).toBe(500);
    expect(expenses("3 samosas rs 90")[0].amount).toBe(90);
  });

  it("ignores ordinal / time tokens", () => {
    expect(expenses("2nd coffee of the day 250")[0].amount).toBe(250);
    expect(expenses("10am chai 80")[0].amount).toBe(80);
  });

  it("hashtag category override", () => {
    const [e] = expenses("chai 80 #fun");
    expect(e.category).toBe("fun");
    expect(e.note).toBe("Chai");
  });

  it("yesterday", () => {
    const [e] = expenses("dinner 1200 yesterday");
    expect(e).toMatchObject({ amount: 1200, daysAgo: 1, note: "Dinner" });
  });

  it("amount only", () => {
    const [e] = expenses("500");
    expect(e).toMatchObject({ amount: 500, note: "", category: "other" });
  });
});

describe("parseMessage — commands", () => {
  it.each([
    ["hi", "hello"],
    ["Hello!", "hello"],
    ["help", "help"],
    ["undo", "undo"],
    ["today", "today"],
    ["week", "week"],
    ["month", "month"],
    ["Summary", "month"],
    ["how much", "month"],
    ["last month", "lastmonth"],
    ["list", "list"],
    ["login", "login"],
    ["dashboard", "login"],
    ["delete everything", "delete_all"],
    ["YES DELETE", "confirm_delete"],
    ["stop", "summary_off"],
  ])('"%s" -> %s', (text, command) => {
    expect(parseMessage(text)).toMatchObject({ kind: "command", command });
  });

  it("currency command", () => {
    expect(parseMessage("currency usd")).toMatchObject({ kind: "command", command: "currency", arg: "USD" });
  });

  it("unknown", () => {
    expect(parseMessage("what's up")).toEqual({ kind: "unknown" });
    expect(parseMessage("")).toEqual({ kind: "unknown" });
  });
});

describe("categorise", () => {
  it.each([
    ["Careem to office", "transport"],
    ["K-Electric", "bills"],
    ["Imtiaz run", "groceries"],
    ["New sneakers", "shopping"],
    ["Dentist", "health"],
    ["Cinema tickets", "fun"],
    ["Something random", "other"],
  ])("%s -> %s", (text, cat) => {
    expect(categorise(text)).toBe(cat);
  });
});

describe("money", () => {
  it("formats", () => {
    expect(formatMoney(12450, "PKR")).toBe("Rs 12,450");
    expect(formatMoney(120000, "INR")).toBe("₹1,20,000");
    expect(formatMoney(4.5, "USD")).toBe("$4.50");
    expect(formatMoney(20, "GBP")).toBe("£20");
  });
  it("infers locale from phone", () => {
    expect(inferLocale("923001234567")).toEqual({ currency: "PKR", timezone: "Asia/Karachi" });
    expect(inferLocale("14155551234")).toEqual({ currency: "USD", timezone: "America/New_York" });
    expect(inferLocale("971501234567").currency).toBe("AED");
    expect(inferLocale("000").currency).toBe("USD");
  });
});

describe("time", () => {
  it("month bounds", () => {
    expect(monthBounds("2026-02-10")).toEqual({ start: "2026-02-01", end: "2026-02-28", days: 28 });
    expect(monthBounds("2028-02-10").end).toBe("2028-02-29");
  });
  it("addDays and previous month", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(previousMonthKey("2026-01")).toBe("2025-12");
  });
});
