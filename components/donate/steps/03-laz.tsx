"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LazPickCard } from "@/components/donate/laz-pick-card";
import type { SupportedLocale } from "@/lib/constants";
import type { ApiResult, Laz } from "@/lib/types";

export interface LazPickValue {
  id: string;
  slug: string;
  name: string;
}

type LazSummary = Pick<
  Laz,
  | "id"
  | "slug"
  | "name"
  | "region"
  | "jurisdictionLevel"
  | "logoUrl"
  | "totalReceivedIdrz"
  | "mustahikCount"
>;

interface Step3Props {
  selectedLazId: string | null;
  onChange: (laz: LazPickValue) => void;
  onNext: () => void;
  locale: SupportedLocale;
}

export function Step3Laz({
  selectedLazId,
  onChange,
  onNext,
  locale,
}: Step3Props) {
  const t = useTranslations("donate");
  const [list, setList] = useState<LazSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/laz")
      .then((r) => r.json() as Promise<ApiResult<RawLaz[]>>)
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.data) {
          setError(result.error?.message ?? "failed to load");
          return;
        }
        setList(result.data.map(normalize));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "network error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="card-neutral p-8 text-sm text-text-muted">
        {locale === "id" ? "gagal memuat laz: " : "failed to load laz: "}
        {error}
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="card-neutral h-[88px] animate-pulse opacity-50"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        {list.map((laz) => (
          <LazPickCard
            key={laz.id}
            laz={laz}
            selected={selectedLazId === laz.id}
            onSelect={() =>
              onChange({ id: laz.id, slug: laz.slug, name: laz.name })
            }
            locale={locale}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="lowercase"
          disabled={!selectedLazId}
          onClick={onNext}
        >
          {t("next")} →
        </Button>
      </div>
    </div>
  );
}

/** API responses serialize bigint as string — restore here. */
type RawLaz = Omit<Laz, "totalReceivedIdrz" | "totalDistributedIdrz"> & {
  totalReceivedIdrz: string | number;
  totalDistributedIdrz: string | number;
};

function normalize(raw: RawLaz): LazSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    region: raw.region,
    jurisdictionLevel: raw.jurisdictionLevel,
    logoUrl: raw.logoUrl,
    totalReceivedIdrz: BigInt(String(raw.totalReceivedIdrz ?? 0)),
    mustahikCount: raw.mustahikCount,
  };
}
