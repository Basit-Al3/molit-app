import { createHmac, timingSafeEqual } from "node:crypto";
import { optionalEnv } from "@/lib/env";

/**
 * Meta signs every webhook POST with HMAC-SHA256 over the raw body using the
 * app secret. If WHATSAPP_APP_SECRET is unset we skip verification (dev only)
 * and say so loudly in the logs.
 */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = optionalEnv("WHATSAPP_APP_SECRET");
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn("WHATSAPP_APP_SECRET not set — skipping webhook signature check (dev only)");
    return true;
  }
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const given = header.slice("sha256=".length);
  if (expected.length !== given.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(given, "hex"));
}
