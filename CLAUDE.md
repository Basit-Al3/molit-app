@AGENTS.md

# Molit

WhatsApp expense tracker. Read `README.md` for setup and `BRAND.md` for voice/visual rules before touching copy or UI.

- Local Postgres for dev/tests runs on port 5544 (`DATABASE_URL` in `.env.local`); `npm run db:migrate` then `npm run db:seed`.
- `npm test` runs parser unit tests and a full bot conversation against the database.
- The bot's voice lives in `src/lib/whatsapp/handle.ts`. Keep replies short, no exclamation marks, no emoji.
- Custom CSS classes are in `@layer components` in `globals.css` so Tailwind utilities can override them.
