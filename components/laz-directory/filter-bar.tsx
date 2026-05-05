"use client";

import { cn } from "@/lib/utils";

export type JurisdictionFilter = "ALL" | "NATIONAL" | "PROVINCIAL" | "REGENCY" | "MOSQUE";
export type RegionFilter = "ALL" | "DIY" | "JAKARTA" | "INDONESIA";

interface FilterOption<T extends string> {
  value: T;
  label: string;
  /** Optional count badge appended after the label, e.g. "national · 8". */
  count?: number;
}

interface FilterBarCopy {
  jurisdictionLabel: string;
  regionLabel: string;
}

interface FilterBarProps {
  jurisdiction: JurisdictionFilter;
  region: RegionFilter;
  jurisdictionOptions: FilterOption<JurisdictionFilter>[];
  regionOptions: FilterOption<RegionFilter>[];
  onJurisdictionChange: (value: JurisdictionFilter) => void;
  onRegionChange: (value: RegionFilter) => void;
  copy: FilterBarCopy;
}

export function FilterBar({
  jurisdiction,
  region,
  jurisdictionOptions,
  regionOptions,
  onJurisdictionChange,
  onRegionChange,
  copy,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row md:flex-wrap md:items-center">
      <FilterGroup
        legend={copy.jurisdictionLabel}
        options={jurisdictionOptions}
        active={jurisdiction}
        onChange={onJurisdictionChange}
      />
      <span aria-hidden className="hidden h-5 w-px bg-[#FFFFFF12] md:inline-block" />
      <FilterGroup
        legend={copy.regionLabel}
        options={regionOptions}
        active={region}
        onChange={onRegionChange}
      />
    </div>
  );
}

function FilterGroup<T extends string>({
  legend,
  options,
  active,
  onChange,
}: {
  legend: string;
  options: FilterOption<T>[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      <span className="font-mono text-[10px] leading-3 tracking-[0.06em] uppercase text-[#EFEFE466]">
        {legend}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt) => {
          const isActive = opt.value === active;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={isActive}
              className={cn(
                "rounded-[18px] px-3 py-1.5 text-xs leading-4 transition-colors",
                isActive
                  ? "bg-[#14F195] font-medium text-[#181818]"
                  : "border border-[#FFFFFF12] bg-[#FFFFFF0A] text-[#EFEFE48C] hover:border-[#FFFFFF1F] hover:text-[#EFEFE4]",
              )}
            >
              {opt.label}
              {typeof opt.count === "number" ? (
                <span
                  className={cn(
                    "ml-1.5",
                    isActive ? "text-[#181818CC]" : "text-[#EFEFE452]",
                  )}
                >
                  · {opt.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
