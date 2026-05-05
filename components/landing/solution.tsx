import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "satu produk · empat peran",
    headline: "untuk donor, untuk laz, untuk mustahik.",
    sub: "setiap peran punya tampilan yang dirancang khusus. wallet abstraksi otomatis sesuai konteks pengguna.",
    tabs: { lazAmil: "laz amil", donor: "donor", mustahik: "mustahik", verifier: "verifier" },
    chrome: "Bu Sri · Dompet Dhuafa Yogya",
    sidebar: {
      distribusi: "DISTRIBUSI",
      incoming: "incoming · 3",
      awaiting: "awaiting confirm · 8",
      completed: "completed · 247",
      mustahikRegistry: "mustahik (registry)",
      reporting: "REPORTING",
      monthly: "monthly summary",
      audit: "audit export",
    },
    form: {
      header: "DISTRIBUTION FORM · DONATION",
      from: "from 7xKX...bW2 (Sarah)",
      typeChip: "zakat mal",
      priorityChip: "prioritas: pendidikan",
      processCta: "process all distributions",
    },
    table: { mustahik: "MUSTAHIK", amount: "AMOUNT", category: "CATEGORY", purpose: "PURPOSE" },
    rows: [
      { name: "Pak Yusuf #1247", amount: "Rp 800,000", category: "pendidikan", purpose: "biaya sekolah anak SMP semester 2" },
      { name: "Bu Hadi #1248", amount: "Rp 1,200,000", category: "pendidikan", purpose: "biaya kuliah semester 4" },
      { name: "Pak Hasan #1251", amount: "Rp 600,000", category: "kesehatan", purpose: "biaya berobat" },
    ],
    addRow: "+ tambah mustahik...",
    total: "total · Rp 22,000,000 / Rp 22,000,000 ✓",
  },
  en: {
    eyebrow: "one product · four roles",
    headline: "for donors, for laz, for mustahik.",
    sub: "every role gets a purpose-built view. wallet abstraction adapts automatically to the user's context.",
    tabs: { lazAmil: "laz amil", donor: "donor", mustahik: "mustahik", verifier: "verifier" },
    chrome: "Bu Sri · Dompet Dhuafa Yogya",
    sidebar: {
      distribusi: "DISTRIBUTIONS",
      incoming: "incoming · 3",
      awaiting: "awaiting confirm · 8",
      completed: "completed · 247",
      mustahikRegistry: "mustahik (registry)",
      reporting: "REPORTING",
      monthly: "monthly summary",
      audit: "audit export",
    },
    form: {
      header: "DISTRIBUTION FORM · DONATION",
      from: "from 7xKX...bW2 (Sarah)",
      typeChip: "zakat mal",
      priorityChip: "priority: education",
      processCta: "process all distributions",
    },
    table: { mustahik: "MUSTAHIK", amount: "AMOUNT", category: "CATEGORY", purpose: "PURPOSE" },
    rows: [
      { name: "Pak Yusuf #1247", amount: "Rp 800,000", category: "education", purpose: "school fees · SMP semester 2" },
      { name: "Bu Hadi #1248", amount: "Rp 1,200,000", category: "education", purpose: "college tuition · semester 4" },
      { name: "Pak Hasan #1251", amount: "Rp 600,000", category: "health", purpose: "medical treatment" },
    ],
    addRow: "+ add mustahik...",
    total: "total · Rp 22,000,000 / Rp 22,000,000 ✓",
  },
} as const;

