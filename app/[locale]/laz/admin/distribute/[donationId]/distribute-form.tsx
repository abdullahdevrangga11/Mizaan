"use client";

/**
 * <DistributeForm />
 *
 * Interactive shell for the LAZ admin distribution flow (Bu Sri).
 * Holds the running distribution rows in client state with bigint amounts,
 * exposes the "+ tambah mustahik" details panel (picker + amount + category
 * + purpose + internal notes), and renders the bottom sign-and-process bar.
 *
 * The "process all distributions" CTA is intentionally a stub for V1 —
 * real wallet signing + SAS attestation comes later.
 */
import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  ASNAF_LABELS,
  type SupportedLocale,
} from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import type {
  AsnafCategory,
  Category,
  DonationType,
} from "@/lib/types";
import {
  DistributionRow,
  type DistributionRowData,
} from "@/components/laz-admin/distribution-row";
import {
  MustahikPicker,
  type PickerMustahik,
} from "@/components/laz-admin/mustahik-picker";
import { AmountAllocator } from "@/components/laz-admin/amount-allocator";

interface DistributeFormProps {
  locale: SupportedLocale;
  donation: {
    id: string;
    shortId: string;
    donorWallet: string;
    donorDisplayName: string;
    donationType: DonationType;
    amountIdrz: bigint;
    primaryCategory: Category;
  };
  initialRows: DistributionRowData[];
  pool: PickerMustahik[];
}

const ALLOCATABLE_CATEGORIES: Category[] = [
  "PENDIDIKAN",
  "KESEHATAN",
  "MODAL_USAHA",
  "SANDANG_PANGAN",
  "BIAYA_HIDUP",
  "BENCANA",
];

const ALLOCATABLE_ASNAF: AsnafCategory[] = [
  "FAKIR",
  "MISKIN",
  "MUALLAF",
  "GHARIMIN",
  "FISABILILLAH",
  "IBNU_SABIL",
];

