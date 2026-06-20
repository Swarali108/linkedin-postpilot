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
  accent: "#2563eb",
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
  const bg = dark ? "#0b1220" : "#f8fafc";
  const bg2 = dark ? "#131c2e" : "#eef2f7";
  const fg = dark ? "#f8fafc" : "#0f172a";
  const muted = dark ? "#94a3b8" : "#64748b";
  const accent = card.accent || "#2563eb";
  const points = (card.points ?? []).slice(0, 6);

  // Small decorative accent dots scattered for a designed, "pinteresty" feel.
  // Explicit top/left only (Satori errors on undefined style props).
  const dots = [
    { top: 160, left: 980, size: 18, o: 0.9 },
    { top: 240, left: 880, size: 10, o: 0.5 },
    { top: 130, left: 850, size: 8, o: 0.4 },
    { top: 770, left: 70, size: 14, o: 0.5 },
    { top: 830, left: 140, size: 8, o: 0.35 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "1200px",
          height: "1200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: bg,
          backgroundImage: `radial-gradient(circle at 82% 10%, ${accent}40, transparent 42%), radial-gradient(circle at 12% 95%, ${bg2}, transparent 55%)`,
          padding: "96px",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Decorative ring + dots */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            right: "-160px",
            width: "420px",
            height: "420px",
            borderRadius: "999px",
            border: `2px solid ${accent}40`,
            display: "flex",
          }}
        />
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${d.top}px`,
              left: `${d.left}px`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              borderRadius: "999px",
              backgroundColor: accent,
              opacity: d.o,
              display: "flex",
            }}
          />
        ))}

        {/* Top: brand chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            backgroundColor: `${accent}1f`,
            borderRadius: "999px",
            padding: "12px 24px",
            alignSelf: "flex-start",
          }}
        >
          <div style={{ display: "flex", width: "18px", height: "18px", borderRadius: "6px", backgroundColor: accent }} />
          <div style={{ display: "flex", fontSize: "26px", color: fg, fontWeight: 700, letterSpacing: "1px" }}>
            POSTPILOT
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: card.title.length > 24 ? "82px" : "104px",
              fontWeight: 800,
              color: fg,
              lineHeight: 1.04,
              letterSpacing: "-2px",
            }}
          >
            {card.title}
          </div>
          <div style={{ display: "flex", width: "120px", height: "10px", borderRadius: "6px", backgroundColor: accent, marginTop: "26px" }} />
          {card.subtitle ? (
            <div style={{ display: "flex", marginTop: "22px", fontSize: "36px", color: muted }}>
              {card.subtitle}
            </div>
          ) : null}
        </div>

        {/* Body */}
        {card.layout === "list" && points.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {points.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    border: `2px solid ${accent}`,
                    color: accent,
                    fontSize: "30px",
                    fontWeight: 800,
                  }}
                >
                  {String(i + 1)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    backgroundColor: `${accent}26`,
                    fontSize: "36px",
                  }}
                >
                  {p.icon || "•"}
                </div>
                <div style={{ display: "flex", fontSize: "44px", color: fg, fontWeight: 600 }}>
                  {p.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "140px", color: accent, fontWeight: 800, lineHeight: 0.7 }}>
              &ldquo;
            </div>
            <div style={{ display: "flex", fontSize: "58px", color: fg, fontWeight: 600, lineHeight: 1.22 }}>
              {card.quote || ""}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", width: "20px", height: "20px", borderRadius: "6px", backgroundColor: accent }} />
            <div style={{ display: "flex", fontSize: "28px", color: muted, fontWeight: 600 }}>
              Made with PostPilot
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[0.3, 0.6, 1].map((o, i) => (
              <div key={i} style={{ display: "flex", width: "14px", height: "14px", borderRadius: "999px", backgroundColor: accent, opacity: o }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 1200 }
  );
}