export function Solution({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section
      id="cara-kerja"
      className="flex flex-col items-center gap-8 border-t border-[#FFFFFF0D] bg-[#161616] px-5 pt-16 pb-16 sm:gap-10 sm:px-8 sm:pt-20 sm:pb-20 md:gap-11 md:px-12 md:pb-24 lg:gap-12 lg:px-20 lg:pb-30"
      style={{
        backgroundImage:
          "linear-gradient(in oklab 90deg, oklab(94.9% -0.004 0.014 / 3.5%) 0%, oklab(0% 0 .0001 / 0%) 100%), linear-gradient(in oklab 180deg, oklab(94.9% -0.004 0.014 / 3.5%) 0%, oklab(0% 0 .0001 / 0%) 100%)",
      }}
    >
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">{t.eyebrow}</p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
        <p className="m-0 max-w-[560px] text-[14px] leading-[155%] text-[#EFEFE48C] sm:text-[15px] md:text-[16px] lg:text-[17px]">{t.sub}</p>
      </div>

      <div className="flex w-full max-w-full items-center gap-0.5 overflow-x-auto rounded-[10px] border border-[#FFFFFF0F] bg-[#FFFFFF0A] p-1.25 md:w-auto md:overflow-visible">
        {[
          { label: t.tabs.lazAmil, active: true },
          { label: t.tabs.donor },
          { label: t.tabs.mustahik },
          { label: t.tabs.verifier },
        ].map((tab) => (
          <span
            key={tab.label}
            className={`flex shrink-0 items-center gap-2 rounded-[7px] px-3 py-1.5 text-[12px] leading-4 tracking-[-0.005em] sm:px-4 sm:py-1.75 sm:text-[13px] ${
              tab.active
                ? "border border-[#14F19533] bg-[#14F1951A] font-medium text-[#14F195]"
                : "text-[#EFEFE48C]"
            }`}
          >
            {tab.active && <span aria-hidden className="size-1.25 shrink-0 rounded-full bg-[#14F195]" />}
            {tab.label}
          </span>
        ))}
      </div>

      <div
        className="mx-auto flex w-full max-w-7xl flex-col overflow-clip rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A]"
        style={{ boxShadow: "0 30px 80px #00000099" }}
      >
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[#FFFFFF0F] bg-[#141414] px-3 sm:gap-2.5 sm:px-3.5">
          <div className="flex shrink-0 items-center gap-1.75">
            <span className="size-2.75 shrink-0 rounded-full bg-[#FF5F57]" />
            <span className="size-2.75 shrink-0 rounded-full bg-[#FFBD2E]" />
            <span className="size-2.75 shrink-0 rounded-full bg-[#28C941]" />
          </div>
          <span className="ml-2 min-w-0 flex-1 truncate font-mono text-[11px] leading-[14px] text-[#EFEFE46B] sm:ml-3.5">
            <span className="hidden sm:inline">laz.mizaan.id/admin/distribute/3xK7Pm9...f9Bm</span>
            <span className="sm:hidden">/admin/distribute</span>
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-2 rounded-[14px] border border-[#FFFFFF14] bg-[#FFFFFF0D] px-1.5 py-0.75 sm:px-2.5">
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-[5px] bg-[#14F195]">
              <span className="text-[10px] leading-3 font-bold text-[#181818]">B</span>
            </span>
            <span className="hidden text-[11px] leading-[14px] text-[#EFEFE4A6] sm:inline">{t.chrome}</span>
          </span>
        </div>

        <div className="flex min-h-[480px] bg-[#181818]">
          <aside className="hidden w-50 shrink-0 flex-col gap-0.75 border-r border-[#FFFFFF0D] bg-[#161616] px-3 py-4.5 lg:flex">
            <div className="mb-2 px-2.5">
              <span className="font-mono text-[10px] leading-3 tracking-[0.06em] text-[#EFEFE44D]">
                {t.sidebar.distribusi}
              </span>
            </div>
            <span className="flex items-center gap-2.25 rounded-[7px] border border-[#14F19529] bg-[#14F19514] px-2.5 py-1.75">
              <span className="size-1.5 shrink-0 rounded-full bg-[#14F195]" />
              <span className="text-xs leading-4 font-medium text-[#14F195]">{t.sidebar.incoming}</span>
            </span>
            {[t.sidebar.awaiting, t.sidebar.completed, t.sidebar.mustahikRegistry].map((label) => (
              <span key={label} className="rounded-[7px] px-2.5 py-1.75 text-xs leading-4 text-[#EFEFE48C]">
                {label}
              </span>
            ))}
            <div className="mt-3.5 mb-2 px-2.5">
              <span className="font-mono text-[10px] leading-3 tracking-[0.06em] text-[#EFEFE44D]">
                {t.sidebar.reporting}
              </span>
            </div>
            {[t.sidebar.monthly, t.sidebar.audit].map((label) => (
              <span key={label} className="rounded-[7px] px-2.5 py-1.75 text-xs leading-4 text-[#EFEFE48C]">
                {label}
              </span>
            ))}
          </aside>

          <div className="flex grow basis-0 flex-col gap-5 px-5 py-5 sm:gap-5.5 sm:px-7 sm:py-7 lg:px-8 lg:py-7.5">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#EFEFE44D]">
                  {t.form.header}
                </span>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-2 sm:gap-3.5">
                  <span className="text-[26px] font-medium leading-[100%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[30px] lg:text-[34px]">
                    Rp 22,000,000
                  </span>
                  <span className="font-mono text-[11px] leading-4 text-[#EFEFE46B] sm:text-xs">{t.form.from}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-[14px] border border-[#14F1952E] bg-[#14F19514] px-2.5 py-0.5 font-mono text-[10px] leading-3 font-medium text-[#14F195]">
                    {t.form.typeChip}
                  </span>
                  <span className="rounded-[14px] border border-[#FFFFFF14] bg-[#FFFFFF0A] px-2.5 py-0.5 font-mono text-[10px] leading-3 text-[#EFEFE48C]">
                    {t.form.priorityChip}
                  </span>
                </div>
              </div>
              <span className="flex h-8 shrink-0 items-center gap-2 rounded-lg bg-[#14F195] px-3.5 text-[12px] leading-4 font-medium text-[#181818] sm:text-[13px]">
                {t.form.processCta}
              </span>
            </div>

            {/* Wide form table — keeps fixed columns, scrolls horizontally inside its own card on narrow widths */}
            <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <div className="overflow-clip rounded-[10px] border border-[#FFFFFF12] min-w-[640px] sm:min-w-0">
              <div className="flex items-center gap-3.5 border-b border-[#FFFFFF0F] bg-[#FFFFFF06] px-4.5 py-2.75">
                <span className="w-35 shrink-0 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">{t.table.mustahik}</span>
                <span className="w-30 shrink-0 text-right font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">{t.table.amount}</span>
                <span className="w-30 shrink-0 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">{t.table.category}</span>
                <span className="grow basis-0 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">{t.table.purpose}</span>
              </div>
              {t.rows.map((row) => (
                <div key={row.name} className="flex items-center gap-3.5 border-b border-[#FFFFFF0A] px-4.5 py-3.25">
                  <span className="w-35 shrink-0 text-[13px] leading-4 text-[#EFEFE4]">{row.name}</span>
                  <span className="w-30 shrink-0 text-right text-[13px] leading-4 font-medium text-[#EFEFE4]">{row.amount}</span>
                  <span className="w-30 shrink-0 text-xs leading-4 text-[#EFEFE4A6]">{row.category}</span>
                  <span className="grow basis-0 text-xs leading-4 text-[#EFEFE48C]">{row.purpose}</span>
                </div>
              ))}
              <div className="flex items-center gap-3.5 bg-[#14F1950A] px-4.5 py-3.25">
                <span className="w-35 shrink-0 text-[13px] leading-4 text-[#EFEFE48C]">{t.addRow}</span>
                <span className="grow basis-0" />
                <span className="font-mono text-[11px] leading-[14px] text-[#14F195]">{t.total}</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
