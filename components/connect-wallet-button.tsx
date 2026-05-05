"use client";

/**
 * Donor connect button — exposes both onboarding paths in one modal:
 *   - "i have a wallet"   → Phantom / Solflare via wallet-adapter
 *   - "sign in with email" → Privy embedded wallet (email + SMS)
 *
 * Once connected, displays the shortened address + IDRZ balance.
 */

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { formatRupiah, shortenAddress } from "@/lib/utils";
import { getIDRZBalance } from "@/lib/token/idrz";

export function ConnectWalletButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const wallet = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const privy = usePrivy();

  const phantomAddress = wallet.publicKey?.toBase58() ?? null;
  const privyAddress =
    privy.user?.wallet?.address && privy.user.wallet.chainType === "solana"
      ? privy.user.wallet.address
      : null;

  const activeAddress = phantomAddress ?? privyAddress;

  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    if (!activeAddress) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    getIDRZBalance(activeAddress)
      .then((value) => {
        if (!cancelled) setBalance(value);
      })
      .catch(() => {
        if (!cancelled) setBalance(0n);
      });
    return () => {
      cancelled = true;
    };
  }, [activeAddress]);

  if (activeAddress) {
    return (
      <div className="inline-flex items-center gap-2 rounded-[9px] border border-white/10 bg-white/5 px-3 h-10 text-sm">
        <span className="font-mono text-white/80">
          {shortenAddress(activeAddress)}
        </span>
        <span className="text-white/40">·</span>
        <span className="text-[var(--color-primary)]">
          {balance === null ? "…" : formatRupiah(balance)}
        </span>
        <button
          type="button"
          onClick={() => {
            if (phantomAddress) void wallet.disconnect();
            if (privyAddress) void privy.logout();
          }}
          className="ml-1 text-xs text-white/50 hover:text-white"
        >
          disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
        connect wallet
      </Button>
      {modalOpen ? (
        <ConnectModal
          onClose={() => setModalOpen(false)}
          onPickPhantom={() => {
            setModalOpen(false);
            setWalletModalVisible(true);
          }}
          onPickPrivy={() => {
            setModalOpen(false);
            void privy.login();
          }}
        />
      ) : null}
    </>
  );
}

interface ConnectModalProps {
  onClose: () => void;
  onPickPhantom: () => void;
  onPickPrivy: () => void;
}

function ConnectModal({ onClose, onPickPhantom, onPickPrivy }: ConnectModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[min(420px,calc(100vw-32px))] rounded-[18px] border border-white/10 bg-[var(--color-bg)] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-medium tracking-tight">connect to mizaan</h2>
        <p className="mt-1 text-sm text-white/60">
          choose how you want to donate.
        </p>

        <div className="mt-5 grid gap-2">
          <Button variant="outline" size="lg" onClick={onPickPhantom}>
            <span className="flex-1 text-left">i have a wallet</span>
            <span className="text-xs text-white/50">phantom · solflare</span>
          </Button>
          <Button variant="outline" size="lg" onClick={onPickPrivy}>
            <span className="flex-1 text-left">sign in with email</span>
            <span className="text-xs text-white/50">no wallet needed</span>
          </Button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-xs text-white/50 hover:text-white"
        >
          cancel
        </button>
      </div>
    </div>
  );
}
