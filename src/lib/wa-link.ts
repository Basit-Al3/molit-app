import { env } from "@/lib/env";

/** Deep link that opens WhatsApp with a message pre-filled. */
export function waLink(text: string): string {
  const number = env.whatsappNumber ?? "";
  const q = `?text=${encodeURIComponent(text)}`;
  return number ? `https://wa.me/${number}${q}` : `https://wa.me/${q}`;
}

export function displayNumber(): string {
  const n = env.whatsappNumber;
  if (!n) return "our WhatsApp number";
  return `+${n}`;
}
