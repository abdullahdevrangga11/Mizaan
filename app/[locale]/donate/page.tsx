import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { DonateForm } from "./donate-form";
import type { SupportedLocale } from "@/lib/constants";

export default async function DonatePage() {
  const locale = (await getLocale()) as SupportedLocale;

  return (
    <>
      <Navbar locale={locale} variant="compact" />
      <main>
        <DonateForm locale={locale} />
      </main>
    </>
  );
}
