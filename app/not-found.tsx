import Link from "next/link";

export default function NotFound() {
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
            maxWidth: "560px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "#14F195",
            }}
          >
            // error · 404
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(56px, 10vw, 120px)",
              fontWeight: 500,
              letterSpacing: "-0.035em",
              lineHeight: "95%",
            }}
          >
            this trail doesn&apos;t exist.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              lineHeight: "150%",
              color: "rgba(239,239,228,0.65)",
              maxWidth: "440px",
            }}
          >
            the page, donation, or attestation you&apos;re looking for is
            either typo&apos;d or hasn&apos;t been minted yet.
          </p>
          <Link
            href="/"
            style={{
              marginTop: "8px",
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
              textDecoration: "none",
            }}
          >
            <span>← back to home</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
