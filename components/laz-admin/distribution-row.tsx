/**
 * <DistributionRow />
 *
 * Single row in the LAZ admin distribution table. Shows mustahik avatar,
 * name + region/age, formatted amount, category chip, asnaf, purpose, and
 * a status pill. Mirrors Paper artboard `OFG-0` table rows.
 */
import { CATEGORY_LABELS, type SupportedLocale } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import type { AsnafCategory, Category } from "@/lib/types";

export interface DistributionRowData {
  index: number;
  mustahikLabel: string;
  mustahikRegionAge: string;
  amountIdrz: bigint;
  category: Category;
  asnaf: AsnafCategory;
  purpose: string;
  /** Visual highlight tier for the category chip. */
  categoryTier: "primary" | "neutral";
  status: "ready" | "draft" | "signed";
}

interface DistributionRowProps {
  row: DistributionRowData;
  locale: SupportedLocale;
  onRemove?: () => void;
}

const STATUS_LABEL: Record<
  DistributionRowData["status"],
  { id: string; en: string }
> = {
  ready: { id: "ready", en: "ready" },
  draft: { id: "draft", en: "draft" },
  signed: { id: "signed", en: "signed" },
};

export function DistributionRow({
  row,
  locale,
  onRemove,
}: DistributionRowProps) {
  const isPrimary = row.categoryTier === "primary";
  return (
    <div className="group flex items-center gap-3.5 border-b border-[#FFFFFF0A] px-5.5 py-3.5 last:border-b-0">
      {/* Index avatar */}
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#14F19538] bg-[#14F1951A]">
        <span className="font-mono text-[10px] leading-3 font-semibold text-[#14F195]">
          {row.index}
        </span>
      </span>

      {/* Mustahik */}
      <div className="w-50 shrink-0">
        <div className="text-[13px] leading-4 font-medium text-[#EFEFE4]">
          {row.mustahikLabel}
        </div>
        <div className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
          {row.mustahikRegionAge}
        </div>
      </div>

      {/* Amount */}
      <div className="w-35 shrink-0 text-right text-sm leading-[18px] font-medium text-[#EFEFE4]">
        {formatRupiah(row.amountIdrz)}
      </div>

      {/* Category */}
      <div className="w-35 shrink-0">
        <span
          className={
            isPrimary
              ? "inline-flex rounded-[14px] border border-[#14F1952E] bg-[#14F19514] px-2 py-0.5 font-mono text-[10px] leading-3 font-medium text-[#14F195]"
              : "inline-flex rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-2 py-0.5 font-mono text-[10px] leading-3 font-medium text-[#EFEFE48C]"
          }
        >
          {CATEGORY_LABELS[row.category][locale]
            .toUpperCase()
            .replace(/\s&\s/g, " ")
            .replace(/\s+/g, "_")}
        </span>
      </div>

      {/* Asnaf */}
      <div className="w-25 shrink-0 font-mono text-[11px] leading-3.5 text-[#EFEFE4A6]">
        {row.asnaf}
      </div>

      {/* Purpose */}
      <div className="grow basis-0 truncate text-xs leading-4 text-[#EFEFE4A6]">
        {row.purpose}
      </div>

      {/* Status / actions */}
      <div className="flex w-17.5 shrink-0 items-center justify-end gap-1.5">
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={locale === "id" ? "hapus baris" : "remove row"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 3l6 6M9 3l-6 6"
                stroke="#EFEFE46B"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
        <span className="inline-flex rounded-[10px] bg-[#FFFFFF0A] px-1.75 py-0.5 font-mono text-[10px] leading-3 text-[#EFEFE4A6]">
          {STATUS_LABEL[row.status][locale]}
        </span>
      </div>
    </div>
  );
}
