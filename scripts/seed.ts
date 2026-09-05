/**
 * Seeds a demo user with two months of believable expenses.
 *   npm run db:seed              -> phone 923001234567
 *   npm run db:seed -- 14155550100
 * Then sign in via http://localhost:3000/api/dev/login?phone=<phone>
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { db, schema } from "../src/lib/db";
import { findOrCreateUser } from "../src/lib/users";
import { parseMessage } from "../src/lib/parser/parse";
import { addDays, todayIn } from "../src/lib/time";

const SAMPLES = [
  "chai 80", "coffee 350", "uber 600", "lunch 900", "careem 450", "biryani 650", "groceries 4200", "netflix 1100",
  "petrol 3000", "samosa 120", "dinner 2400", "milk eggs bread 900", "jazz load 500", "pharmacy 780", "shoes 6500",
  "bykea 250", "cinema 1800 #fun", "k-electric 9200", "pizza 2200", "gym 3500", "parking 100", "juice 200",
  "daraz order 3100", "dentist 5000", "burger 700", "rickshaw 150", "internet 2500", "gift 2000", "cake 1200",
];

function pick<T>(arr: T[], rnd: () => number) {
  return arr[Math.floor(rnd() * arr.length)];
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const phone = process.argv[2] ?? "923001234567";
  const { user } = await findOrCreateUser(phone, "Basit");
  await db().delete(schema.expenses).where(eq(schema.expenses.userId, user.id));
  const rnd = mulberry32(42);
  const today = todayIn(user.timezone);
  const rows: (typeof schema.expenses.$inferInsert)[] = [];
  for (let back = 58; back >= 0; back--) {
    const date = addDays(today, -back);
    const n = rnd() < 0.2 ? 0 : 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const text = pick(SAMPLES, rnd);
      const parsed = parseMessage(text);
      if (parsed.kind !== "expenses") continue;
      const e = parsed.expenses[0];
      rows.push({
        userId: user.id,
        amount: e.amount.toFixed(2),
        currency: user.currency,
        note: e.note,
        category: e.category,
        localDate: date,
        occurredAt: new Date(`${date}T${String(8 + i * 4).padStart(2, "0")}:15:00+05:00`),
        source: "whatsapp",
        rawText: text,
      });
    }
  }
  await db().insert(schema.expenses).values(rows);
  console.log(`seeded ${rows.length} expenses for +${phone}`);
  console.log(`sign in: http://localhost:3000/api/dev/login?phone=${phone}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
