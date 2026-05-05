"use client";

import { useState } from "react";
import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "addressing the obvious objections",
    headline: "pertanyaan yang biasa muncul.",
    items: [
      {
        q: "apakah mizaan menggantikan baznas atau laz?",
        a: "tidak. mizaan adalah lapisan attestation kriptografis di atas operasional laz. setiap laz yang adopt mizaan tetap menjalankan operasi mereka sendiri — kami hanya menambah dimensi transparansi yang dapat diverifikasi publik.",
      },
      {
        q: "data mustahik apakah aman? bagaimana dengan uu pdp?",
        a: "data pribadi mustahik (nama lengkap, foto, nomor hp) tidak pernah on-chain. yang on-chain hanya hash, inisial, dan kategori asnaf. uu pdp 27/2022 compliant by design — pii disimpan di postgres terenkripsi dengan rls scoping per laz.",
      },
      {
        q: "apakah dipungut biaya dari donor?",
        a: "tidak. 0% donor fee. mizaan free untuk muzakki — biaya solana gas (~$0.0001) ditanggung platform. revenue model berasal dari laz saas + opsional yield sharing pada zakat parking pendek.",
      },
      {
        q: "apakah konsep on-chain zakat sudah halal secara fiqh?",
        a: "ya — dr. farrukh habib (islamic fintech hub uk) memvalidasi konsepnya di puskas baznas. blockchain attestation adalah penguat akuntabilitas, bukan instrumen riba/gharar/maysir. fatwa formal dari dsn-mui sedang dalam proses untuk v1.1.",
      },
      {
        q: "apa beda mizaan dengan kitabisa atau platform donasi lain?",
        a: "kitabisa adalah platform crowdfunding general yang charge 5% donor fee. mizaan khusus zakat dengan 0% donor fee dan attestation kriptografis end-to-end. setiap rupiah punya jejak yang independent verifiable, bukan janji administratif.",
      },
      {
        q: "bagaimana mustahik tanpa smartphone bisa konfirmasi?",
        a: "tiga jalur fallback: (1) sms dengan link ke pwa ringan yang jalan di feature-phone browser, (2) qr code yang amil scan saat handover offline, (3) konfirmasi by-laz dengan signed consent fisik. konfirmasi rate target ≥80% di semua jalur.",
      },
    ],
  },
  en: {
    eyebrow: "addressing the obvious objections",
    headline: "questions we hear all the time.",
    items: [
      {
        q: "does mizaan replace baznas or laz?",
        a: "no. mizaan is a cryptographic attestation layer on top of laz operations. every laz that adopts mizaan keeps running its own ops — we just add a publicly verifiable transparency dimension.",
      },
      {
        q: "is mustahik data safe? what about indonesia's data protection law?",
        a: "personal mustahik data (full name, photo, phone number) is never on-chain. on-chain only carries a hash, initials, and asnaf category. uu pdp 27/2022 compliant by design — pii lives in encrypted postgres with rls scoping per laz.",
      },
      {
        q: "is there any fee on the donor side?",
        a: "no. 0% donor fee. mizaan is free for muzakki — solana gas (~$0.0001) is covered by the platform. revenue comes from laz saas + optional yield-sharing on short-term zakat parking.",
      },
      {
        q: "is on-chain zakat halal under fiqh?",
        a: "yes — dr. farrukh habib (islamic fintech hub uk) validated the concept at puskas baznas. blockchain attestation is an accountability strengthener, not a riba/gharar/maysir instrument. a formal fatwa from dsn-mui is in progress for v1.1.",
      },
      {
        q: "how is mizaan different from kitabisa or other donation platforms?",
        a: "kitabisa is a general crowdfunding platform that charges a 5% donor fee. mizaan is zakat-specific with 0% donor fee and end-to-end cryptographic attestation. every rupiah has an independently verifiable trail, not just an administrative promise.",
      },
      {
        q: "how do mustahik without a smartphone confirm?",
        a: "three fallback paths: (1) sms with a link to a lightweight pwa that runs in feature-phone browsers, (2) qr code the amil scans during offline handover, (3) laz-mediated confirmation with signed physical consent. target ≥80% confirmation rate across all paths.",
      },
    ],
  },
} as const;

export function FAQ({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="flex flex-col items-center gap-8 border-t border-[#FFFFFF0D] px-5 pt-16 pb-16 sm:gap-10 sm:px-8 sm:pt-20 sm:pb-20 md:gap-11 md:px-12 md:pb-24 lg:gap-12 lg:px-20 lg:pb-25"
    >
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">{t.eyebrow}</p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
      </div>

      <div className="flex w-full max-w-[880px] flex-col gap-px border-y border-[#FFFFFF0F] bg-[#FFFFFF0F]">
        {t.items.map((item, i) => {
          const open = openIdx === i;
          return (
            <button
              key={item.q}
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              className="flex flex-col gap-2 bg-[#181818] px-1 py-5 text-left transition-colors hover:bg-[#1a1a1a] sm:py-6"
              aria-expanded={open}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[15px] leading-[22px] font-medium tracking-[-0.015em] text-[#EFEFE4] sm:text-base md:text-lg">
                  {item.q}
                </span>
                <span aria-hidden className="shrink-0 font-mono text-sm leading-[22px] text-[#EFEFE48C]">
                  {open ? "−" : "+"}
                </span>
              </div>
              {open && (
                <p className="m-0 mt-1.5 text-[13px] leading-[160%] text-[#EFEFE48C] sm:text-sm">{item.a}</p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
