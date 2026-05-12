import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mizaan — zakat with a receipt. On-chain transparency for zakat in Indonesia, built on Solana.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#181818",
          padding: "64px 72px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(239,239,228,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,239,228,0.06) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -200,
            top: 80,
            width: 700,
            height: 700,
            background:
              "radial-gradient(circle, rgba(20,241,149,0.18) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 28,
                height: 28,
                backgroundColor: "#14F195",
                borderRadius: 6,
              }}
            />
            <span
              style={{
                fontSize: 26,
                fontWeight: 500,
                color: "#efefe4",
                letterSpacing: "-0.02em",
              }}
            >
              mizaan
            </span>
          </div>
          <span
            style={{
              fontSize: 16,
              color: "rgba(239,239,228,0.5)",
              letterSpacing: "0.04em",
              fontFamily: "monospace",
            }}
          >
            // on-chain zakat layer
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            marginTop: 100,
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 18,
              color: "#14F195",
              letterSpacing: "0.04em",
              fontFamily: "monospace",
            }}
          >
            // every rupiah, a cryptographic receipt
          </span>
          <div
            style={{
              display: "flex",
              fontSize: 124,
              fontWeight: 500,
              color: "#efefe4",
              letterSpacing: "-0.04em",
              lineHeight: "92%",
            }}
          >
            zakat with a
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 124,
              fontWeight: 500,
              color: "#14F195",
              letterSpacing: "-0.04em",
              lineHeight: "92%",
            }}
          >
            receipt.
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 72,
            right: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              backgroundColor: "rgba(20,241,149,0.12)",
              border: "1px solid rgba(20,241,149,0.3)",
              borderRadius: 24,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#14F195",
                borderRadius: 50,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#14F195",
                letterSpacing: "0.04em",
                fontFamily: "monospace",
              }}
            >
              solana devnet · live
            </span>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "rgba(239,239,228,0.42)",
              fontFamily: "monospace",
              letterSpacing: "0.04em",
            }}
          >
            mizaan-ivory.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
