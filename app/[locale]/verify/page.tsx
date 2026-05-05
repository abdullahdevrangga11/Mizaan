import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { VerifyForm } from "./verify-form";
import type { SupportedLocale } from "@/lib/constants";

export default async function VerifyPage() {
  const locale = (await getLocale()) as SupportedLocale;

  return (
    <>
      <Navbar locale={locale} variant="compact" />
      <main className="relative z-[2] mb-[728px] min-h-[calc(100dvh-4rem)] bg-[#181818] text-[#EFEFE4]">
        <div className="mx-auto w-full max-w-[1440px]">
          <VerifyForm locale={locale} />
        </div>
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}
