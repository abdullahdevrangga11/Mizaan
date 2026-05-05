"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

export type VerifyTab = "WALLET" | "PDA" | "DONATION";

interface SearchInputCopy {
  placeholder: string;
  verify: string;
  shortcut: string;
  tabs: { wallet: string; pda: string; donation: string };
  examplesLabel: string;
  exampleWallet: string;
  examplePda: string;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  activeTab: VerifyTab;
  onTabChange: (tab: VerifyTab) => void;
  isResolved: boolean;
  copy: SearchInputCopy;
}

export function SearchInput({
  value,
  onChange,
  activeTab,
  onTabChange,
  isResolved,
  copy,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onChange("");
    }
  }

  function fillExample(example: string) {
    onChange(example);
    inputRef.current?.focus();
  }

  const tabs: { id: VerifyTab; label: string }[] = [
    { id: "WALLET", label: copy.tabs.wallet },
    { id: "PDA", label: copy.tabs.pda },
    { id: "DONATION", label: copy.tabs.donation },
  ];

  return (
    <div className="flex w-full max-w-[920px] flex-col gap-4">
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="search by"
        className="flex items-center gap-1 self-start rounded-[10px] border border-[#FFFFFF0F] bg-[#161616] p-1"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={
                active
                  ? "rounded-[7px] border border-[#FFFFFF12] bg-[#1A1A1A] px-3 py-1.5 font-mono text-[11px] leading-[14px] tracking-[0.02em] text-[#EFEFE4] transition-colors"
                  : "rounded-[7px] border border-transparent px-3 py-1.5 font-mono text-[11px] leading-[14px] tracking-[0.02em] text-[#EFEFE46B] transition-colors hover:text-[#EFEFE4BF]"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Big input row */}
      <label
        htmlFor="verify-input"
        className={
          isResolved
            ? "group relative flex h-16 w-full items-center gap-2.5 rounded-[14px] border bg-[#1A1A1A] px-3.5 transition-all focus-within:bg-[#1B1B1B] sm:gap-3.5 sm:px-5"
            : "group relative flex h-16 w-full items-center gap-2.5 rounded-[14px] border bg-[#1A1A1A] px-3.5 transition-all focus-within:bg-[#1B1B1B] sm:gap-3.5 sm:px-5"
        }
        style={{
          borderColor: isResolved ? "#14F1954D" : "#FFFFFF14",
          boxShadow: isResolved
            ? "0 0 0 4px #14F1951A, inset 0 1px 0 #14F19514"
            : "inset 0 1px 0 #FFFFFF08",
        }}
      >
        <span aria-hidden className="flex shrink-0 items-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="9"
              cy="9"
              r="6"
              stroke={isResolved ? "#14F195" : "#EFEFE48C"}
              strokeWidth="1.4"
            />
            <path
              d="M14 14l4 4"
              stroke={isResolved ? "#14F195" : "#EFEFE48C"}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          id="verify-input"
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKey}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          placeholder={copy.placeholder}
          className="flex min-w-0 grow basis-0 bg-transparent font-mono text-[13px] leading-[18px] tracking-[-0.005em] text-[#EFEFE4] outline-none placeholder:text-[#EFEFE452] sm:text-[15px] sm:leading-[20px]"
        />

        {/* Live status pill — left-shifts when input has 32+ chars */}
        {isResolved ? (
          <span
            className="hidden shrink-0 items-center gap-1.5 rounded-[14px] border border-[#14F19538] bg-[#14F1951A] px-2.5 py-1 font-mono text-[10px] leading-3 font-medium text-[#14F195] sm:flex"
            aria-live="polite"
          >
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
              <path
                d="M3 6.5l2.5 2.5 4.5-5"
                stroke="#14F195"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            resolved
          </span>
        ) : (
          <span
            aria-hidden
            className="hidden shrink-0 items-center gap-1 rounded-md border border-[#FFFFFF14] bg-[#FFFFFF0A] px-1.5 py-0.5 font-mono text-[10px] leading-3 text-[#EFEFE466] sm:flex"
          >
            {copy.shortcut}
          </span>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-[#14F195] px-3 font-medium text-[12px] leading-[16px] tracking-[-0.005em] text-[#0F1A14] transition-opacity hover:opacity-90 disabled:opacity-40 sm:h-11 sm:gap-2 sm:px-4 sm:text-[13px]"
          disabled={!value}
        >
          <span>{copy.verify}</span>
          <span aria-hidden>→</span>
        </button>
      </label>

      {/* Example chips */}
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
          {copy.examplesLabel}
        </span>
        <button
          type="button"
          onClick={() => fillExample("7xKXmP4nD8sRqzT3Fp2Yh9KvA7sBgQ4DeFhJkLmNbW2pNa")}
          className="rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-2.5 py-[3px] font-mono text-[11px] leading-[14px] text-[#EFEFE4A6] transition-colors hover:border-[#14F1954D] hover:text-[#EFEFE4]"
        >
          {copy.exampleWallet}
        </button>
        <button
          type="button"
          onClick={() => fillExample("3xK7Pm9k4tQrXzWnE5cHbT8sJ2dGyVrUaP6oYf9BmQr")}
          className="rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-2.5 py-[3px] font-mono text-[11px] leading-[14px] text-[#EFEFE4A6] transition-colors hover:border-[#14F1954D] hover:text-[#EFEFE4]"
        >
          {copy.examplePda}
        </button>
      </div>
    </div>
  );
}
