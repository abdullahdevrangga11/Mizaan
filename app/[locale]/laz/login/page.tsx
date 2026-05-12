import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { LoginForm } from "./login-form";
import { getLazAdminSession } from "@/lib/auth/laz-session";
import type { SupportedLocale } from "@/lib/constants";

export const metadata: Metadata = {
  title: "laz admin login · mizaan",
  description: "Sign in to the Mizaan LAZ admin console.",
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const locale = (await getLocale()) as SupportedLocale;
  const { next } = await searchParams;
  const safeLocale = locale === "en" ? "en" : "id";

  // Already authenticated? Send straight to the requested admin URL
  // (or a sensible default).
  const session = await getLazAdminSession();
  if (session) {
    const target = next && next.startsWith("/") ? next : `/${safeLocale}/laz`;
    redirect(target);
  }

  const t =
    locale === "id"
      ? {
          eyebrow: "// laz admin",
          headline: "masuk ke konsol distribusi.",
          subtitle:
            "untuk amil laz yang ingin mengelola distribusi dan menandatangani receipt on-chain.",
          emailLabel: "email",
          passwordLabel: "kata sandi",
          submit: "masuk",
          submitting: "memeriksa...",
          demoEyebrow: "// untuk juri & reviewer",
          demoTitle: "akses sebagai demo judge",
          demoBody:
            "tidak punya akun? gunakan kredensial demo yang sudah disediakan untuk juri hackathon — tinggal satu klik.",
          demoCta: "login sebagai judge",
          errorGeneric: "gagal masuk. coba lagi.",
        }
      : {
          eyebrow: "// laz admin",
          headline: "sign in to the distribution console.",
          subtitle:
            "for LAZ amils managing distributions and signing receipts on-chain.",
          emailLabel: "email",
          passwordLabel: "password",
          submit: "sign in",
          submitting: "checking...",
          demoEyebrow: "// for judges & reviewers",
          demoTitle: "log in as demo judge",
          demoBody:
            "no account? use the pre-provisioned demo credentials for hackathon judges — one tap.",
          demoCta: "log in as judge",
          errorGeneric: "sign-in failed. try again.",
        };

  return (
    <>
      <Navbar locale={locale} variant="compact" />
      <main
        className="relative z-[2] mb-[728px] min-h-[calc(100dvh-4rem)] bg-[#181818]"
        id="top"
      >
        <section className="relative isolate overflow-x-clip">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(239,239,228,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,239,228,0.04) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-12 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(20,241,149,0.10),transparent)] blur-3xl"
          />

          <div className="relative mx-auto flex max-w-[920px] flex-col gap-10 px-5 pb-16 pt-16 sm:px-8 sm:pt-24 md:px-12 md:pt-28 lg:px-8">
            <header className="flex flex-col gap-3 sm:gap-4">
              <span className="font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6] sm:text-xs">
                {t.eyebrow}
              </span>
              <h1 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px]">
                {t.headline}
              </h1>
              <p className="m-0 max-w-[560px] text-[13px] leading-[155%] text-[#EFEFE48C] sm:text-[15px]">
                {t.subtitle}
              </p>
            </header>

            <LoginForm
              locale={safeLocale}
              next={next ?? `/${safeLocale}/laz`}
              copy={{
                emailLabel: t.emailLabel,
                passwordLabel: t.passwordLabel,
                submit: t.submit,
                submitting: t.submitting,
                demoEyebrow: t.demoEyebrow,
                demoTitle: t.demoTitle,
                demoBody: t.demoBody,
                demoCta: t.demoCta,
                errorGeneric: t.errorGeneric,
              }}
            />
          </div>
        </section>
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}
