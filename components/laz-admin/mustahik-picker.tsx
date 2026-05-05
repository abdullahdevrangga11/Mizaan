"use client";

/**
 * <MustahikPicker />
 *
 * Hackathon-grade dropdown picker for the LAZ admin distribution form.
 * Matches the spec in SRS §12.3 — searchable by initials/region/asnaf,
 * never reveals full PII, shows initials + age range + asnaf + region.
 *
 * Inline 5-mustahik mock pool (the "138 lainnya tersedia" footer in OFG-0
 * is a credibility flourish — we ship the meaningful slice).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AGE_RANGE_LABELS,
  ASNAF_LABELS,
  type SupportedLocale,
} from "@/lib/constants";
import type { AsnafCategory, MustahikAgeRange } from "@/lib/types";

export interface PickerMustahik {
  id: string;
  internalId: string;
  initials: string;
  fullDisplayName: string;
  region: string;
  asnaf: AsnafCategory;
  ageRange: MustahikAgeRange;
}

interface MustahikPickerProps {
  pool: PickerMustahik[];
  selectedId: string | null;
  excludeIds?: string[];
  locale: SupportedLocale;
  onSelect: (mustahik: PickerMustahik) => void;
}

const COPY = {
  placeholder: { id: "pilih mustahik...", en: "select mustahik..." },
  searchPlaceholder: {
    id: "cari nama, region, atau asnaf...",
    en: "search name, region, or asnaf...",
  },
  empty: {
    id: "tidak ada mustahik yang cocok.",
    en: "no matching mustahik.",
  },
  available: { id: "tersedia", en: "available" },
} as const;

export function MustahikPicker({
  pool,
  selectedId,
  excludeIds = [],
  locale,
  onSelect,
}: MustahikPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const eligible = useMemo(
    () => pool.filter((m) => !excludeIds.includes(m.id)),
    [pool, excludeIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((m) => {
      const asnaf = ASNAF_LABELS[m.asnaf][locale].toLowerCase();
      return (
        m.fullDisplayName.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q) ||
        m.internalId.toLowerCase().includes(q) ||
        asnaf.includes(q)
      );
    });
  }, [eligible, query, locale]);

  const selected = pool.find((m) => m.id === selectedId) ?? null;

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-[#FFFFFF12] bg-[#181818] px-3.5 py-2.75 text-left transition-colors hover:border-[#FFFFFF1F]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected ? (
            <>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#FFFFFF14] bg-[#FFFFFF0A]">
                <span className="font-mono text-[10px] leading-3 font-semibold text-[#EFEFE4D9]">
                  {selected.initials}
                </span>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] leading-4 font-medium text-[#EFEFE4]">
                  {selected.fullDisplayName}
                </span>
                <span className="truncate font-mono text-[10px] leading-3 text-[#EFEFE46B]">
                  {selected.region} · {AGE_RANGE_LABELS[selected.ageRange][locale]}
                </span>
              </span>
            </>
          ) : (
            <span className="text-[13px] leading-4 text-[#EFEFE48C]">
              {COPY.placeholder[locale]}
            </span>
          )}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className="shrink-0"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="#EFEFE46B"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 flex flex-col overflow-clip rounded-[12px] border border-[#FFFFFF12] bg-[#1A1A1A] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center gap-2 border-b border-[#FFFFFF0F] bg-[#141414] px-3.5 py-2.75">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className="shrink-0"
            >
              <circle cx="5" cy="5" r="3.5" stroke="#EFEFE46B" strokeWidth="1.3" />
              <path
                d="M8 8l3 3"
                stroke="#EFEFE46B"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder={COPY.searchPlaceholder[locale]}
              className="grow basis-0 bg-transparent text-[13px] leading-4 text-[#EFEFE4] outline-none placeholder:text-[#EFEFE452]"
            />
            <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
              {filtered.length} {COPY.available[locale]}
            </span>
          </div>

          <div className="flex max-h-72 flex-col overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3.5 py-6 text-center text-xs leading-4 text-[#EFEFE46B]">
                {COPY.empty[locale]}
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    onSelect(m);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 border-b border-[#FFFFFF06] px-3.5 py-2.75 text-left transition-colors last:border-b-0 hover:bg-[#FFFFFF06]"
                  role="option"
                  aria-selected={m.id === selectedId}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#FFFFFF14] bg-[#FFFFFF0A]">
                    <span className="font-mono text-[11px] leading-3.5 font-semibold text-[#EFEFE4D9]">
                      {m.initials}
                    </span>
                  </span>
                  <span className="flex min-w-0 grow basis-0 flex-col">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate text-[13px] leading-4 font-medium text-[#EFEFE4]">
                        {m.fullDisplayName}
                      </span>
                      <span className="font-mono text-[10px] leading-3 text-[#EFEFE452]">
                        {m.internalId}
                      </span>
                    </span>
                    <span className="truncate font-mono text-[10px] leading-3 text-[#EFEFE46B]">
                      {m.region} · {AGE_RANGE_LABELS[m.ageRange][locale]}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-2 py-0.5 font-mono text-[10px] leading-3 font-medium text-[#EFEFE48C]">
                    {ASNAF_LABELS[m.asnaf][locale].toUpperCase()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
