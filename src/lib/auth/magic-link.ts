import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

const TTL_MINUTES = 15;

function hash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a single-use link the bot sends back over WhatsApp. */
export async function createLoginLink(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db().insert(schema.loginTokens).values({
    userId,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + TTL_MINUTES * 60_000),
  });
  return `${env.appUrl}/auth/verify?t=${token}`;
}

/** Burns the token and returns the user id, or null if invalid/expired/used. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  const [row] = await db()
    .update(schema.loginTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(schema.loginTokens.tokenHash, hash(token)),
        isNull(schema.loginTokens.usedAt),
        gt(schema.loginTokens.expiresAt, new Date()),
      ),
    )
    .returning({ userId: schema.loginTokens.userId });
  return row?.userId ?? null;
}
