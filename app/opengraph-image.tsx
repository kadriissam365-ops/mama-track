import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MamaTrack — Votre compagnon de grossesse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #d1fae5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            background: "linear-gradient(135deg, #f472b6, #a78bfa)",
            borderRadius: 32,
            marginBottom: 32,
            fontSize: 60,
          }}
        >
          🤰
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#3d2b2b",
            marginBottom: 16,
          }}
        >
          MamaTrack
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#6b7280",
            marginBottom: 8,
          }}
        >
          Votre compagnon de grossesse
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#9ca3af",
            marginBottom: 40,
          }}
        >
          100% gratuit · Sans pub · Mode duo · 250+ prénoms
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["📊 10 trackers", "👶 Suivi semaine", "🤝 Mode duo", "📝 Projet naissance"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(255,255,255,0.8)",
                  padding: "10px 20px",
                  borderRadius: 16,
                  fontSize: 18,
                  color: "#3d2b2b",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 16,
            color: "#d1d5db",
          }}
        >
          mamatrack.fr
        </div>
      </div>
    ),
    { ...size }
  );
}
