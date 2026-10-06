import { ImageResponse } from "next/og";
export const runtime = "nodejs";
export const alt =
  "MamaTrack · Votre grande aventure, de la grossesse aux 6 ans";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f8f5ed",
          color: "#274c40",
          display: "flex",
          padding: "65px 75px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 35,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 50,
              height: 50,
              borderRadius: 17,
              background: "#274c40",
              color: "#dce6ce",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            m
          </div>
          MamaTrack.
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            lineHeight: 1.1,
            letterSpacing: -3,
          }}
        >
          <span>Leur petite vie.</span>
          <span style={{ color: "#a75639" }}>Votre grande aventure.</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            fontSize: 25,
          }}
        >
          <span>Grossesse</span>
          <span>→</span>
          <span>0–3 ans</span>
          <span>→</span>
          <span>3–6 ans</span>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              background: "#dce6ce",
              padding: "17px 25px",
              borderRadius: 40,
              fontSize: 20,
            }}
          >
            Un seul carnet. Toute votre histoire.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
