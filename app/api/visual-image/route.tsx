import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import type { VisualCard } from "@/lib/types";

export const runtime = "edge";

// Unicode-safe base64 decode (emoji-friendly), matching the client encoder.
function decodeSpec(b64: string): VisualCard {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as VisualCard;
}

const FALLBACK: VisualCard = {
  title: "LinkedIn PostPilot",
  layout: "quote",
  quote: "Your post visual will appear here.",
  accent: "#0a66c2",
  theme: "dark",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("spec");
  let card: VisualCard = FALLBACK;
  try {
    if (raw) card = decodeSpec(raw);
  } catch {
    card = FALLBACK;
  }

  const dark = card.theme !== "light";
  const bg = dark ? "#0b1220" : "#ffffff";
  const fg = dark ? "#f8fafc" : "#0f172a";
  const muted = dark ? "#94a3b8" : "#475569";
  const accent = card.accent || "#0a66c2";
  const points = (card.points ?? []).slice(0, 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "1200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: bg,
          backgroundImage: `radial-gradient(circle at 85% 12%, ${accent}33, transparent 45%)`,
          padding: "90px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent bar */}
        <div style={{ display: "flex", width: "140px", height: "14px", borderRadius: "8px", backgroundColor: accent }} />

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: card.title.length > 22 ? "88px" : "108px",
              fontWeight: 800,
              color: fg,
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            {card.title}
          </div>
          {card.subtitle ? (
            <div style={{ display: "flex", marginTop: "20px", fontSize: "38px", color: muted }}>
              {card.subtitle}
            </div>
          ) : null}
        </div>

        {/* Body: list rows or quote */}
        {card.layout === "list" && points.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
            {points.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "74px",
                    height: "74px",
                    borderRadius: "18px",
                    backgroundColor: `${accent}26`,
                    fontSize: "40px",
                  }}
                >
                  {p.icon || "•"}
                </div>
                <div style={{ display: "flex", fontSize: "46px", color: fg, fontWeight: 600 }}>
                  {p.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "120px", color: accent, fontWeight: 800, lineHeight: 0.8 }}>
              &ldquo;
            </div>
            <div style={{ display: "flex", fontSize: "56px", color: fg, fontWeight: 600, lineHeight: 1.25 }}>
              {card.quote || ""}
            </div>
          </div>
        )}

        {/* Footer wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", width: "20px", height: "20px", borderRadius: "6px", backgroundColor: accent }} />
          <div style={{ display: "flex", fontSize: "30px", color: muted, fontWeight: 600 }}>
            LinkedIn PostPilot
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 1200 }
  );
}
