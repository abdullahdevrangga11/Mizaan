import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { Hero } from "@/components/landing/hero";
import { HeroProductImage } from "@/components/landing/hero-product-image";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { Solution } from "@/components/landing/solution";
import { Stats } from "@/components/landing/stats";
import { Benefits } from "@/components/landing/benefits";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Integrations } from "@/components/landing/integrations";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTV } from "@/components/landing/ctv";
import { Roadmap } from "@/components/landing/roadmap";
import type { SupportedLocale } from "@/lib/constants";

/**
 * Mizaan landing page. Sections in load-bearing order, defined in Paper
 * artboard NDO-0. Wrapped in `<main class="main-content">` so the
 * sticky-underlay footer-reveal pattern (Paper NUV-0) works:
 *   main has z-[2] + solid bg → covers the footer underneath
 *   footer is sticky bottom + z-[1] + -mt-[100vh] → reveals on scroll
 */
export default async function Home() {
  const locale = (await getLocale()) as SupportedLocale;

  return (
    <>
      <main
        id="top"
        // mb-[728px] reserves scroll space for the fixed-position FooterReveal
        // beneath. As the user scrolls past main's content, the empty margin
        // area uncovers the fixed footer underneath — that's the reveal.
        className="main-content relative z-[2] mb-[728px] flex-[1_0_auto] bg-[#181818] min-h-[calc(100dvh-4rem)]"
      >
        <Navbar locale={locale} />
        <Hero locale={locale} />
        <HeroProductImage />
        <SocialProof locale={locale} />
        <Features locale={locale} />
        <Solution locale={locale} />
        <Stats locale={locale} />
        <Benefits locale={locale} />
        <HowItWorks locale={locale} />
        <Integrations locale={locale} />
        <Testimonials locale={locale} />
        <FAQ locale={locale} />
        <CTV locale={locale} />
        <Roadmap locale={locale} />
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}