const COPY = {
  eyebrow: {
    id: (id: string) => `// processing donation ${id}`,
    en: (id: string) => `// processing donation ${id}`,
  },
  headline: {
    id: (amt: string) => `distribusi ${amt}\nke mustahik terdaftar.`,
    en: (amt: string) => `distribute ${amt}\nto registered mustahik.`,
  },
  subheadline: {
    id: (donor: string, cat: string) =>
      `donor: ${donor} via Phantom · category preference: ${cat} · alokasikan ke mustahik dari registry, lalu tanda tangan distribusi.`,
    en: (donor: string, cat: string) =>
      `donor: ${donor} via Phantom · category preference: ${cat} · allocate to mustahik from the registry, then sign the distributions.`,
  },
  donationTypeLabel: {
    id: { ZAKAT_MAL: "zakat mal", ZAKAT_FITRAH: "zakat fitrah", SEDEKAH: "sedekah", INFAQ: "infaq" } satisfies Record<DonationType, string>,
    en: { ZAKAT_MAL: "zakat mal", ZAKAT_FITRAH: "zakat fitrah", SEDEKAH: "sedekah", INFAQ: "infaq" } satisfies Record<DonationType, string>,
  },
  remainingLabel: {
    id: "REMAINING TO ALLOCATE",
    en: "REMAINING TO ALLOCATE",
  },
  allocatedNote: {
    id: (alloc: string, total: string, pct: string) =>
      `${alloc} of ${total} allocated · ${pct}%`,
    en: (alloc: string, total: string, pct: string) =>
      `${alloc} of ${total} allocated · ${pct}%`,
  },
  tableHeaders: {
    id: {
      mustahik: "MUSTAHIK",
      amount: "AMOUNT",
      category: "CATEGORY",
      asnaf: "ASNAF",
      purpose: "PURPOSE",
      status: "STATUS",
    },
    en: {
      mustahik: "MUSTAHIK",
      amount: "AMOUNT",
      category: "CATEGORY",
      asnaf: "ASNAF",
      purpose: "PURPOSE",
      status: "STATUS",
    },
  },
  addPanel: {
    id: {
      title: "tambah alokasi mustahik",
      subtitle: "pilih dari registry · mizaan akan kirim sms konfirmasi setelah ditandatangani.",
      mustahikLabel: "MUSTAHIK",
      amountLabel: "AMOUNT (IDRZ)",
      categoryLabel: "CATEGORY",
      asnafLabel: "ASNAF",
      purposeLabel: "PURPOSE",
      purposePh: "contoh: biaya sekolah anak SMP semester 2",
      notesLabel: "INTERNAL NOTES",
      notesPh: "catatan internal — tidak dikirim ke mustahik atau on-chain.",
      addBtn: "tambahkan ke distribusi",
      remainingLabel: "sisa donasi setelah alokasi ini",
    },
    en: {
      title: "add mustahik allocation",
      subtitle: "pick from registry · mizaan will send confirmation sms after signing.",
      mustahikLabel: "MUSTAHIK",
      amountLabel: "AMOUNT (IDRZ)",
      categoryLabel: "CATEGORY",
      asnafLabel: "ASNAF",
      purposeLabel: "PURPOSE",
      purposePh: "e.g. school fees for grade 8 spring term",
      notesLabel: "INTERNAL NOTES",
      notesPh: "internal notes — not sent to mustahik or on-chain.",
      addBtn: "add to distributions",
      remainingLabel: "remaining after this allocation",
    },
  },
  addRowBanner: {
    id: (n: number) => `tambah mustahik dari registry · ${n} lainnya tersedia`,
    en: (n: number) => `add mustahik from registry · ${n} more available`,
  },
  filterChip: {
    id: (cat: string) => `filter: ${cat} ↗`,
    en: (cat: string) => `filter: ${cat} ↗`,
  },
  subtotalLabel: { id: "SUBTOTAL", en: "SUBTOTAL" },
  ofDonation: {
    id: (pct: string) => `${pct}% of donation`,
    en: (pct: string) => `${pct}% of donation`,
  },
  signEyebrow: { id: "SIGN & PROCESS", en: "SIGN & PROCESS" },
  signSubtitle: {
    id: (n: number) =>
      `${n} distributions · ${n} SAS attestations · ${n} IDRZ transfers · ${n} SMS terkirim`,
    en: (n: number) =>
      `${n} distributions · ${n} SAS attestations · ${n} IDRZ transfers · ${n} SMS dispatched`,
  },
  signSubtitleEmpty: {
    id: "alokasikan minimal satu mustahik untuk menandatangani.",
    en: "allocate at least one mustahik to sign.",
  },
  saveDraft: { id: "save as draft", en: "save as draft" },
  processCta: {
    id: (n: number) => `process all ${n} distributions`,
    en: (n: number) => `process all ${n} distributions`,
  },
  stubToast: {
    id: "demo: penandatanganan SAS akan ditambahkan di sprint berikutnya.",
    en: "demo: SAS signing wired in the next sprint.",
  },
  closeStub: { id: "tutup", en: "dismiss" },
  totalStrip: {
    id: (alloc: string, total: string) => `total alokasi · ${alloc} / ${total}`,
    en: (alloc: string, total: string) => `total allocated · ${alloc} / ${total}`,
  },
  fullyMatched: { id: "100% matched ✓", en: "100% matched ✓" },
  partial: { id: "partial", en: "partial" },
} as const;

