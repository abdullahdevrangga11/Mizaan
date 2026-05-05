"use client";

/**
 * Solana wallet adapter provider chain.
 *
 * NOTE: the wallet-adapter UI styles are not imported here — Tailwind v4 owns
 * the global stylesheet and we re-skin the modal with our design tokens. If
 * you need the stock styling for a quick visual check, add this to
 * `app/layout.tsx` (NOT this file):
 *
 *   import "@solana/wallet-adapter-react-ui/styles.css";
 */

import { useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

interface Props {
  children: ReactNode;
}

// Public Solana devnet endpoint — fallback when NEXT_PUBLIC_SOLANA_RPC_URL
// isn't provisioned. Rate-limited; for serious work set up Helius.
const PUBLIC_DEVNET = "https://api.devnet.solana.com";

export function SolanaProvider({ children }: Props) {
  const fromEnv = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const endpoint =
    fromEnv && /^https?:\/\//.test(fromEnv) ? fromEnv : PUBLIC_DEVNET;

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
