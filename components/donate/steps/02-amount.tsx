"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/donate/amount-input";
import {
  ZAKAT_FITRAH_PER_PERSON_IDRZ,
  ZAKAT_MAL_NISAB_IDRZ,
  calculateZakatMal,
} from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";
import type { DonationType } from "@/lib/types";

interface Step2Props {
  donationType: DonationType;
  amountIdrz: bigint;
  wealthIdrz: bigint;
  fitrahPeople: number;
  onAmountChange: (next: bigint) => void;
  onWealthChange: (next: bigint) => void;
  onFitrahPeopleChange: (next: number) => void;
  onNext: () => void;
}

const QUICK_PICKS_FREE: bigint[] = [50_000n, 100_000n, 500_000n, 1_000_000n];
const QUICK_PICKS_FITRAH: number[] = [1, 2, 3, 4, 5];

export function Step2Amount({
  donationType,
  amountIdrz,
  wealthIdrz,
  fitrahPeople,
  onAmountChange,
  onWealthChange,
  onFitrahPeopleChange,
  onNext,
}: Step2Props) {
  const t = useTranslations("donate.step2");
  const tBase = useTranslations("donate");

  const owedZakatMal = useMemo(
    () => calculateZakatMal(wealthIdrz),
    [wealthIdrz],
  );
  const belowNisab = wealthIdrz > 0n && wealthIdrz < ZAKAT_MAL_NISAB_IDRZ;

  if (donationType === "ZAKAT_MAL") {
    return (
      <div className="flex flex-col gap-8">
        <p className="-mt-4 text-[14px] leading-relaxed text-text-secondary">
          {t("subtitleZakatMal")}
        </p>

        <AmountInput
          label={t("wealthLabel")}
          hint={`${t("wealthHint")} · ${t("nisabHint")}: ${formatRupiah(ZAKAT_MAL_NISAB_IDRZ)}`}
          value={wealthIdrz}
          onChange={(next) => {
            onWealthChange(next);
            onAmountChange(calculateZakatMal(next));
          }}
        />

        {/* Computed zakat readout */}
        <div className="card-mizaan flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
              {t("owedLabel")}
            </span>
            {belowNisab ? (
              <span className="text-[15px] text-text-secondary">
                {t("belowNisab")}
              </span>
            ) : (
              <span className="text-[22px] font-medium tracking-tight text-text sm:text-[28px]">
                {formatRupiah(owedZakatMal)}
              </span>
            )}
          </div>
          <span
            aria-hidden
            className="font-mono text-[10px] tracking-[0.08em] text-text-muted"
          >
            2.5%
          </span>
        </div>

        {/* Override: show only when there is a baseline zakat amount */}
        {!belowNisab && wealthIdrz > 0n ? (
          <AmountInput
            label={t("amountLabel")}
            hint={t("overrideHint")}
            value={amountIdrz}
            onChange={onAmountChange}
            size="md"
          />
        ) : null}

        <div className="flex justify-end">
          <Button
            size="lg"
            className="lowercase"
            disabled={amountIdrz <= 0n}
            onClick={onNext}
          >
            {tBase("next")} →
          </Button>
        </div>
      </div>
    );
  }

  if (donationType === "ZAKAT_FITRAH") {
    const total = ZAKAT_FITRAH_PER_PERSON_IDRZ * BigInt(fitrahPeople);
    return (
      <div className="flex flex-col gap-8">
        <p className="-mt-4 text-[14px] leading-relaxed text-text-secondary">
          {t("subtitleFitrah")}
        </p>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
            {t("fitrahPeopleLabel")}
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PICKS_FITRAH.map((n) => {
              const active = fitrahPeople === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    onFitrahPeopleChange(n);
                    onAmountChange(ZAKAT_FITRAH_PER_PERSON_IDRZ * BigInt(n));
                  }}
                  className={cn(
                    "h-12 min-w-[64px] rounded-[10px] border px-4 font-medium tracking-tight transition-colors",
                    active
                      ? "border-[var(--color-border-accent)] bg-[rgba(20,241,149,0.06)] text-text"
                      : "border-white/10 bg-white/[0.03] text-text-secondary hover:text-text",
                  )}
                >
                  {n}×
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-mizaan flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
              {t("amountLabel")}
            </span>
            <span className="text-[22px] font-medium tracking-tight text-text sm:text-[28px]">
              {formatRupiah(total)}
            </span>
          </div>
          <span
            aria-hidden
            className="font-mono text-[10px] tracking-[0.08em] text-text-muted lowercase"
          >
            {formatRupiah(ZAKAT_FITRAH_PER_PERSON_IDRZ)} {t("fitrahPerPerson")}
          </span>
        </div>

        <div className="flex justify-end">
          <Button
            size="lg"
            className="lowercase"
            disabled={total <= 0n}
            onClick={() => {
              onAmountChange(total);
              onNext();
            }}
          >
            {tBase("next")} →
          </Button>
        </div>
      </div>
    );
  }

  // SEDEKAH / INFAQ — freeform
  return (
    <div className="flex flex-col gap-8">
      <p className="-mt-4 text-[14px] leading-relaxed text-text-secondary">
        {t("subtitleFree")}
      </p>

      <AmountInput
        label={t("amountLabel")}
        value={amountIdrz}
        onChange={onAmountChange}
      />

      <div className="flex flex-col gap-3">
        <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
          {t("quickPicks")}
        </span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS_FREE.map((amount) => {
            const active = amountIdrz === amount;
            return (
              <button
                key={amount.toString()}
                type="button"
                onClick={() => onAmountChange(amount)}
                className={cn(
                  "h-11 rounded-[10px] border px-4 font-mono text-[12px] tracking-tight transition-colors lowercase",
                  active
                    ? "border-[var(--color-border-accent)] bg-[rgba(20,241,149,0.06)] text-text"
                    : "border-white/10 bg-white/[0.03] text-text-secondary hover:text-text",
                )}
              >
                {formatRupiah(amount).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="lowercase"
          disabled={amountIdrz <= 0n}
          onClick={onNext}
        >
          {tBase("next")} →
        </Button>
      </div>
    </div>
  );
}
