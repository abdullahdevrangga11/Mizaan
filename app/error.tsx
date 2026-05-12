"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[mizaan] route error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          backgroundColor: "#181818",
          color: "#efefe4",
          fontFamily:
            "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(239,239,228,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,239,228,0.06) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            maxWidth: "640px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "#EF4444",
            }}
          >
            // error · unexpected
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 500,
              letterSpacing: "-0.035em",
              lineHeight: "95%",
            }}
          >
            something broke on chain.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              lineHeight: "150%",
              color: "rgba(239,239,228,0.65)",
              maxWidth: "480px",
            }}
          >
            an unexpected error reached the surface. it&apos;s been logged.
            you can retry below — if it persists, the rpc or supabase may be
            having a moment.
          </p>
          {error.digest && (
            <code
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: "11px",
                color: "rgba(239,239,228,0.42)",
                padding: "6px 12px",
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: "6px",
              }}
            >
              digest · {error.digest}
            </code>
          )}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 22px",
                backgroundColor: "rgba(20,241,149,0.12)",
                border: "1px solid rgba(20,241,149,0.3)",
                borderRadius: "12px",
                color: "#14F195",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              retry
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 22px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                color: "rgba(239,239,228,0.82)",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textDecoration: "none",
              }}
            >
              back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
