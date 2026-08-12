import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "MVella Studios — security-minded software, built and shipped";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph / Twitter share image — sticker logo on ink.
 */
export default async function OpenGraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/brand/mvella-logo-512.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={480}
          height={350}
          alt=""
          style={{ objectFit: "contain" }}
        />
        <div
          style={{
            marginTop: 40,
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
