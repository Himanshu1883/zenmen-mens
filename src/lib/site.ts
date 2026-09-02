export const SITE_NAME = "ZENmen";
export const SITE_TAGLINE = "Bespoke Tailoring, New Delhi";
export const SITE_DESCRIPTION =
  "Crafted for the Modern Gentleman. Bespoke suits, sherwanis, Indo-Western, shirts and trousers from our Lajpat Nagar atelier in New Delhi.";
export const SITE_LOGO_PATH = "/logo_zenmen.png";
export const SITE_INSTAGRAM = "https://www.instagram.com/_zenmen/";
export const SITE_PHONE = "+919650753273";
export const SITE_STREET = "E-39, Lajpat Nagar II";
export const SITE_LOCALITY = "New Delhi";
export const SITE_REGION = "Delhi";
export const SITE_COUNTRY = "IN";

function stripSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripSlash(explicit);

  const auth = stripSlash(process.env.NEXTAUTH_URL ?? "");
  const isLocal = /localhost|127\.0\.0\.1/i.test(auth);
  if (auth && !isLocal) return auth;

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "https://zenmen.in";
  }

  return auth || "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const prefix = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${prefix}`;
}
