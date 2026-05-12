"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({ locale }: { locale: "id" | "en" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — we still navigate away
    }
    router.replace(`/${locale}/laz/login`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className="self-start font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE466] underline decoration-1 underline-offset-2 transition-colors hover:text-[#EFEFE4] disabled:opacity-50 sm:self-end"
    >
      {busy
        ? locale === "id"
          ? "keluar..."
          : "signing out..."
        : locale === "id"
          ? "keluar"
          : "sign out"}
    </button>
  );
}
