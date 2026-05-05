"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface WizardShellProps {
  step: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export function WizardShell({
  step,
  totalSteps,
  eyebrow,
  title,
  subtitle,
  onBack,
  children,
}: WizardShellProps) {
  const t = useTranslations("donate");

  return (
    <section className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-backdrop-subtle"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(20,241,149,0.10),transparent)] blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[78vh] max-w-[760px] flex-col px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 md:pt-20 lg:px-6 lg:pt-24">
        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-between gap-3 sm:mb-12">
          <div className="flex items-center gap-1.5 sm:gap-2" aria-label="progress">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const idx = i + 1;
              const active = idx === step;
              const done = idx < step;
              return (
                <span
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    active && "w-7 bg-[var(--color-primary)] sm:w-10",
                    done && "w-4 bg-[var(--color-primary)]/60 sm:w-6",
                    !active && !done && "w-4 bg-white/10 sm:w-6",
                  )}
                />
              );
            })}
          </div>

          <p className="shrink-0 font-mono text-[10px] tracking-[0.06em] text-text-muted lowercase sm:text-[11px]">
            {t("stepLabel")} {step.toString().padStart(2, "0")} {t("of")}{" "}
            {totalSteps.toString().padStart(2, "0")}
          </p>
        </div>

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="eyebrow mb-3 sm:mb-4">{eyebrow}</p>
          <h1 className="text-balance text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] text-text sm:text-[36px] md:text-[44px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-[600px] text-[14px] leading-relaxed text-text-secondary sm:mt-4 sm:text-[15px]">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex-1">{children}</div>

        {/* Back affordance — sticky-ish footer slot at bottom of step */}
        {onBack && step > 1 ? (
          <div className="mt-10 border-t border-white/[0.06] pt-5 sm:mt-12 sm:pt-6">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-2 text-[13px] text-text-secondary transition-colors hover:text-text"
            >
              <span aria-hidden className="inline-block transition-transform group-hover:-translate-x-0.5">
                ←
              </span>
              {t("back")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
