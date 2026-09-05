/**
 * Central place for environment access.
 * Nothing here throws at import time, so `next build` works without secrets.
 * Call `requireEnv("X")` inside request handlers when a value is mandatory.
 */

export function optionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export function requireEnv(name: string): string {
  const v = optionalEnv(name);
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  get appUrl() {
    return optionalEnv("APP_URL") ?? optionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
  },
  get whatsappNumber() {
    // Digits only, international format without "+". Used for wa.me links.
    return optionalEnv("NEXT_PUBLIC_WHATSAPP_NUMBER");
  },
  get isDev() {
    return process.env.NODE_ENV !== "production";
  },
};
