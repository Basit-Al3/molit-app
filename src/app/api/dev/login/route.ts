/**
 * Development-only shortcut so the dashboard can be used without a WhatsApp
 * round-trip:  /api/dev/login?phone=923001234567
 * Disabled in production regardless of query params.
 */
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { findOrCreateUser } from "@/lib/users";

export async function GET(request: Request) {
  if (!env.isDev) return new Response("not found", { status: 404 });
  const phone = new URL(request.url).searchParams.get("phone");
  if (!phone) return new Response("phone required", { status: 400 });
  const { user } = await findOrCreateUser(phone, "Dev User");
  await setSessionCookie(user.id);
  return NextResponse.redirect(new URL("/app", request.url));
}
