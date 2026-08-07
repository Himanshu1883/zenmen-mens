import type { NextConfig } from "next";

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
};

export default nextConfig;