export function DistributeForm({
  locale,
  donation,
  initialRows,
  pool,
}: DistributeFormProps) {
  const [rows, setRows] = useState<DistributionRowData[]>(initialRows);
  const [usedMustahikIds, setUsedMustahikIds] = useState<string[]>([]);

  // Add-row form state.
  const [pickerMustahik, setPickerMustahik] = useState<PickerMustahik | null>(
    null,
  );
  const [pendingAmount, setPendingAmount] = useState<bigint>(0n);
  const [pendingCategory, setPendingCategory] = useState<Category>(
    donation.primaryCategory,
  );
  const [pendingAsnaf, setPendingAsnaf] = useState<AsnafCategory>("MISKIN");
  const [pendingPurpose, setPendingPurpose] = useState("");
  const [pendingNotes, setPendingNotes] = useState("");
  const [stubOpen, setStubOpen] = useState(false);

  const allocated = useMemo(
    () => rows.reduce<bigint>((sum, r) => sum + r.amountIdrz, 0n),
    [rows],
  );
  const remaining = donation.amountIdrz - allocated;

  // Use Number only for percent display — bigint→number is bounded by Rp22M.
  const percentAllocated =
    donation.amountIdrz === 0n
      ? 0
      : Number((allocated * 1000n) / donation.amountIdrz) / 10;

  const remainingAfterPending = remaining - pendingAmount;
  const canAdd =
    pickerMustahik !== null &&
    pendingAmount > 0n &&
    pendingAmount <= remaining &&
    pendingPurpose.trim().length > 0;

  function handleAdd() {
    if (!canAdd || !pickerMustahik) return;

    const next: DistributionRowData = {
      index: rows.length + 1,
      mustahikLabel: `${pickerMustahik.fullDisplayName} ${pickerMustahik.internalId}`,
      mustahikRegionAge: `${pickerMustahik.region} · ${pickerMustahik.ageRange.toLowerCase()}`,
      amountIdrz: pendingAmount,
      category: pendingCategory,
      asnaf: pendingAsnaf,
      purpose: pendingPurpose.trim(),
      categoryTier:
        pendingCategory === donation.primaryCategory ? "primary" : "neutral",
      status: "ready",
    };

    setRows((prev) => [...prev, next]);
    setUsedMustahikIds((prev) => [...prev, pickerMustahik.id]);

    // Reset pending form.
    setPickerMustahik(null);
    setPendingAmount(0n);
    setPendingCategory(donation.primaryCategory);
    setPendingAsnaf("MISKIN");
    setPendingPurpose("");
    setPendingNotes("");
  }

  function handleRemove(idx: number) {
    setRows((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((r, i) => ({ ...r, index: i + 1 })),
    );
  }

  const headersCopy = COPY.tableHeaders[locale];
  const addCopy = COPY.addPanel[locale];
  const distributionTypeChip =
    COPY.donationTypeLabel[locale][donation.donationType];
  const primaryCategoryLabel = CATEGORY_LABELS[donation.primaryCategory][locale];

  return (
    <main className="flex min-w-0 grow basis-0 flex-col gap-6 px-5 pb-10 pt-6 sm:gap-7 sm:px-8 sm:pb-12 sm:pt-7.5">
      {/* ----------------- Donation summary ----------------- */}
      <section
        aria-labelledby="distribute-headline"
        className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:gap-8"
      >
        <div className="flex grow basis-0 flex-col gap-2">
          <p className="font-mono text-[10px] leading-3.5 tracking-[0.04em] text-[#EFEFE46B] sm:text-[11px]">
            {COPY.eyebrow[locale](donation.shortId)}
          </p>
          <h1
            id="distribute-headline"
            className="m-0 whitespace-pre-wrap text-[24px] leading-[105%] font-medium tracking-[-0.02em] text-[#EFEFE4] sm:text-[28px] md:text-[32px]"
          >
            {COPY.headline[locale](formatRupiah(donation.amountIdrz))}
          </h1>
          <p className="m-0 mt-1 max-w-[560px] text-[13px] leading-[155%] text-[#EFEFE48C] sm:text-sm">
            {COPY.subheadline[locale](
              donation.donorDisplayName,
              primaryCategoryLabel,
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-[14px] border border-[#14F1952E] bg-[#14F19514] px-2.5 py-0.5 font-mono text-[10px] leading-3 font-medium text-[#14F195]">
              {distributionTypeChip}
            </span>
            <span className="rounded-[14px] border border-[#FFFFFF14] bg-[#FFFFFF0A] px-2.5 py-0.5 font-mono text-[10px] leading-3 text-[#EFEFE48C]">
              prioritas: {primaryCategoryLabel.toLowerCase()}
            </span>
            <span className="max-w-full truncate rounded-[14px] border border-[#FFFFFF14] bg-[#FFFFFF0A] px-2.5 py-0.5 font-mono text-[10px] leading-3 text-[#EFEFE46B]">
              donor: {donation.donorWallet} ({donation.donorDisplayName})
            </span>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-start gap-2 sm:gap-2.5 lg:w-auto lg:items-end">
          <span className="font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
            {COPY.remainingLabel[locale]}
          </span>
          <span className="text-[28px] leading-[100%] font-medium tracking-[-0.025em] text-[#EFEFE4] sm:text-[32px] md:text-[36px]">
            {formatRupiah(remaining < 0n ? 0n : remaining)}
          </span>
          <span className="font-mono text-[10px] leading-3.5 text-[#EFEFE46B] sm:text-[11px]">
            {COPY.allocatedNote[locale](
              new Intl.NumberFormat("en-US").format(allocated),
              new Intl.NumberFormat("en-US").format(donation.amountIdrz),
              percentAllocated.toFixed(1),
            )}
          </span>
          <div className="h-1.25 w-full overflow-clip rounded-[3px] bg-[#FFFFFF0F] lg:w-70">
            <div
              className="h-full rounded-[3px] bg-[#14F195] transition-[width] duration-300"
              style={{ width: `${Math.min(100, percentAllocated)}%` }}
            />
          </div>
        </div>
      </section>

      {/* ----------------- Distribution table ----------------- */}
      <section
        aria-labelledby="distribute-table"
        className="-mx-5 overflow-x-auto sm:mx-0"
      >
        <div className="flex min-w-[760px] flex-col overflow-clip rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A] sm:min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3.5 border-b border-[#FFFFFF0F] bg-[#FFFFFF06] px-5.5 py-3.5">
            <span className="w-6 shrink-0" />
            <span className="w-50 shrink-0 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {headersCopy.mustahik}
            </span>
            <span className="w-35 shrink-0 text-right font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {headersCopy.amount}
            </span>
            <span className="w-35 shrink-0 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {headersCopy.category}
            </span>
            <span className="w-25 shrink-0 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {headersCopy.asnaf}
            </span>
            <span className="grow basis-0 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {headersCopy.purpose}
            </span>
            <span className="w-17.5 shrink-0 text-right font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {headersCopy.status}
            </span>
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div className="px-5.5 py-8 text-center text-xs leading-4 text-[#EFEFE46B]">
              {locale === "id"
                ? "belum ada alokasi. tambahkan mustahik di bawah."
                : "no allocations yet. add a mustahik below."}
            </div>
          ) : (
            rows.map((row, i) => (
              <DistributionRow
                key={`${row.mustahikLabel}-${i}`}
                row={row}
                locale={locale}
                onRemove={() => handleRemove(i)}
              />
            ))
          )}

          {/* Add row banner */}
          <div className="flex items-center gap-3.5 border-b border-[#FFFFFF0A] bg-[#14F19506] px-5.5 py-4.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-[#14F19566]">
              <span className="font-mono text-sm leading-[18px] text-[#14F195]">
                +
              </span>
            </span>
            <span className="grow basis-0 text-[13px] leading-4 text-[#14F195]">
              {COPY.addRowBanner[locale](pool.length - usedMustahikIds.length)}
            </span>
            <span className="font-mono text-[11px] leading-3.5 text-[#14F195A6]">
              {COPY.filterChip[locale](primaryCategoryLabel.toLowerCase())}
            </span>
          </div>

          {/* Subtotal */}
          <div className="flex items-center gap-3.5 bg-[#141414] px-5.5 py-4">
            <span className="w-6 shrink-0" />
            <span className="w-50 shrink-0 font-mono text-[11px] leading-3.5 tracking-[0.05em] text-[#EFEFE46B]">
              {COPY.subtotalLabel[locale]}
            </span>
            <span className="w-35 shrink-0 text-right text-base leading-5 font-medium text-[#EFEFE4]">
              {formatRupiah(allocated)}
            </span>
            <span className="grow basis-0" />
            <span className="font-mono text-[11px] leading-3.5 text-[#EFEFE46B]">
              {COPY.ofDonation[locale](percentAllocated.toFixed(1))}
            </span>
          </div>
        </div>
      </section>

      {/* ----------------- Add allocation panel ----------------- */}
      <section
        aria-labelledby="distribute-add"
        className="flex flex-col gap-5 rounded-[14px] border border-[#FFFFFF0F] bg-[#1A1A1A] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-1">
            <h2
              id="distribute-add"
              className="m-0 text-[18px] leading-[120%] font-medium tracking-[-0.015em] text-[#EFEFE4] sm:text-[20px]"
            >
              {addCopy.title}
            </h2>
            <p className="m-0 text-[11px] leading-4 text-[#EFEFE48C] sm:text-xs">
              {addCopy.subtitle}
            </p>
          </div>
          <span className="font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
            {addCopy.remainingLabel} ·{" "}
            <span className="text-[#EFEFE4]">
              {formatRupiah(remainingAfterPending < 0n ? 0n : remainingAfterPending)}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5">
            <FieldLabel>{addCopy.mustahikLabel}</FieldLabel>
            <MustahikPicker
              pool={pool}
              selectedId={pickerMustahik?.id ?? null}
              excludeIds={usedMustahikIds}
              locale={locale}
              onSelect={(m) => {
                setPickerMustahik(m);
                // Smart-fill asnaf from the picker selection so amil isn't typing twice.
                setPendingAsnaf(m.asnaf);
              }}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <AmountAllocator
              value={pendingAmount}
              onChange={setPendingAmount}
              remaining={remaining < 0n ? 0n : remaining}
              locale={locale}
              label={addCopy.amountLabel}
            />
          </div>
          <div className="col-span-6 lg:col-span-2">
            <FieldLabel>{addCopy.categoryLabel}</FieldLabel>
            <Select
              value={pendingCategory}
              onChange={(v) => setPendingCategory(v as Category)}
              options={ALLOCATABLE_CATEGORIES.map((c) => ({
                value: c,
                label: CATEGORY_LABELS[c][locale],
              }))}
            />
          </div>
          <div className="col-span-6 lg:col-span-2">
            <FieldLabel>{addCopy.asnafLabel}</FieldLabel>
            <Select
              value={pendingAsnaf}
              onChange={(v) => setPendingAsnaf(v as AsnafCategory)}
              options={ALLOCATABLE_ASNAF.map((a) => ({
                value: a,
                label: ASNAF_LABELS[a][locale],
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <FieldLabel>{addCopy.purposeLabel}</FieldLabel>
            <textarea
              value={pendingPurpose}
              onChange={(e) => setPendingPurpose(e.target.value)}
              placeholder={addCopy.purposePh}
              rows={3}
              className="w-full resize-none rounded-[10px] border border-[#FFFFFF12] bg-[#181818] px-3.5 py-2.75 text-[13px] leading-[155%] text-[#EFEFE4] outline-none transition-colors placeholder:text-[#EFEFE452] focus:border-[#14F1952E]"
            />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <FieldLabel>{addCopy.notesLabel}</FieldLabel>
            <textarea
              value={pendingNotes}
              onChange={(e) => setPendingNotes(e.target.value)}
              placeholder={addCopy.notesPh}
              rows={3}
              className="w-full resize-none rounded-[10px] border border-[#FFFFFF12] bg-[#181818] px-3.5 py-2.75 text-[13px] leading-[155%] text-[#EFEFE4] outline-none transition-colors placeholder:text-[#EFEFE452] focus:border-[#FFFFFF1F]"
            />
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center sm:gap-2.5">
          <span className="grow basis-0 font-mono text-[10px] leading-3 text-[#EFEFE46B]">
            {locale === "id"
              ? "// catatan internal tidak masuk on-chain · purpose dimasukkan ke SAS attestation."
              : "// internal notes stay off-chain · purpose is written to the SAS attestation."}
          </span>
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-[10px] bg-[#14F195] px-4 py-2.5 text-[13px] leading-4 font-medium tracking-[-0.005em] text-[#181818] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{addCopy.addBtn}</span>
            <span aria-hidden>↗</span>
          </button>
        </div>
      </section>

      {/* ----------------- Sign & process strip ----------------- */}
      <section
        aria-labelledby="distribute-sign"
        className="flex flex-col gap-4 rounded-[14px] border border-[#14F19529] bg-[#1A1A1A] px-4 py-4 sm:px-6 sm:py-4.5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between"
        style={{
          backgroundImage:
            "linear-gradient(in oklab 180deg, oklab(84.4% -0.183 0.078 / 4%) 0%, oklab(0% -.0001 0 / 0%) 50%)",
          boxShadow: "inset 0 1px 0 rgba(20,241,149,0.18)",
        }}
      >
        <div className="flex flex-col gap-1">
          <span
            id="distribute-sign"
            className="font-mono text-[10px] leading-3.5 tracking-[0.04em] text-[#EFEFE46B] sm:text-[11px]"
          >
            {COPY.signEyebrow[locale]}
          </span>
          <span className="text-[13px] leading-[18px] text-[#EFEFE4D9] sm:text-sm">
            {rows.length === 0
              ? COPY.signSubtitleEmpty[locale]
              : COPY.signSubtitle[locale](rows.length)}
          </span>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-2.5">
          <button
            type="button"
            disabled={rows.length === 0}
            className="flex h-10.5 items-center justify-center gap-2 rounded-[10px] border border-[#FFFFFF1A] px-4.5 text-[13px] leading-4 text-[#EFEFE4A6] transition-colors hover:text-[#EFEFE4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {COPY.saveDraft[locale]}
          </button>
          <button
            type="button"
            disabled={rows.length === 0}
            onClick={() => setStubOpen(true)}
            className="flex h-10.5 items-center justify-center gap-2 rounded-[10px] bg-[#14F195] px-5.5 text-sm leading-[18px] font-medium tracking-[-0.005em] text-[#181818] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ boxShadow: "0 4px 16px rgba(20,241,149,0.2)" }}
          >
            <span>{COPY.processCta[locale](Math.max(1, rows.length))}</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      </section>

      {/* ----------------- Footer running total ----------------- */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#FFFFFF0F] pt-5 font-mono text-[11px] leading-3.5 text-[#EFEFE46B]">
        <span>
          {COPY.totalStrip[locale](
            formatRupiah(allocated),
            formatRupiah(donation.amountIdrz),
          )}
        </span>
        <span className={remaining === 0n ? "text-[#14F195]" : "text-[#EFEFE48C]"}>
          {remaining === 0n
            ? COPY.fullyMatched[locale]
            : `${COPY.partial[locale]} · ${percentAllocated.toFixed(1)}%`}
        </span>
      </footer>

      {/* ----------------- Stub toast ----------------- */}
      {stubOpen ? (
        <div
          role="alertdialog"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 flex items-start gap-3 rounded-[12px] border border-[#FFFFFF12] bg-[#1A1A1A] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm"
        >
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#14F1951A] text-[#14F195]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M3 7l3 3 5-6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="flex grow basis-0 flex-col gap-1">
            <span className="text-[13px] leading-4 font-medium text-[#EFEFE4]">
              {COPY.stubToast[locale]}
            </span>
            <button
              type="button"
              onClick={() => setStubOpen(false)}
              className="self-start font-mono text-[10px] leading-3 text-[#14F195] transition-opacity hover:opacity-80"
            >
              {COPY.closeStub[locale]} ↗
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
      {children}
    </span>
  );
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
}

function Select<T extends string>({ value, onChange, options }: SelectProps<T>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none rounded-[10px] border border-[#FFFFFF12] bg-[#181818] px-3.5 py-2.75 pr-9 text-[13px] leading-4 text-[#EFEFE4] outline-none transition-colors hover:border-[#FFFFFF1F] focus:border-[#14F1952E]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#181818]">
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
      >
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="#EFEFE46B"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
