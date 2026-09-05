/**
 * Rule-based parser for WhatsApp messages. Pure function — no I/O — so it is
 * trivially unit-testable and runs in microseconds. A Claude-powered fallback
 * (see ./llm.ts) only kicks in when these rules find nothing.
 *
 * Accepted shapes, in the wild:
 *   "coffee 250"        "250 coffee"        "spent 1200 on groceries"
 *   "Rs 350 chai"       "$4.50 latte"       "uber 600, lunch 900"
 *   "1.5k shoes"        "2,500 rent"        "chai 80 #fun"
 *   "dinner 1200 yesterday"
 */
import { categorise, isCategory, type Category } from "@/lib/categories";

export type Command =
  | "hello"
  | "help"
  | "undo"
  | "today"
  | "week"
  | "month"
  | "lastmonth"
  | "list"
  | "login"
  | "currency"
  | "delete_all"
  | "confirm_delete"
  | "summary_off"
  | "summary_on";

export type ParsedExpense = {
  amount: number;
  note: string;
  category: Category;
  /** ISO currency code if the message named one explicitly. */
  currency?: string;
  /** 0 = today, 1 = yesterday … */
  daysAgo: number;
};

export type ParseResult =
  | { kind: "command"; command: Command; arg?: string }
  | { kind: "expenses"; expenses: ParsedExpense[] }
  | { kind: "unknown" };

const COMMANDS: [RegExp, Command][] = [
  [/^(hi|hii+|hello|hey|yo|start|salam|assalam\s*o?\s*alaikum|aoa|hola|namaste)[.!]*$/i, "hello"],
  [/^(help|\?|commands?|menu|what can you do)[?.!]*$/i, "help"],
  [/^(undo|delete last|remove last|oops|cancel|wrong|mistake)[.!]*$/i, "undo"],
  [/^(today|day|aaj)[?.!]*$/i, "today"],
  [/^(week|this week|last 7 days|7 days)[?.!]*$/i, "week"],
  [/^(month|this month|summary|total|so far|how much|status|stats|balance)[?.!]*$/i, "month"],
  [/^(last month|previous month|prev month)[?.!]*$/i, "lastmonth"],
  [/^(list|last|recent|history|show|log)[?.!]*$/i, "list"],
  [/^(login|log in|sign in|signin|dashboard|link|web|site|website)[?.!]*$/i, "login"],
  [/^(delete everything|delete all|reset|wipe|clear all|start over)[?.!]*$/i, "delete_all"],
  [/^(yes,? delete|confirm delete|yes delete everything)[.!]*$/i, "confirm_delete"],
  [/^(stop|unsubscribe|no summary|summary off|mute)[.!]*$/i, "summary_off"],
  [/^(summary on|start summary|unmute|subscribe)[.!]*$/i, "summary_on"],
];

const CURRENCY_WORDS: Record<string, string | undefined> = {
  pkr: "PKR",
  inr: "INR",
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
  aed: "AED",
  sar: "SAR",
  qar: "QAR",
  kwd: "KWD",
  bdt: "BDT",
  lkr: "LKR",
  npr: "NPR",
  cad: "CAD",
  aud: "AUD",
  sgd: "SGD",
  myr: "MYR",
  jpy: "JPY",
  try: "TRY",
  egp: "EGP",
  ngn: "NGN",
  kes: "KES",
  zar: "ZAR",
  "₹": "INR",
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "৳": "BDT",
  "₦": "NGN",
  dollar: "USD",
  dollars: "USD",
  bucks: "USD",
  euro: "EUR",
  euros: "EUR",
  pound: "GBP",
  pounds: "GBP",
  quid: "GBP",
  dirham: "AED",
  dirhams: "AED",
  riyal: "SAR",
  riyals: "SAR",
  taka: "BDT",
  // "rs"/"rupees" are ambiguous (PKR/INR/LKR/NPR) — keep the user's default.
  rs: undefined,
  "rs.": undefined,
  rupee: undefined,
  rupees: undefined,
  rupay: undefined,
  rupaye: undefined,
};

const PRE = "pkr|inr|usd|eur|gbp|aed|sar|qar|kwd|bdt|lkr|npr|cad|aud|sgd|myr|jpy|try|egp|ngn|kes|zar|rs\\.?|₹|\\$|€|£|¥|৳|₦";
const POST =
  "pkr|inr|usd|eur|gbp|aed|sar|qar|kwd|bdt|lkr|npr|cad|aud|sgd|myr|jpy|try|egp|ngn|kes|zar|rs|rupees?|rupaye|rupay|dollars?|bucks|euros?|pounds?|quid|dirhams?|riyals?|taka|₹|\\$|€|£|¥|৳|₦";

/**
 * One regex, three optional parts: [currency] number[k|m] [currency].
 * The trailing lookahead stops "2nd", "10am", "3pm" and "2x" from being amounts.
 */
const AMOUNT_RE = new RegExp(
  `(?:(?<pre>${PRE})\\s?)?(?<![\\w.])(?<num>\\d{1,3}(?:,\\d{2,3})+|\\d+)(?:\\.(?<dec>\\d{1,2}))?(?:\\s?(?<mult>k|m)\\b)?(?:\\s?(?<post>${POST}))?(?![\\p{L}\\d])`,
  "giu",
);

