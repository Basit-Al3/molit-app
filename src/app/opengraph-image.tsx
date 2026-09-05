import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Molit — you could track this in your Notes app. You haven't.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Geist Bold (OFL), self-hosted latin subset. Keeps the build hermetic.
const font = readFile(join(process.cwd(), "src/assets/fonts/Geist-Bold.woff"));

export default async function Image() {
  const data = await font;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f3efe6",
          color: "#101010",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#101010" />
            <path d="M14 11a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v45l-6-5-6 5-6-5-6 5-6-5-6 5z" fill="#d8ff3d" />
            <path d="M23 20h18M23 29h11" fill="none" stroke="#101010" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 40h18" fill="none" stroke="#101010" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2.5, display: "flex" }}>
            Molit<span style={{ color: "#b9e21a" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -4, lineHeight: 0.95, display: "flex", flexDirection: "column" }}>
            <span>You could track this</span>
            <span>in your Notes app.</span>
            <span style={{ display: "flex", marginTop: 12 }}>
              <span style={{ background: "#d8ff3d", padding: "0 14px", transform: "rotate(-1.2deg)" }}>You haven&apos;t.</span>
            </span>
          </div>
          <div style={{ marginTop: 34, fontSize: 28, color: "#3b3a36", display: "flex" }}>
            Text your expenses to WhatsApp. Get the number on the 1st. Money literacy, full stop.
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data, weight: 700, style: "normal" }] },
  );
}
