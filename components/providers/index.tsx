"use client";

/**
 * Single mount point for every client-side provider.
 *
 * Order matters:
 *   1. SolanaProvider — owns the RPC connection used by everything below
 *   2. PrivyProvider  — embedded wallets resolve against the Solana endpoint
 *   3. Toaster        — sonner toasts must sit inside the React tree but
 *                       can render anywhere; placed last so providers above
 *                       can fire toasts during init
 */

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { SolanaProvider } from "./solana-provider";
import { PrivyProvider } from "./privy-provider";
import { SmoothScroll } from "./smooth-scroll";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <SmoothScroll>
      <SolanaProvider>
        <PrivyProvider>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            richColors
            closeButton
          />
        </PrivyProvider>
      </SolanaProvider>
    </SmoothScroll>
  );
}
