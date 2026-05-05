import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Mizaan — transparansi zakat di atas Solana",
    template: "%s · Mizaan",
  },
  description:
    "Setiap Rupiah zakat punya jejak kriptografis dari donor ke mustahik. No skim, no fake distribution, no missing accountability.",
  applicationName: "Mizaan",
  keywords: [
    "zakat",
    "sedekah",
    "infaq",
    "blockchain",
    "Solana",
    "transparansi",
    "Indonesia",
    "BAZNAS",
    "LAZ",
  ],
  authors: [{ name: "Mizaan" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Mizaan",
    title: "Mizaan — transparansi zakat di atas Solana",
    description:
      "Setiap Rupiah zakat punya jejak kriptografis dari donor ke mustahik.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mizaan — transparansi zakat di atas Solana",
    description:
      "Setiap Rupiah zakat punya jejak kriptografis dari donor ke mustahik.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#181818",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Root layout. The locale-aware <html> tag and IntlProvider live in
 * `app/[locale]/layout.tsx` — that's where next-intl's request config
 * resolves the active locale.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${display.variable} ${mono.variable} antialiased`}>
      <body className="min-h-screen bg-bg text-text">{children}</body>
    </html>
  );
}
