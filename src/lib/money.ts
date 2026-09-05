/** Currency presentation + inference from a phone's country code. */

const SYMBOLS: Record<string, string> = {
  PKR: "Rs ",
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SAR: "SAR ",
  QAR: "QAR ",
  KWD: "KWD ",
  OMR: "OMR ",
  BHD: "BHD ",
  BDT: "৳",
  LKR: "Rs ",
  NPR: "Rs ",
  CAD: "C$",
  AUD: "A$",
  NZD: "NZ$",
  SGD: "S$",
  MYR: "RM ",
  IDR: "Rp ",
  PHP: "₱",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  TRY: "₺",
  EGP: "E£",
  NGN: "₦",
  KES: "KSh ",
  ZAR: "R ",
  BRL: "R$",
  MXN: "MX$",
  CHF: "CHF ",
  SEK: "kr ",
  NOK: "kr ",
  DKK: "kr ",
  PLN: "zł ",
};

/** Currencies that read naturally with lakh/crore grouping. */
const INDIC = new Set(["PKR", "INR", "BDT", "LKR", "NPR"]);
/** Currencies that don't use minor units. */
const ZERO_DECIMAL = new Set(["JPY", "KRW", "IDR", "PKR", "INR", "BDT", "LKR", "NPR", "NGN", "KES"]);

export function isKnownCurrency(code: string) {
  return code.toUpperCase() in SYMBOLS;
}

export function currencySymbol(code: string) {
  return SYMBOLS[code.toUpperCase()] ?? `${code.toUpperCase()} `;
}

/**
 * "Rs 12,450" / "$4.50" / "₹1,20,000". Whole numbers never show ".00" —
 * decimals only appear when the amount actually has them.
 */
export function formatMoney(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  const locale = INDIC.has(code) ? "en-IN" : "en-US";
  const isWhole = Math.abs(amount - Math.round(amount)) < 0.005;
  const digits = isWhole || ZERO_DECIMAL.has(code) ? 0 : 2;
  const n = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
  return `${currencySymbol(code)}${n}`;
}

/** Compact: 12.4k, 1.2M — for tight chart labels. */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (amount >= 10_000) return `${Math.round(amount / 1000)}k`;
  if (amount >= 1_000) return `${(amount / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(amount)}`;
}

/** Country calling code -> [currency, IANA timezone]. Longest prefix wins. */
const COUNTRY: Record<string, [string, string]> = {
  "1": ["USD", "America/New_York"],
  "7": ["RUB", "Europe/Moscow"],
  "20": ["EGP", "Africa/Cairo"],
  "27": ["ZAR", "Africa/Johannesburg"],
  "31": ["EUR", "Europe/Amsterdam"],
  "32": ["EUR", "Europe/Brussels"],
  "33": ["EUR", "Europe/Paris"],
  "34": ["EUR", "Europe/Madrid"],
  "39": ["EUR", "Europe/Rome"],
  "41": ["CHF", "Europe/Zurich"],
  "44": ["GBP", "Europe/London"],
  "45": ["DKK", "Europe/Copenhagen"],
  "46": ["SEK", "Europe/Stockholm"],
  "47": ["NOK", "Europe/Oslo"],
  "48": ["PLN", "Europe/Warsaw"],
  "49": ["EUR", "Europe/Berlin"],
  "52": ["MXN", "America/Mexico_City"],
  "55": ["BRL", "America/Sao_Paulo"],
  "60": ["MYR", "Asia/Kuala_Lumpur"],
  "61": ["AUD", "Australia/Sydney"],
  "62": ["IDR", "Asia/Jakarta"],
  "63": ["PHP", "Asia/Manila"],
  "64": ["NZD", "Pacific/Auckland"],
  "65": ["SGD", "Asia/Singapore"],
  "81": ["JPY", "Asia/Tokyo"],
  "82": ["KRW", "Asia/Seoul"],
  "86": ["CNY", "Asia/Shanghai"],
  "90": ["TRY", "Europe/Istanbul"],
  "91": ["INR", "Asia/Kolkata"],
  "92": ["PKR", "Asia/Karachi"],
  "94": ["LKR", "Asia/Colombo"],
  "234": ["NGN", "Africa/Lagos"],
  "254": ["KES", "Africa/Nairobi"],
  "353": ["EUR", "Europe/Dublin"],
  "880": ["BDT", "Asia/Dhaka"],
  "965": ["KWD", "Asia/Kuwait"],
  "966": ["SAR", "Asia/Riyadh"],
  "968": ["OMR", "Asia/Muscat"],
  "971": ["AED", "Asia/Dubai"],
  "973": ["BHD", "Asia/Bahrain"],
  "974": ["QAR", "Asia/Qatar"],
  "977": ["NPR", "Asia/Kathmandu"],
};

export function inferLocale(phoneDigits: string): { currency: string; timezone: string } {
  for (const len of [3, 2, 1]) {
    const prefix = phoneDigits.slice(0, len);
    const hit = COUNTRY[prefix];
    if (hit) return { currency: hit[0], timezone: hit[1] };
  }
  return { currency: "USD", timezone: "UTC" };
}
