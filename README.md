<p align="left">
  <img src="public/brand/mark-ink-on-lime.svg" width="56" alt="Molit mark" />
</p>

# Molit.

**Money literacy. Full stop.**

Molit is a WhatsApp number. You text it what you spent (`chai 80`, `uber 600, lunch 900`). It remembers. On the 1st of every month it tells you the total, where it went, and how it compares to last month. There is also a dashboard, if you want charts.

That is the entire product. It is a small idea that intends to get bigger.

---

## What's in the box

| Piece | Where | Notes |
|---|---|---|
| WhatsApp bot | `src/lib/whatsapp/handle.ts` | Commands, replies, voice. One message in, one message out. |
| Message parser | `src/lib/parser/parse.ts` | Pure rules, no I/O, 43 unit tests. Optional Claude fallback in `llm.ts`. |
| Webhook | `src/app/api/whatsapp/webhook/route.ts` | Meta Cloud API handshake + signed inbound messages, idempotent. |
| Monthly summary | `src/app/api/cron/monthly/route.ts` | Vercel cron on the 1st. One message per user per month, guaranteed. |
| Dashboard | `src/app/app/` | Month view, per-day bars, categories, every expense, web add box. |
| Auth | `src/lib/auth/` | Magic link sent over WhatsApp → signed cookie. No passwords, no email. |
| Landing + brand | `src/app/page.tsx`, `src/app/brand/page.tsx` | Copy, logo, colours, type, voice. See also `BRAND.md`. |
| Database | `drizzle/0000_init.sql`, `src/lib/db/schema.ts` | Plain Postgres. Supabase, Neon, RDS, local — all fine. |

Stack: Next.js 16 (App Router), TypeScript, Tailwind v4, Drizzle + postgres-js, jose, zod, Anthropic SDK (optional), Vitest. Type: Geist + Geist Mono.

## Run it locally

```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL + SESSION_SECRET at minimum
npm run db:migrate                # creates the tables
npm run db:seed                   # optional: two months of demo data for +923001234567
npm run dev
```

Open http://localhost:3000. In development you can sign into the dashboard without WhatsApp:
`http://localhost:3000/api/dev/login?phone=923001234567` (disabled in production).

Without `WHATSAPP_TOKEN` the bot runs in **dry-run mode**: every outbound message is printed to the server log instead of sent, so you can poke the webhook with curl:

```bash
curl -X POST http://localhost:3000/api/whatsapp/webhook -H 'Content-Type: application/json' -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"messages":[{"id":"wamid.1","from":"923001234567","timestamp":"1","type":"text","text":{"body":"chai 80"}}]}}]}]}'
```

Tests (parser unit tests + a full bot conversation against the real database):

```bash
npm test
```

## Going live

### 1. Database

Any Postgres. For Supabase: create a project, open **Connect → Transaction pooler**, copy the URI (port 6543) into `DATABASE_URL`, then run `npm run db:migrate` (or paste `drizzle/0000_init.sql` into the SQL editor).

### 2. WhatsApp Cloud API (Meta)

1. Create an app at https://developers.facebook.com → add the **WhatsApp** product.
2. From **WhatsApp → API Setup** copy the **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`, and a permanent **System User token** with `whatsapp_business_messaging` → `WHATSAPP_TOKEN`.
3. **App → Settings → Basic → App secret** → `WHATSAPP_APP_SECRET`. Molit verifies every webhook signature with it.
4. Deploy first (step 4), then in **WhatsApp → Configuration → Webhook** set the callback URL to `https://<your-domain>/api/whatsapp/webhook` and the verify token to whatever you put in `WHATSAPP_VERIFY_TOKEN`. Subscribe to the **messages** field.
5. Put the number people will text into `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only, with country code). It powers every "Start on WhatsApp" button.

### 3. Monthly summary template

Meta only lets a business start a conversation with a pre-approved **template**. Replies to the user's own messages (everything else the bot does) need no template. Create one in **WhatsApp Manager → Message templates**:

- Name: `molit_monthly_summary` (put the name in `WHATSAPP_SUMMARY_TEMPLATE`)
- Category: Utility · Language: English
- Body:

```
{{1}} is over.

You spent {{2}} across {{3}} expenses. Most of it went on {{4}}.

That's it. That's the app. Reply "month" for the breakdown or "login" for your dashboard.
```

Until the template is approved the cron falls back to a plain text message, which only lands if the user has messaged within the last 24 hours.

### 4. Deploy (Vercel)

Push the repo, import it on Vercel, add every variable from `.env.example`, and set `APP_URL` to your real domain (magic links are built from it). `vercel.json` already schedules `/api/cron/monthly` at 04:00 UTC on the 1st; Vercel sends the `CRON_SECRET` header automatically when the env var exists.

### 5. Optional: Claude

Set `ANTHROPIC_API_KEY` and the bot will understand things like "paid two hundred for lunch" or "half a k on fuel". Plain `lunch 200` never needs it.

## The bot, in one screen

```
coffee 250                 log an expense (note + amount, either order)
uber 600, lunch 900        several at once
dinner 1200 yesterday      back-date by a day
chai 80 #fun               force a category
$4.50 latte · 45 aed taxi  explicit currency, kept per expense

today · week · month · last month · list
undo · login · currency USD · stop · summary on
delete everything          (asks you to confirm with YES DELETE)
help
```

Categories are keyword-based (`src/lib/categories.ts`): food, groceries, transport, bills, shopping, health, fun, other. Deliberately small.

## Design decisions worth knowing

- **`local_date` is stored, not computed.** The user's calendar day is fixed at write time using their timezone, so "this month" is a plain `between` on an indexed date column.
- **Login is a WhatsApp round-trip on purpose.** The user's "login" text opens Meta's 24-hour window, so the magic link is free to send and there is no signup, password, or email anywhere.
- **Webhook processing is idempotent.** Meta retries; `processed_messages` makes a redelivered message a no-op.
- **The dashboard's add box uses the WhatsApp parser.** It exists to teach the syntax, not to replace the chat.
- **One accent colour, one chart hue.** Charts show magnitude, so they use ink only; red appears exactly once, when this month beats last month.
