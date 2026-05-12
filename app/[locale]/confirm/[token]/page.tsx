"use client";

import { use, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { MobileShell } from "@/components/confirm/mobile-shell";
import { DetailCard } from "@/components/confirm/detail-card";
import {
  ChainVisualization,
  type ChainStep,
} from "@/components/confirm/chain-visualization";
import { ConfirmButton } from "@/components/confirm/confirm-button";
import { shortenAddress } from "@/lib/utils";

// ---------- Locale copy ----------

type Locale = "id" | "en";

interface Copy {
  secure: string;
  eyebrow: string;
  greetingLine1: string;
  greetingLine2: string;
  amountLabel: string;
  rowFrom: string;
  rowPurpose: string;
  rowDonor: string;
  rowDate: string;
  rowCode: string;
  rowDonationPda: string;
  rowDistributionPda: string;
  rowReceiptPda: string;
  receiptPending: string;
  receiptIssued: string;
  receiptIssuedSuffix: string;
  chainEyebrow: string;
  step1Label: string;
  step1Detail: string;
  step2Label: string;
  step2Detail: string;
  step3Label: string;
  step3Detail: string;
  step3DetailDone: string;
  consent: string;
  acceptCta: string;
  declineCta: string;
  successEyebrow: string;
  successHeadline: string;
  successBody: string;
  thanksLabel: string;
  thanksHelp: string;
  thanksPlaceholder: string;
  thanksSend: string;
  thanksSkip: string;
  thanksSent: string;
  declined: string;
  footer: string;
}

const copy: Record<Locale, Copy> = {
  id: {
    secure: "secure",
    eyebrow: "// solana attestation · pending",
    greetingLine1: "assalamualaikum,",
    greetingLine2: "pak yusuf.",
    amountLabel: "ANDA MENERIMA",
    rowFrom: "DARI",
    rowPurpose: "UNTUK",
    rowDonor: "DONOR",
    rowDate: "TANGGAL TERIMA",
    rowCode: "KODE VERIFIKASI",
    rowDonationPda: "DONATION PDA",
    rowDistributionPda: "DISTRIBUTION PDA",
    rowReceiptPda: "RECEIPT PDA",
    receiptPending: "menunggu konfirmasi anda",
    receiptIssued: "tercatat",
    receiptIssuedSuffix: "baru saja",
    chainEyebrow: "// rantai attestation",
    step1Label: "DONATION COMMITMENT",
    step1Detail: "donor menandatangani · 22 apr, 14:32",
    step2Label: "DISTRIBUTION DECISION",
    step2Detail: "Dompet Dhuafa Yogya · 23 apr, 09:11",
    step3Label: "RECEIPT CONFIRMATION",
    step3Detail: "menunggu pak yusuf menekan tombol di bawah",
    step3DetailDone: "pak yusuf konfirmasi · baru saja",
    consent:
      "dengan menekan tombol di bawah, anda mengkonfirmasi telah menerima jumlah ini. donor akan menerima notifikasi konfirmasi anda. data anda tetap rahasia.",
    acceptCta: "saya konfirmasi terima",
    declineCta: "saya tidak terima",
    successEyebrow: "// solana attestation · tercatat",
    successHeadline: "terima kasih, pak yusuf.",
    successBody:
      "donor akan menerima notifikasi konfirmasi anda. catatan ini tersimpan permanen di solana sebagai SAS attestation #3.",
    thanksLabel: "pesan terima kasih (opsional)",
    thanksHelp:
      "donor akan dapat membaca pesan ini. data pribadi anda tidak dibagikan.",
    thanksPlaceholder: "contoh: terima kasih, sangat membantu sekolah anak…",
    thanksSend: "kirim pesan",
    thanksSkip: "lewati",
    thanksSent: "✓ pesan terkirim ke donor.",
    declined: "konfirmasi ditolak. tim Mizaan akan menghubungi anda.",
    footer:
      "konfirmasi anda akan tercatat di solana sebagai SAS attestation #3 — privacy-preserving (uu pdp 2022).",
  },
  en: {
    secure: "secure",
    eyebrow: "// solana attestation · pending",
    greetingLine1: "peace be upon you,",
    greetingLine2: "pak yusuf.",
    amountLabel: "YOU RECEIVED",
    rowFrom: "FROM",
    rowPurpose: "FOR",
    rowDonor: "DONOR",
    rowDate: "RECEIVED ON",
    rowCode: "VERIFICATION CODE",
    rowDonationPda: "DONATION PDA",
    rowDistributionPda: "DISTRIBUTION PDA",
    rowReceiptPda: "RECEIPT PDA",
    receiptPending: "awaiting your confirmation",
    receiptIssued: "recorded",
    receiptIssuedSuffix: "just now",
    chainEyebrow: "// attestation chain",
    step1Label: "DONATION COMMITMENT",
    step1Detail: "donor signed · 22 apr, 14:32",
    step2Label: "DISTRIBUTION DECISION",
    step2Detail: "Dompet Dhuafa Yogya · 23 apr, 09:11",
    step3Label: "RECEIPT CONFIRMATION",
    step3Detail: "waiting for pak yusuf to tap the button below",
    step3DetailDone: "pak yusuf confirmed · just now",
    consent:
      "by tapping the button below, you confirm receipt of this amount. the donor will be notified. your private data stays private.",
    acceptCta: "i confirm receipt",
    declineCta: "i did not receive",
    successEyebrow: "// solana attestation · recorded",
    successHeadline: "thank you, pak yusuf.",
    successBody:
      "the donor will be notified. this confirmation is permanently recorded on solana as SAS attestation #3.",
    thanksLabel: "thank-you message (optional)",
    thanksHelp:
      "the donor will be able to read this message. your personal data is not shared.",
    thanksPlaceholder: "e.g. thank you, this really helps with school…",
    thanksSend: "send message",
    thanksSkip: "skip",
    thanksSent: "✓ message sent to donor.",
    declined: "confirmation declined. the Mizaan team will reach out.",
    footer:
      "your confirmation will be recorded on solana as SAS attestation #3 — privacy-preserving (uu pdp 2022).",
  },
};

// ---------- Demo attestation data ----------
// These map to the seeded "Pak Subandi Hartono" chain on Devnet so any
// /confirm/[token] visit renders a chain whose PDAs resolve to real
// Solscan accounts. In production this page resolves the magic-link token
// via POST /api/receipts and reads the actual distribution.

const DONATION_PDA = "CLDKtP943CebTrrRsU9SzshhcyNU4ViZNEJ1kUrzuRD4";
const DISTRIBUTION_PDA = "2xE5DQgK3sSwQmmaoPGuV2WS2Fdam3Nuv46omK8Q4Ygy";
// Receipt PDA only "exists" once the mustahik confirms.
const FAKE_RECEIPT_PDA = "9aux7mq9C3V4jVjCUz8nGKmM3yss2rV4czGny5y1DZHf";

// ---------- Page ----------

export default function ConfirmPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = use(params);
  const localeFromHook = useLocale();
  const locale: Locale = localeFromHook === "en" ? "en" : "id";
  const t = copy[locale];

  type Stage = "ready" | "confirmed" | "declined";
  const [stage, setStage] = useState<Stage>("ready");
  const [thanksMsg, setThanksMsg] = useState("");
  const [thanksSent, setThanksSent] = useState(false);

  const verificationCode = useMemo(() => {
    const clean = token.replace(/[^a-z0-9]/gi, "").toUpperCase();
    const padded = (clean + "1247AB7C").slice(0, 8);
    return `${padded.slice(0, 4)}-${padded.slice(4, 8)}`;
  }, [token]);

  const tokenShort = useMemo(() => token.slice(0, 8), [token]);

  const date =
    locale === "id" ? "5 mei 2026 · 14:30 wib" : "5 may 2026 · 14:30 wib";

  const steps: ChainStep[] = useMemo(() => {
    const confirmed = stage === "confirmed";
    return [
      {
        n: 1,
        label: t.step1Label,
        detail: t.step1Detail,
        sig: shortenAddress(DONATION_PDA, 4, 4),
        status: "done",
      },
      {
        n: 2,
        label: t.step2Label,
        detail: t.step2Detail,
        sig: shortenAddress(DISTRIBUTION_PDA, 4, 4),
        status: "done",
      },
      {
        n: 3,
        label: t.step3Label,
        detail: confirmed ? t.step3DetailDone : t.step3Detail,
        sig: confirmed ? shortenAddress(FAKE_RECEIPT_PDA, 4, 4) : undefined,
        status: confirmed ? "done" : "active",
      },
    ];
  }, [stage, t]);

  const isConfirmed = stage === "confirmed";
  const isDeclined = stage === "declined";

  // Build detail-card rows
  const rows = [
    { label: t.rowFrom, value: "LAZ Dompet Dhuafa Yogyakarta" },
    {
      label: t.rowPurpose,
      value: "biaya sekolah anak — sarah, kelas 8 SMP semester 2",
    },
    { label: t.rowDonor, value: "muzakki anonim · Singapore" },
    { label: t.rowDate, value: date },
    {
      label: t.rowCode,
      value: verificationCode,
      mono: true,
      accent: true,
    },
    {
      label: t.rowDonationPda,
      value: shortenAddress(DONATION_PDA, 6, 6),
      mono: true,
    },
    {
      label: t.rowDistributionPda,
      value: shortenAddress(DISTRIBUTION_PDA, 6, 6),
      mono: true,
    },
    {
      label: t.rowReceiptPda,
      value: isConfirmed
        ? `${shortenAddress(FAKE_RECEIPT_PDA, 6, 6)} · ${t.receiptIssuedSuffix}`
        : t.receiptPending,
      mono: true,
      accent: isConfirmed,
    },
  ];

  return (
    <MobileShell secureLabel={t.secure}>
      <main className="flex flex-1 flex-col gap-6 px-5.5 pt-6 pb-10">
        {/* Eyebrow + greeting */}
        <header className="flex flex-col gap-2">
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#14F195A6]">
            {isConfirmed ? t.successEyebrow : t.eyebrow}
          </span>
          <h1 className="m-0 whitespace-pre-wrap font-['Plus_Jakarta_Sans',system-ui,sans-serif] text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-text">
            {isConfirmed ? (
              t.successHeadline
            ) : (
              <>
                {t.greetingLine1}
                <br />
                {t.greetingLine2}
              </>
            )}
          </h1>
          {isConfirmed && (
            <p className="mt-1 text-[14px] leading-[1.55] text-[#EFEFE48C]">
              {t.successBody}
            </p>
          )}
        </header>

        {/* Detail card */}
        <DetailCard amountLabel={t.amountLabel} amount={800_000n} rows={rows} />

        {/* Vertical attestation chain */}
        <ChainVisualization eyebrow={t.chainEyebrow} steps={steps} />

        {/* Action area */}
        {!isConfirmed && !isDeclined && (
          <>
            <p className="px-1 text-[13px] leading-[1.6] text-[#EFEFE48C]">
              {t.consent}
            </p>
            <div className="mt-auto flex flex-col gap-2.5">
              <ConfirmButton
                variant="primary"
                onClick={() => setStage("confirmed")}
                leadingIcon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M5 10l3.5 3.5L15 7"
                      stroke="#181818"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                {t.acceptCta}
              </ConfirmButton>
              <ConfirmButton
                variant="outline"
                onClick={() => setStage("declined")}
              >
                {t.declineCta}
              </ConfirmButton>
            </div>
          </>
        )}

        {isDeclined && (
          <div className="mt-auto rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF06] px-4 py-4 text-[13px] leading-[1.55] text-[#EFEFE48C]">
            {t.declined}
          </div>
        )}

        {isConfirmed && (
          <div className="mt-2 flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {t.thanksLabel}
            </span>

            {thanksSent ? (
              <div
                className="flex items-center gap-2 rounded-[12px] border border-[#14F1952E] bg-[#14F1951A] px-4 py-3 font-mono text-[12px] text-[#14F195]"
                role="status"
              >
                {t.thanksSent}
              </div>
            ) : (
              <>
                <textarea
                  value={thanksMsg}
                  onChange={(e) => setThanksMsg(e.target.value.slice(0, 100))}
                  placeholder={t.thanksPlaceholder}
                  rows={3}
                  maxLength={100}
                  className="w-full resize-none rounded-[12px] border border-[#FFFFFF14] bg-[#FFFFFF06] px-4 py-3 text-[14px] leading-[1.5] text-text placeholder:text-[#EFEFE452] focus-visible:border-[#14F1952E] focus-visible:bg-[#14F19508] focus-visible:outline-none"
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#EFEFE452]">
                    {thanksMsg.length}/100
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setThanksSent(true)}
                      className="rounded-[10px] px-3.5 py-2 text-[13px] text-[#EFEFE48C] hover:text-text"
                    >
                      {t.thanksSkip}
                    </button>
                    <button
                      type="button"
                      onClick={() => setThanksSent(true)}
                      disabled={thanksMsg.trim().length === 0}
                      className="rounded-[10px] bg-[#14F195] px-4 py-2 text-[13px] font-medium text-[#181818] disabled:opacity-50"
                    >
                      {t.thanksSend}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-auto flex items-start gap-2 rounded-[10px] border border-[#FFFFFF0D] bg-[#FFFFFF06] px-3.5 py-3">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="mt-0.5 shrink-0"
          >
            <path
              d="M7 1l4 2v4c0 2.5-2 4.5-4 5-2-0.5-4-2.5-4-5V3l4-2z"
              stroke="#14F195A6"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
          <p className="m-0 font-mono text-[10px] leading-[1.5] text-[#EFEFE46B]">
            <span className="text-[#EFEFE48C]">code:</span> {tokenShort}
            <span className="px-1">·</span>
            {t.footer}
          </p>
        </div>
      </main>
    </MobileShell>
  );
}
