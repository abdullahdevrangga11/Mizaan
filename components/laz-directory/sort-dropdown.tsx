"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SortKey = "RECEIVED" | "MUSTAHIK" | "NAME";

interface SortOption {
  value: SortKey;
  label: string;
}

interface SortDropdownProps {
  value: SortKey;
  options: SortOption[];
  onChange: (value: SortKey) => void;
  /** "sort by" prefix label. */
  legend: string;
}

export function SortDropdown({
  value,
  options,
  onChange,
  legend,
}: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2 rounded-[10px] border border-[#FFFFFF12] bg-[#1A1A1A] px-3 text-xs leading-4 text-[#EFEFE48C] transition-colors hover:border-[#FFFFFF1F] hover:text-[#EFEFE4] md:h-8 md:w-auto"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#EFEFE466]">
          {legend}
        </span>
        <span className="text-[#EFEFE4]">{current.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path
            d="M2.5 4l2.5 2.5L7.5 4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-20 mt-1.5 w-full min-w-[200px] overflow-hidden rounded-[10px] border border-[#FFFFFF12] bg-[#161616] shadow-2xl md:w-auto"
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs leading-4 transition-colors",
                    selected
                      ? "bg-[#14F19514] text-[#14F195]"
                      : "text-[#EFEFE4BF] hover:bg-[#FFFFFF06] hover:text-[#EFEFE4]",
                  )}
                >
                  <span>{opt.label}</span>
                  {selected ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2.5 6.5l2.5 2.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
