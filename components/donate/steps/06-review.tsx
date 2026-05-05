"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  DONATION_TYPE_LABELS,
  type SupportedLocale,
} from "@/lib/constants";
import { formatRupiah, shortenAddress } from "@/lib/utils";
import type { Category, DonationType } from "@/lib/types";

interface Step6Props {
  donationType: DonationType;
  amountIdrz: bigint;
  lazName: string;
  categoryPreference: Category[];
  walletAddress: string;
  onSubmit: () => Promise<void>;
  locale: SupportedLocale;
}

export function Step6Review({
  donationType,
  amountIdrz,
  lazName,
  categoryPreference,
  walletAddress,
  onSubmit,
  locale,
}: Step6Props) {
  const t = useTranslations("donate.step6");
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: t("summaryDonationType"),
      value: DONATION_TYPE_LABELS[donationType][locale].toLowerCase(),
    },
    {
      label: t("summaryAmount"),
      value: (
        <span className="text-[20px] font-medium tracking-tight text-text">
          {formatRupiah(amountIdrz)}
        </span>
      ),
    },
    { label: t("summaryLaz"), value: lazName.toLowerCase() },
    {
      label: t("summaryCategory"),
      value:
        categoryPreference.length === 0
          ? t("summaryNoCategory")
          : categoryPreference
              .map((c) => CATEGORY_LABELS[c][locale].toLowerCase())
              .join(", "),
    },
    {
      label: t("summaryWallet"),
      value: (
        <span className="font-mono text-[13px] text-text-secondary">
          {shortenAddress(walletAddress, 8, 8)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="card-mizaan divide-y divide-white/[0.06] overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col items-start gap-1.5 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-6"
          >
            <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
              {row.label}
            </span>
            <span className="break-words text-left text-[14px] text-text sm:text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed text-text-muted">
        {t("disclaimer")}
      </p>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="lowercase"
          disabled={submitting}
          onClick={handleClick}
        >
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </div>
  );
}
