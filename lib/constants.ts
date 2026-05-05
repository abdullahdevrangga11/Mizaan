import type {
  AsnafCategory,
  Category,
  DonationType,
  LazJurisdictionLevel,
  MustahikAgeRange,
} from "./types";

// ---------- Donation types ----------

export const DONATION_TYPES: DonationType[] = [
  "ZAKAT_MAL",
  "ZAKAT_FITRAH",
  "SEDEKAH",
  "INFAQ",
];

export const DONATION_TYPE_LABELS: Record<
  DonationType,
  { id: string; en: string; description: { id: string; en: string } }
> = {
  ZAKAT_MAL: {
    id: "Zakat Mal",
    en: "Zakat Mal",
    description: {
      id: "Zakat atas harta yang dimiliki minimal satu tahun (haul)",
      en: "Annual zakat on wealth held for one full year (haul)",
    },
  },
  ZAKAT_FITRAH: {
    id: "Zakat Fitrah",
    en: "Zakat Fitrah",
    description: {
      id: "Zakat menjelang Idul Fitri, wajib bagi setiap muslim",
      en: "Pre-Eid al-Fitr zakat, obligatory for every Muslim",
    },
  },
  SEDEKAH: {
    id: "Sedekah",
    en: "Sedekah",
    description: {
      id: "Donasi sukarela, kapan saja, jumlah berapa saja",
      en: "Voluntary donation, any time, any amount",
    },
  },
  INFAQ: {
    id: "Infaq",
    en: "Infaq",
    description: {
      id: "Donasi untuk masjid, pesantren, atau kegiatan keagamaan",
      en: "Donation to mosques, pesantren, or religious causes",
    },
  },
};

// ---------- Categories (donor preferences + LAZ tagging) ----------

export const DONOR_CATEGORY_PREFERENCES: Category[] = [
  "PENDIDIKAN",
  "KESEHATAN",
  "MODAL_USAHA",
  "SANDANG_PANGAN",
  "BIAYA_HIDUP",
  "BENCANA",
];

export const CATEGORY_LABELS: Record<Category, { id: string; en: string }> = {
  PENDIDIKAN: { id: "Pendidikan", en: "Education" },
  KESEHATAN: { id: "Kesehatan", en: "Health" },
  MODAL_USAHA: { id: "Modal usaha", en: "Business capital" },
  SANDANG_PANGAN: { id: "Sandang & pangan", en: "Clothing & food" },
  BIAYA_HIDUP: { id: "Biaya hidup", en: "Cost of living" },
  BENCANA: { id: "Bantuan bencana", en: "Disaster relief" },
  FAKIR_MISKIN: { id: "Fakir miskin", en: "Poor and needy" },
  MUALLAF: { id: "Muallaf", en: "New converts" },
  RIQAB: { id: "Riqab", en: "Bonded persons" },
  GHARIMIN: { id: "Gharimin", en: "Debtors" },
  FISABILILLAH: { id: "Fi sabilillah", en: "In the path of God" },
  IBNU_SABIL: { id: "Ibnu sabil", en: "Travelers in need" },
};

// ---------- Asnaf (8 Quranic categories) ----------

export const ASNAF: AsnafCategory[] = [
  "FAKIR",
  "MISKIN",
  "AMIL",
  "MUALLAF",
  "RIQAB",
  "GHARIMIN",
  "FISABILILLAH",
  "IBNU_SABIL",
];

export const ASNAF_LABELS: Record<
  AsnafCategory,
  { id: string; en: string; description: { id: string; en: string } }
> = {
  FAKIR: {
    id: "Fakir",
    en: "Fakir",
    description: {
      id: "Tidak memiliki harta dan tidak mampu bekerja",
      en: "Has no wealth and is unable to work",
    },
  },
  MISKIN: {
    id: "Miskin",
    en: "Miskin",
    description: {
      id: "Memiliki sedikit harta tapi tidak cukup untuk kebutuhan dasar",
      en: "Has some wealth but insufficient for basic needs",
    },
  },
  AMIL: {
    id: "Amil",
    en: "Amil",
    description: {
      id: "Petugas pengelola zakat",
      en: "Zakat administrators",
    },
  },
  MUALLAF: {
    id: "Muallaf",
    en: "Muallaf",
    description: {
      id: "Orang yang baru memeluk Islam",
      en: "New converts to Islam",
    },
  },
  RIQAB: {
    id: "Riqab",
    en: "Riqab",
    description: {
      id: "Pembebasan dari perbudakan modern (perdagangan manusia)",
      en: "Freeing from modern bondage (trafficking)",
    },
  },
  GHARIMIN: {
    id: "Gharimin",
    en: "Gharimin",
    description: {
      id: "Orang yang berhutang untuk kebutuhan halal",
      en: "Those in debt for legitimate needs",
    },
  },
  FISABILILLAH: {
    id: "Fi sabilillah",
    en: "Fi sabilillah",
    description: {
      id: "Untuk perjuangan di jalan Allah (pendidikan, dakwah)",
      en: "For striving in God's path (education, dakwah)",
    },
  },
  IBNU_SABIL: {
    id: "Ibnu sabil",
    en: "Ibnu sabil",
    description: {
      id: "Musafir yang kehabisan bekal",
      en: "Travelers stranded without resources",
    },
  },
};

// ---------- LAZ jurisdiction ----------

export const LAZ_JURISDICTION_LABELS: Record<
  LazJurisdictionLevel,
  { id: string; en: string }
> = {
  NATIONAL: { id: "Nasional", en: "National" },
  PROVINCIAL: { id: "Provinsi", en: "Provincial" },
  REGENCY: { id: "Kabupaten/Kota", en: "Regency / city" },
  MOSQUE: { id: "Masjid", en: "Mosque" },
};

// ---------- Mustahik age range ----------

export const AGE_RANGE_LABELS: Record<
  MustahikAgeRange,
  { id: string; en: string }
> = {
  CHILD: { id: "Anak (0–12)", en: "Child (0–12)" },
  TEEN: { id: "Remaja (13–19)", en: "Teen (13–19)" },
  ADULT: { id: "Dewasa (20–59)", en: "Adult (20–59)" },
  ELDER: { id: "Lansia (60+)", en: "Elder (60+)" },
};

// ---------- Zakat math ----------

/** Zakat Mal nisab — equivalent of 85g gold. Refreshed periodically.
 *  As of May 2026, gold ≈ Rp 1,250,000 / gram → 85g ≈ Rp 106,250,000.
 *  This is a default; real app should fetch live gold price. */
export const ZAKAT_MAL_NISAB_IDRZ: bigint = 106_250_000n;

/** Zakat rate: 2.5% (1/40). */
export const ZAKAT_RATE_BPS = 250; // basis points (250 / 10_000 = 2.5%)

/** Compute zakat mal owed at 2.5% (rounded down). Returns 0n if below nisab. */
export function calculateZakatMal(wealthIdrz: bigint): bigint {
  if (wealthIdrz < ZAKAT_MAL_NISAB_IDRZ) return 0n;
  return (wealthIdrz * BigInt(ZAKAT_RATE_BPS)) / 10_000n;
}

/** Zakat fitrah — 1 sha' of staple food (~2.5kg rice).
 *  Standard 2026 cash equivalent in Indonesia: Rp 45,000 / person. */
export const ZAKAT_FITRAH_PER_PERSON_IDRZ: bigint = 45_000n;

// ---------- Locale ----------

export const SUPPORTED_LOCALES = ["id", "en"] as const;
export const DEFAULT_LOCALE: SupportedLocale = "id";
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
