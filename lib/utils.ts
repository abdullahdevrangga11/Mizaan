import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an IDRZ amount (smallest unit, no decimals — Rupiah is whole) as
 * `Rp X,XXX,XXX` using `id-ID` locale (which uses `.` as thousands separator
 * — we coerce to `,` for parity with the design system specs).
 */
export function formatRupiah(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? amount : BigInt(Math.floor(amount));
  const localized = new Intl.NumberFormat("en-US").format(value);
  return `Rp ${localized}`;
}

/**
 * Truncate a Solana base58 address: `7xKXtg...bW2pNa`
 * `head` defaults to 6, `tail` to 6.
 */
export function shortenAddress(
  address: string | null | undefined,
  head = 6,
  tail = 6,
): string {
  if (!address) return "—";
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

/**
 * Relative time helper for the live feed: "5 mins ago", "2 hours ago".
 * Intentionally Bahasa-friendly (rounds simply, no Intl.RelativeTimeFormat
 * fuss for the hackathon).
 */
export function timeAgo(date: Date | string | number, locale: "id" | "en" = "id"): string {
  const then = new Date(date).getTime();
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));

  const units: Array<{ s: number; idShort: string; en: string }> = [
    { s: 60, idShort: "detik", en: "sec" },
    { s: 3600, idShort: "menit", en: "min" },
    { s: 86_400, idShort: "jam", en: "hr" },
    { s: 604_800, idShort: "hari", en: "day" },
    { s: 2_592_000, idShort: "minggu", en: "wk" },
    { s: 31_536_000, idShort: "bulan", en: "mo" },
    { s: Number.POSITIVE_INFINITY, idShort: "tahun", en: "yr" },
  ];

  let prevDivisor = 1;
  for (const unit of units) {
    if (seconds < unit.s) {
      const value = Math.floor(seconds / prevDivisor);
      const label = locale === "id" ? unit.idShort : unit.en;
      return locale === "id" ? `${value} ${label} lalu` : `${value} ${label} ago`;
    }
    prevDivisor = unit.s;
  }
  return locale === "id" ? "lama" : "long ago";
}

/** SHA-256 hex hash (browser + node compatible via WebCrypto). */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest(
    "SHA-256",
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Slug-safe lowercase, ASCII-only-ish. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
