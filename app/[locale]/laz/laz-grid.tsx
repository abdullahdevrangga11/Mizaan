"use client";

import { useMemo, useState } from "react";
import { LazCard } from "@/components/laz-directory/laz-card";
import {
  FilterBar,
  type JurisdictionFilter,
  type RegionFilter,
} from "@/components/laz-directory/filter-bar";
import {
  SortDropdown,
  type SortKey,
} from "@/components/laz-directory/sort-dropdown";
import type { Laz, LazJurisdictionLevel } from "@/lib/types";
import type { SupportedLocale } from "@/lib/constants";

interface LazGridCopy {
  filters: {
    jurisdictionLabel: string;
    regionLabel: string;
    jurisdictionAll: string;
    jurisdictionNational: string;
    jurisdictionProvincial: string;
    jurisdictionRegency: string;
    jurisdictionMosque: string;
    regionAll: string;
    regionDIY: string;
    regionJakarta: string;
    regionIndonesia: string;
  };
  sort: {
    legend: string;
    received: string;
    mustahik: string;
    name: string;
  };
  card: {
    received: string;
    distributed: string;
    mustahik: string;
    donor: string;
    verifiedOnChain: string;
    detailCta: string;
  };
  empty: {
    title: string;
    subtitle: string;
  };
}

interface LazGridProps {
  laz: Laz[];
  locale: SupportedLocale;
  copy: LazGridCopy;
}

const JURISDICTION_TO_LEVEL: Record<
  Exclude<JurisdictionFilter, "ALL">,
  LazJurisdictionLevel
> = {
  NATIONAL: "NATIONAL",
  PROVINCIAL: "PROVINCIAL",
  REGENCY: "REGENCY",
  MOSQUE: "MOSQUE",
};

/** Map a `Laz.region` string to a coarse RegionFilter bucket. */
function regionBucket(region: string): Exclude<RegionFilter, "ALL"> {
  const r = region.toLowerCase();
  if (r.includes("yogya") || r.includes("diy")) return "DIY";
  if (r.includes("jakarta")) return "JAKARTA";
  return "INDONESIA";
}

export function LazGrid({ laz, locale, copy }: LazGridProps) {
  const [jurisdiction, setJurisdiction] = useState<JurisdictionFilter>("ALL");
  const [region, setRegion] = useState<RegionFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("RECEIVED");

  // Pre-compute counts per jurisdiction across the unfiltered list.
  const jurisdictionCounts = useMemo(() => {
    const counts: Record<LazJurisdictionLevel, number> = {
      NATIONAL: 0,
      PROVINCIAL: 0,
      REGENCY: 0,
      MOSQUE: 0,
    };
    for (const item of laz) counts[item.jurisdictionLevel] += 1;
    return counts;
  }, [laz]);

  const regionCounts = useMemo(() => {
    const counts: Record<Exclude<RegionFilter, "ALL">, number> = {
      DIY: 0,
      JAKARTA: 0,
      INDONESIA: 0,
    };
    for (const item of laz) counts[regionBucket(item.region)] += 1;
    return counts;
  }, [laz]);

  const filtered = useMemo(() => {
    const out = laz.filter((item) => {
      const matchJurisdiction =
        jurisdiction === "ALL" ||
        item.jurisdictionLevel === JURISDICTION_TO_LEVEL[jurisdiction];
      const matchRegion =
        region === "ALL" || regionBucket(item.region) === region;
      return matchJurisdiction && matchRegion;
    });

    out.sort((a, b) => {
      switch (sortKey) {
        case "RECEIVED":
          return Number(b.totalReceivedIdrz - a.totalReceivedIdrz);
        case "MUSTAHIK":
          return b.mustahikCount - a.mustahikCount;
        case "NAME":
          return a.name.localeCompare(b.name);
      }
    });
    return out;
  }, [laz, jurisdiction, region, sortKey]);

  const featuredId = useMemo(() => {
    if (laz.length === 0) return null;
    return laz.reduce((top, cur) =>
      cur.totalReceivedIdrz > top.totalReceivedIdrz ? cur : top,
    ).id;
  }, [laz]);

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      {/* Filter + sort bar */}
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between">
        <FilterBar
          jurisdiction={jurisdiction}
          region={region}
          jurisdictionOptions={[
            { value: "ALL", label: copy.filters.jurisdictionAll },
            {
              value: "NATIONAL",
              label: copy.filters.jurisdictionNational,
              count: jurisdictionCounts.NATIONAL,
            },
            {
              value: "PROVINCIAL",
              label: copy.filters.jurisdictionProvincial,
              count: jurisdictionCounts.PROVINCIAL,
            },
            {
              value: "REGENCY",
              label: copy.filters.jurisdictionRegency,
              count: jurisdictionCounts.REGENCY,
            },
            {
              value: "MOSQUE",
              label: copy.filters.jurisdictionMosque,
              count: jurisdictionCounts.MOSQUE,
            },
          ]}
          regionOptions={[
            { value: "ALL", label: copy.filters.regionAll },
            {
              value: "DIY",
              label: copy.filters.regionDIY,
              count: regionCounts.DIY,
            },
            {
              value: "JAKARTA",
              label: copy.filters.regionJakarta,
              count: regionCounts.JAKARTA,
            },
            {
              value: "INDONESIA",
              label: copy.filters.regionIndonesia,
              count: regionCounts.INDONESIA,
            },
          ]}
          onJurisdictionChange={setJurisdiction}
          onRegionChange={setRegion}
          copy={{
            jurisdictionLabel: copy.filters.jurisdictionLabel,
            regionLabel: copy.filters.regionLabel,
          }}
        />
        <SortDropdown
          value={sortKey}
          onChange={setSortKey}
          legend={copy.sort.legend}
          options={[
            { value: "RECEIVED", label: copy.sort.received },
            { value: "MUSTAHIK", label: copy.sort.mustahik },
            { value: "NAME", label: copy.sort.name },
          ]}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#FFFFFF12] bg-[#FFFFFF03] px-6 py-16 text-center">
          <h3 className="m-0 text-base font-medium leading-5 text-[#EFEFE4] lowercase">
            {copy.empty.title}
          </h3>
          <p className="m-0 max-w-[420px] text-[13px] leading-5 text-[#EFEFE48C]">
            {copy.empty.subtitle}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <LazCard
              key={item.id}
              laz={item}
              locale={locale}
              copy={copy.card}
              featured={item.id === featuredId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