type AmountHit = { start: number; end: number; value: number; currency?: string; explicit: boolean };

function findAmounts(text: string): AmountHit[] {
  const hits: AmountHit[] = [];
  for (const m of text.matchAll(AMOUNT_RE)) {
    const g = m.groups!;
    const whole = Number(g.num.replace(/,/g, ""));
    if (!Number.isFinite(whole)) continue;
    let value = whole + (g.dec ? Number(`0.${g.dec}`) : 0);
    if (g.mult?.toLowerCase() === "k") value *= 1_000;
    if (g.mult?.toLowerCase() === "m") value *= 1_000_000;
    const marker = (g.pre ?? g.post)?.toLowerCase();
    const currency = marker ? CURRENCY_WORDS[marker] : undefined;
    if (value <= 0) continue;
    hits.push({
      start: m.index!,
      end: m.index! + m[0].length,
      value,
      currency,
      explicit: Boolean(marker) || Boolean(g.mult) || Boolean(g.dec) || g.num.includes(","),
    });
  }
  return hits;
}

function pickAmount(hits: AmountHit[]): AmountHit | undefined {
  if (hits.length === 0) return undefined;
  if (hits.length === 1) return hits[0];
  // Prefer the token that looks most like money; otherwise the largest.
  const explicit = hits.filter((h) => h.explicit);
  const pool = explicit.length > 0 ? explicit : hits;
  return pool.reduce((a, b) => (b.value > a.value ? b : a));
}

const LEADING_FILLER =
  /^(?:i\s+)?(?:spent|paid|bought|got|purchased|ordered|gave|sent|spend|pay|buy|on|for|at|in|the|a|an|of|to|my|some|just|today|-|–|—|:|,|\.|and)\s+/i;
const TRAILING_FILLER =
  /\s+(?:on|for|at|in|the|today|now|just|and|-|–|—|:|,|\.)$/i;

function cleanNote(raw: string): string {
  let s = raw
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–—:,.]+|[\s\-–—:,.]+$/g, "")
    .trim();
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(LEADING_FILLER, "").replace(TRAILING_FILLER, "").trim();
  }
  s = s.replace(/^[\s\-–—:,.]+|[\s\-–—:,.]+$/g, "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseSegment(segment: string): ParsedExpense | undefined {
  let text = segment.trim();
  if (!text) return undefined;

  let daysAgo = 0;
  if (/\bday before yesterday\b/i.test(text)) {
    daysAgo = 2;
    text = text.replace(/\bday before yesterday\b/i, " ");
  } else if (/\byesterday\b/i.test(text)) {
    daysAgo = 1;
    text = text.replace(/\byesterday\b/i, " ");
  }

  let forcedCategory: Category | undefined;
  text = text.replace(/#([a-z]+)/gi, (_, tag: string) => {
    const t = tag.toLowerCase();
    if (isCategory(t)) forcedCategory = t;
    else if (t === "grocery") forcedCategory = "groceries";
    else if (t === "drink" || t === "drinks" || t === "eating") forcedCategory = "food";
    else if (t === "travel" || t === "ride") forcedCategory = "transport";
    else if (t === "bill" || t === "subscription") forcedCategory = "bills";
    else if (t === "medical" || t === "doctor") forcedCategory = "health";
    else if (t === "entertainment") forcedCategory = "fun";
    return " ";
  });

  const hit = pickAmount(findAmounts(text));
  if (!hit) return undefined;

  const noteRaw = text.slice(0, hit.start) + " " + text.slice(hit.end);
  const note = cleanNote(noteRaw);
  return {
    amount: Math.round(hit.value * 100) / 100,
    note,
    category: forcedCategory ?? (note ? categorise(note) : "other"),
    currency: hit.currency,
    daysAgo,
  };
}

/** Split "uber 600, lunch 900" / "chai 80 and samosa 40" only when every part has an amount. */
function splitSegments(text: string): string[] {
  const lines = text.split(/\r?\n|;/).map((l) => l.trim()).filter(Boolean);
  const result: string[] = [];
  for (const line of lines) {
    const byComma = line.split(/\s*,\s+/).map((p) => p.trim()).filter(Boolean);
    if (byComma.length > 1 && byComma.every((p) => findAmounts(p).length > 0)) {
      result.push(...byComma);
      continue;
    }
    const byAnd = line.split(/\s+(?:and|&|\+)\s+/i).map((p) => p.trim()).filter(Boolean);
    if (byAnd.length > 1 && byAnd.every((p) => findAmounts(p).length > 0)) {
      result.push(...byAnd);
      continue;
    }
    result.push(line);
  }
  return result;
}

export function parseMessage(input: string): ParseResult {
  const text = input.replace(/ /g, " ").trim();
  if (!text) return { kind: "unknown" };

  const currency = text.match(/^(?:currency|set currency|cur)\s+([a-z]{3})\s*$/i);
  if (currency) return { kind: "command", command: "currency", arg: currency[1].toUpperCase() };

  for (const [re, command] of COMMANDS) {
    if (re.test(text)) return { kind: "command", command };
  }

  const expenses = splitSegments(text)
    .map(parseSegment)
    .filter((e): e is ParsedExpense => Boolean(e));

  if (expenses.length === 0) return { kind: "unknown" };
  return { kind: "expenses", expenses };
}
