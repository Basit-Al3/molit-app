/**
 * Thin wrapper over the Meta WhatsApp Cloud API. Two calls, nothing else.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */
import { optionalEnv, requireEnv } from "@/lib/env";

const GRAPH_VERSION = optionalEnv("WHATSAPP_GRAPH_VERSION") ?? "v21.0";

function endpoint() {
  return `https://graph.facebook.com/${GRAPH_VERSION}/${requireEnv("WHATSAPP_PHONE_NUMBER_ID")}/messages`;
}

async function post(body: Record<string, unknown>) {
  if (!optionalEnv("WHATSAPP_TOKEN")) {
    // Local dev without credentials: log instead of sending.
    console.log("[whatsapp:dry-run]", JSON.stringify(body, null, 2));
    return;
  }
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("WHATSAPP_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", ...body }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`WhatsApp send failed (${res.status}): ${detail}`);
  }
}

/** Free-form text. Only deliverable inside the 24h customer-service window. */
export async function sendText(to: string, body: string) {
  await post({ to, type: "text", text: { body, preview_url: false } });
}

/**
 * Pre-approved template — required for business-initiated messages such as
 * the monthly summary. `params` fill {{1}}, {{2}}… in the template body.
 */
export async function sendTemplate(to: string, name: string, params: string[], language = "en") {
  await post({
    to,
    type: "template",
    template: {
      name,
      language: { code: language },
      components: [
        {
          type: "body",
          parameters: params.map((text) => ({ type: "text", text })),
        },
      ],
    },
  });
}

/** Mark a message as read so the user sees the blue ticks immediately. */
export async function markRead(messageId: string) {
  try {
    await post({ status: "read", message_id: messageId });
  } catch {
    /* non-fatal */
  }
}
