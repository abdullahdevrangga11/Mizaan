import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <Providers>
        {/* Flex column min-h-dvh wrapper — required for the Paper NUV-0
         *  sticky-underlay footer reveal pattern. See globals.css + each
         *  page must wrap its primary content in <main class="main-content"
         *  …relative z-[2] bg-bg…> so the FooterReveal underlay is properly
         *  covered until the user scrolls past. */}
        <div className="flex min-h-dvh flex-col">{children}</div>
      </Providers>
    </NextIntlClientProvider>
  );
}
