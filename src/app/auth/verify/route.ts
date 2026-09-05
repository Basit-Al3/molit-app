import { NextResponse } from "next/server";
import { consumeLoginToken } from "@/lib/auth/magic-link";
import { setSessionCookie } from "@/lib/auth/session";

/** Magic-link landing: burns the token, sets the cookie, sends to /app. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t");
  if (!token) return NextResponse.redirect(new URL("/login?error=missing", request.url));
  const userId = await consumeLoginToken(token);
  if (!userId) return NextResponse.redirect(new URL("/login?error=expired", request.url));
  await setSessionCookie(userId);
  return NextResponse.redirect(new URL("/app", request.url));
}
