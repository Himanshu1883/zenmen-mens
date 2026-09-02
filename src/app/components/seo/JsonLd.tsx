import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...data,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function organizationJsonLd(baseUrl: string, logoUrl: string) {
  return {
    "@type": "ClothingStore",
    "@id": `${baseUrl}/#store`,
    name: SITE_NAME,
    legalName: "ZENmen Bespoke Tailoring",
    url: baseUrl,
    image: logoUrl,
    logo: logoUrl,
    telephone: "+919650753273",
    email: "support@zenmen.in",
    priceRange: "₹₹₹",
    sameAs: ["https://www.instagram.com/_zenmen/"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "E-39, Lajpat Nagar II",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: "110024",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.5672,
      longitude: 77.2431,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  } as Record<string, unknown>;
}

export function websiteJsonLd(baseUrl: string) {
  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${baseUrl}/#store` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/collection?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  } as Record<string, unknown>;
}
