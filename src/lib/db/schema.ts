import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * One row per WhatsApp number. The phone number IS the identity —
 * there is no email, no password, no "create account" step.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** E.164 digits without the leading "+", e.g. "923001234567". */
  phone: text("phone").notNull().unique(),
  name: text("name"),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("UTC"),
  monthlySummary: boolean("monthly_summary").notNull().default(true),
  /** Set when the user asks to wipe their data; cleared after confirm/expiry. */
  pendingDeleteUntil: timestamp("pending_delete_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    note: text("note").notNull(),
    category: text("category").notNull().default("other"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    /**
     * The calendar day in the user's timezone, computed at write time.
     * All "this month" / "today" maths group by this column, so the
     * database never needs to know about timezones.
     */
    localDate: date("local_date").notNull(),
    source: text("source").notNull().default("whatsapp"),
    rawText: text("raw_text"),
    waMessageId: text("wa_message_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("expenses_user_local_date_idx").on(t.userId, t.localDate)],
);

/** WhatsApp retries webhooks; this table makes processing idempotent. */
export const processedMessages = pgTable("processed_messages", {
  waMessageId: text("wa_message_id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Single-use magic-link tokens, stored hashed. */
export const loginTokens = pgTable("login_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Record of every monthly summary sent, so the cron never double-sends. */
export const monthlySummaries = pgTable(
  "monthly_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** First day of the month summarised, e.g. 2026-08-01. */
    month: date("month").notNull(),
    total: numeric("total", { precision: 14, scale: 2 }).notNull(),
    count: integer("count").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("monthly_summaries_user_month_idx").on(t.userId, t.month)],
);

export type User = typeof users.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
