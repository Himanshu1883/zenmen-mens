import type { NextConfig } from "next";

const noStoreHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, no-cache, must-revalidate, max-age=0",
  },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

const nextConfig: NextConfig = {
  // Keep pdfkit out of the Turbopack/webpack bundle so AFM font files
  // resolve from real node_modules (fixes C:\\ROOT\\node_modules\\pdfkit\\...).
  serverExternalPackages: ["pdfkit", "fontkit"],
  outputFileTracingIncludes: {
    "/api/orders/*/invoice": [
      "./node_modules/pdfkit/js/data/**/*",
    ],
    "/api/**/*": ["./node_modules/pdfkit/js/data/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      { source: "/admin", headers: noStoreHeaders },
      { source: "/admin/:path*", headers: noStoreHeaders },
      { source: "/checkout", headers: noStoreHeaders },
      { source: "/checkout/:path*", headers: noStoreHeaders },
    ];
  },
};

export default nextConfig;
