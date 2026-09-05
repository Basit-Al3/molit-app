import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: "Molit — You could track this in your Notes app. You haven't.",
    template: "%s — Molit",
  },
  description:
    "Molit is a WhatsApp number. Text it what you spent. At the end of the month it tells you the total. That is the entire product. Money literacy, full stop.",
  applicationName: "Molit",
  keywords: ["expense tracker", "whatsapp", "money literacy", "spending", "budget"],
  openGraph: {
    title: "Molit — money literacy, full stop.",
    description: "Text your expenses to WhatsApp. Get the truth on the 1st. That's the whole app.",
    siteName: "Molit",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f3efe6",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
