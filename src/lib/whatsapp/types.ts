/** The slice of Meta's webhook payload that Molit actually reads. */
export type InboundMessage = {
  id: string;
  from: string; // digits, no "+"
  timestamp: string;
  type: string;
  text?: { body: string };
  button?: { text: string };
  interactive?: { button_reply?: { title: string }; list_reply?: { title: string } };
};

export type WebhookPayload = {
  object?: string;
  entry?: {
    changes?: {
      field?: string;
      value?: {
        messaging_product?: string;
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: InboundMessage[];
      };
    }[];
  }[];
};

export function extractMessages(payload: WebhookPayload) {
  const out: { message: InboundMessage; name?: string }[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;
      for (const message of value.messages) {
        const contact = value.contacts?.find((c) => c.wa_id === message.from) ?? value.contacts?.[0];
        out.push({ message, name: contact?.profile?.name });
      }
    }
  }
  return out;
}

/** Text a human typed, regardless of whether it came as text, a button, or a list. */
export function messageText(m: InboundMessage): string | undefined {
  if (m.type === "text") return m.text?.body;
  if (m.type === "button") return m.button?.text;
  if (m.type === "interactive") return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title;
  return undefined;
}
