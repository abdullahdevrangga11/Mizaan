"use client";

/**
 * Privy embedded-wallet provider.
 *
 * Configured for the non-crypto donor flow (SRS §9.1):
 *   - email + SMS login
 *   - automatic Solana embedded wallet creation on first login
 *   - no signature prompts — Privy signs server-side via the user's session
 *
 * The Solana RPC for embedded wallets is read from `NEXT_PUBLIC_SOLANA_RPC_URL`
 * to keep it consistent with the wallet-adapter side.
 */

import type { ReactNode } from "react";
import { PrivyProvider as PrivyClient } from "@privy-io/react-auth";

interface Props {
  children: ReactNode;
}

export function PrivyProvider({ children }: Props) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) {
    // Fail soft in dev so the page still renders with just Phantom.
    if (typeof window !== "undefined") {
      console.warn(
        "[mizaan] NEXT_PUBLIC_PRIVY_APP_ID missing — embedded-wallet login disabled",
      );
    }
    return <>{children}</>;
  }

  return (
    <PrivyClient
      appId={appId}
      config={{
        loginMethods: ["email", "sms"],
        embeddedWallets: {
          // Privy v3 splits the createOnLogin policy per chain.
          ethereum: { createOnLogin: "off" },
          solana: { createOnLogin: "users-without-wallets" },
        },
        appearance: {
          theme: "dark",
          accentColor: "#14F195",
          showWalletLoginFirst: false,
          walletChainType: "solana-only",
        },
        // Privy v3: Solana RPC is now configured per-wallet at sign time
        // rather than via a global cluster list. The provider inherits the
        // <ConnectionProvider> endpoint mounted in components/providers/solana-provider.tsx.
      }}
    >
      {children}
    </PrivyClient>
  );
}
