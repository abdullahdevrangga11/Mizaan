"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";

interface Step5Props {
  walletAddress: string | null;
  onMockConnect: (walletAddress: string) => void;
  onNext: () => void;
}

// TODO: wire real Phantom (`@solana/wallet-adapter-react`) + Privy
// (`@privy-io/react-auth`) — both deps already installed. The provider tree
// is owned by another agent (see CLAUDE.md `components/providers/`).
const FAKE_PHANTOM_WALLET = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const FAKE_PRIVY_WALLET = "PrvyEm1zFakebW2pNa8Jzm3xyK1d97TXJSDpbD5jBkhe";

export function Step5Wallet({
  walletAddress,
  onMockConnect,
  onNext,
}: Step5Props) {
  const t = useTranslations("donate.step5");
  const tBase = useTranslations("donate");

  if (walletAddress) {
    return (
      <div className="flex flex-col gap-8">
        <div className="card-mizaan flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
              {t("connectedAs")}
            </span>
            <span className="truncate font-mono text-[14px] text-text sm:text-[16px]">
              {shortenAddress(walletAddress, 8, 8)}
            </span>
          </div>
          <span className="chip chip-verified">connected</span>
        </div>

        <div className="flex justify-end">
          <Button size="lg" className="lowercase" onClick={onNext}>
            {tBase("next")} →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onMockConnect(FAKE_PHANTOM_WALLET)}
        className="lift card-neutral flex flex-col items-start gap-4 rounded-[16px] p-5 text-left sm:p-6"
      >
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] font-mono text-[12px] text-text-secondary"
        >
          Φ
        </span>
        <div className="flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold leading-tight tracking-tight text-text lowercase">
            {t("haveWalletTitle")}
          </h3>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            {t("haveWalletBody")}
          </p>
        </div>
        <span
          aria-hidden
          className="mt-auto pt-2 font-mono text-[11px] tracking-[0.04em] text-[var(--color-primary)] lowercase"
        >
          {t("haveWalletCta")} →
        </span>
      </button>

      <button
        type="button"
        onClick={() => onMockConnect(FAKE_PRIVY_WALLET)}
        className="lift card-neutral flex flex-col items-start gap-4 rounded-[16px] p-5 text-left sm:p-6"
      >
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] font-mono text-[12px] text-text-secondary"
        >
          @
        </span>
        <div className="flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold leading-tight tracking-tight text-text lowercase">
            {t("noWalletTitle")}
          </h3>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            {t("noWalletBody")}
          </p>
        </div>
        <span
          aria-hidden
          className="mt-auto pt-2 font-mono text-[11px] tracking-[0.04em] text-[var(--color-primary)] lowercase"
        >
          {t("noWalletCta")} →
        </span>
      </button>
    </div>
  );
}
