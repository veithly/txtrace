import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TxTrace — turn a failed Sui digest into a fix in 5 seconds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(120% 90% at 90% 90%, #3b0764 0%, #0b1220 55%, #020617 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
            <rect x="12" y="12" width="14" height="14" rx="2" fill="#a855f7" opacity="0.85"/>
            <rect x="30" y="12" width="14" height="14" rx="2" fill="#a855f7" opacity="0.55"/>
            <rect x="12" y="30" width="14" height="14" rx="2" fill="#a855f7" opacity="0.55"/>
            <rect x="30" y="30" width="14" height="14" rx="2" fill="#facc15"/>
            <circle cx="42" cy="42" r="13" fill="none" stroke="#facc15" strokeWidth="3.4"/>
            <line x1="51.3" y1="51.3" x2="58" y2="58" stroke="#facc15" strokeWidth="3.4" strokeLinecap="round"/>
          </svg>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1.5 }}>TxTrace</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98 }}>
            Paste a failed digest,
          </div>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: "#a855f7" }}>
            ship the fix in 5s.
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", maxWidth: 920 }}>
            Step-by-step PTB trace, the failing op highlighted, and an AI root-cause explanation — all in one paste.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8", fontSize: 22 }}>
          <div style={{ display: "flex", gap: 32 }}>
            <span>· Sui Testnet</span>
            <span>· Move + PTB aware</span>
            <span>· Failing-step pinpoint</span>
          </div>
          <div style={{ fontFamily: "monospace", color: "#facc15" }}>txtrace.dev</div>
        </div>
      </div>
    ),
    size,
  );
}
