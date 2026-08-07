import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon — full mirrored wordmark on ink, readable at 180px. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0B0A",
          color: "#F6F5EF",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 700,
          letterSpacing: "0.08em",
          fontSize: 28,
          lineHeight: 1.15,
        }}
      >
        <div style={{ display: "flex" }}>MVELLA</div>
        <div
          style={{
            display: "flex",
            transform: "rotate(180deg)",
            marginTop: 4,
          }}
        >
          STUDIOS
        </div>
      </div>
    ),
    { ...size },
  );
}
