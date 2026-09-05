import { NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";
import { handleWebhook } from "@/lib/whatsapp/handle";
import { verifySignature } from "@/lib/whatsapp/verify";
import type { WebhookPayload } from "@/lib/whatsapp/types";

export const runtime = "nodejs";

/** Meta's one-time verification handshake. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === requireEnv("WHATSAPP_VERIFY_TOKEN") && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("forbidden", { status: 403 });
}

/** Every inbound message and status update lands here. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("invalid signature", { status: 401 });
  }
  let payload: WebhookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: true, ignored: true });
  }
  // Always answer 200 — otherwise Meta retries and we'd double-process.
  await handleWebhook(payload);
  return NextResponse.json({ ok: true });
}
