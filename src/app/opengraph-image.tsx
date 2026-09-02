import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "ZENmen — Bespoke Tailoring, New Delhi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "public", "logo_zenmen.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={240} height={240} alt="" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 48,
            maxWidth: 640,
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-1px" }}>
            ZENmen
          </div>
          <div style={{ fontSize: 28, opacity: 0.78, marginTop: 16 }}>
            Bespoke Tailoring, New Delhi
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
