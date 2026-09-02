import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Bespoke Tailoring`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/logo_zenmen.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
