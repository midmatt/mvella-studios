import { ImageResponse } from "next/og";

export const alt = "MVella Studios — security-minded software, built and shipped";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph / Twitter share image — ambigram-style wordmark on ink.
 * One strong default for v1; per-route images can land later.
 */
export default function OpenGraphImage() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            letterSpacing: "0.18em",
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1.1,
          }}
        >
          <div style={{ display: "flex" }}>MVELLA</div>
          <div
            style={{
              display: "flex",
              transform: "rotate(180deg)",
              marginTop: 8,
            }}
          >
            STUDIOS
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#7CFFB2",
            fontFamily: "Courier New, monospace",
          }}
        >
          security-minded software · built and shipped
        </div>
      </div>
    ),
    { ...size }
  );
}
