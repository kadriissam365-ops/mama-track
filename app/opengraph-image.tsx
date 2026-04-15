import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MamaTrack — Votre compagnon de grossesse gratuit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 40%, #d1fae5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(244, 114, 182, 0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(167, 139, 250, 0.12)",
          }}
        />

        {/* Logo container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 130,
            height: 130,
            background: "linear-gradient(135deg, #f472b6, #a78bfa, #6ee7b7)",
            borderRadius: 36,
            marginBottom: 36,
            fontSize: 64,
            boxShadow: "0 20px 40px rgba(244, 114, 182, 0.3)",
          }}
        >
          🤰
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#3d2b2b",
            marginBottom: 12,
            letterSpacing: "-0.02em",
          }}
        >
          MamaTrack
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 30,
            color: "#6b7280",
            marginBottom: 12,
            fontWeight: 500,
          }}
        >
          Votre compagnon de grossesse gratuit
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "#9ca3af",
            marginBottom: 44,
          }}
        >
          Suivi semaine par semaine &bull; 10+ trackers &bull; Mode duo &bull; 250+ prenoms
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: 14,
          }}
        >
          {["📊 Trackers sante", "👶 Suivi bebe", "🤝 Mode duo", "📝 Projet naissance", "⏱️ Contractions"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(255,255,255,0.85)",
                  padding: "12px 22px",
                  borderRadius: 18,
                  fontSize: 17,
                  color: "#3d2b2b",
                  fontWeight: 600,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 26,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            color: "#d1d5db",
          }}
        >
          <span>mamatrack.fr</span>
          <span>&bull;</span>
          <span>100% gratuit, sans pub</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
