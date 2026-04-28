"use client";

import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";

type DemoProduct = {
  id: number;
  name: string;
  fit: string;
  price: string;
  images: [string, string];
  badge?: string;
};

const demoProducts: DemoProduct[] = [
  {
    id: 1,
    name: "Midnight Peak Blazer",
    fit: "Slim Fit",
    price: "Rs. 8,990",
    badge: "New",
    images: [
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 2,
    name: "Stoneline Double Suit",
    fit: "Classic Fit",
    price: "Rs. 11,490",
    badge: "Best Seller",
    images: [
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 3,
    name: "Ivory Ceremony Set",
    fit: "Tailored Fit",
    price: "Rs. 10,790",
    images: [
      "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 4,
    name: "Urban Noir Tux",
    fit: "Modern Fit",
    price: "Rs. 13,290",
    images: [
      "/new.jpg",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 5,
    name: "Monarch Linen Suit",
    fit: "Relaxed Fit",
    price: "Rs. 9,490",
    badge: "Limited",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 6,
    name: "Ashmark Wedding Suit",
    fit: "Tailored Fit",
    price: "Rs. 12,990",
    images: [
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 7,
    name: "Golden Hour Bandhgala",
    fit: "Structured Fit",
    price: "Rs. 14,190",
    images: [
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 8,
    name: "Charcoal Precision Set",
    fit: "Classic Fit",
    price: "Rs. 10,490",
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 9,
    name: "Riviera Summer Blazer",
    fit: "Slim Fit",
    price: "Rs. 7,990",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 10,
    name: "Royal Ink 3-Piece",
    fit: "Signature Fit",
    price: "Rs. 15,290",
    badge: "Premium",
    images: [
      "https://images.unsplash.com/photo-1520367745676-159420ff8e6f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 11,
    name: "Graphite Evening Suit",
    fit: "Modern Fit",
    price: "Rs. 11,990",
    images: [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 12,
    name: "Velvet Night Jacket",
    fit: "Luxury Fit",
    price: "Rs. 13,790",
    images: [
      "https://images.unsplash.com/photo-1591729652476-67dd45a4f4a3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export default function CollectionPage() {
  const initialIndexes = useMemo(
    () =>
      demoProducts.reduce<Record<number, number>>((acc, item) => {
        acc[item.id] = 0;
        return acc;
      }, {}),
    [],
  );
  const [activeImage, setActiveImage] =
    useState<Record<number, number>>(initialIndexes);

  const switchImage = (id: number, dir: "prev" | "next") => {
    setActiveImage((prev) => {
      const current = prev[id] ?? 0;
      const nextValue =
        dir === "next" ? (current + 1) % 2 : (current - 1 + 2) % 2;
      return { ...prev, [id]: nextValue };
    });
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <main className="bg-[#070707] text-[#F3EEE4]">
        <div className="relative w-full pt-20 md:pt-20">
          <div className="relative h-[58vh] min-h-[440px] w-full overflow-hidden border-y border-[#c8a96e2c]">
            <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6">
              {[
                "/sherwani.webp",
                "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80",
                "/sherwani.webp",
                "/new.jpg",
              ].map((src, idx) => (
                <div key={src} className="relative">
                  <img
                    src={src}
                    alt={`Collection mood ${idx + 1}`}
                    className="h-full w-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,110,0.22),transparent_45%)]" />

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-end px-6 pb-10 text-center md:pb-14">
              <p className="mb-4 inline-block w-fit border rounded-xl border-[#c8a96e66] bg-black/30 px-4 py-2 text-[10px] tracking-[0.35em] text-[#d6bb89] uppercase">
                ZENmen Edits
              </p>
              <h1 className="max-w-5xl font-['Cormorant_Garamond'] text-5xl font-light leading-[0.95] text-[#f8f4ec] drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] md:text-7xl">
                New Season Collection
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d6d1c4] md:text-base">
                Statement tailoring, sharp silhouettes, and handcrafted textures
                built for weddings, evenings, and standout everyday presence.
              </p>
            </div>
          </div>
        </div>

        <section className="w-full px-4 py-16 sm:px-6 lg:px-8 2xl:px-12 md:py-20">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#c8a96e2f] pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] tracking-[0.32em] text-[#c8a96e] uppercase">
                Featured Products
              </p>
              <h2 className="mt-3 font-['Playfair Display'] text-4xl font-light md:text-5xl">
                Men's Collections
              </h2>
            </div>
            {/* <p className="max-w-md text-sm leading-7 text-[#bdb6a6]">
              12 demo products in 3 rows, each card with 2 images and
              interactive controls.
            </p> */}
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {demoProducts.map((product, index) => {
              const imgIndex = activeImage[product.id] ?? 0;
              return (
                <article
                  key={product.id}
                  className="group translate-y-7 animate-[fadeInUp_0.7s_ease_forwards] overflow-hidden rounded-xl border border-[#c8a96e33] bg-[#111111] opacity-0 shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition duration-500 hover:border-[#c8a96e8a]"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {product.badge && (
                      <span className="absolute left-3 top-3 z-20 border border-[#c8a96e88] bg-black/70 px-3 py-1 text-[10px] tracking-[0.2em] text-[#d6bb89] uppercase">
                        {product.badge}
                      </span>
                    )}

                    <img
                      src={product.images[imgIndex]}
                      alt={`${product.name} preview ${imgIndex + 1}`}
                      className="h-full w-full object-cover transition duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                    <button
                      type="button"
                      onClick={() => switchImage(product.id, "prev")}
                      className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#f8f4ec61] bg-black/45 p-2 text-[#f8f4ec] opacity-0 transition duration-300 group-hover:opacity-100 hover:border-[#c8a96e] hover:text-[#c8a96e] cursor-grab"
                      aria-label={`Show previous image for ${product.name}`}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={() => switchImage(product.id, "next")}
                      className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#f8f4ec61] bg-black/45 p-2 text-[#f8f4ec] opacity-0 transition duration-300 group-hover:opacity-100 hover:border-[#c8a96e] hover:text-[#c8a96e] cursor-grab"
                      aria-label={`Show next image for ${product.name}`}
                    >
                      <ChevronRight size={24} />
                    </button>

                    <button
                      type="button"
                      className="absolute bottom-0 left-0 right-0 z-20 flex h-12 translate-y-full items-center justify-center gap-3 border-t border-[#c8a96e59] bg-[#c8a96e] text-[14px] font-bold tracking-[0.2em] text-black uppercase transition duration-300 group-hover:translate-y-0"
                    >
                      <ShoppingBag size={18} />
                      Add to Cart
                    </button>
                  </div>

                  <div className="p-12">
                    <h3 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#f8f4ec]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-[11px] tracking-[0.2em] text-[#9e9585] uppercase">
                      {product.fit}
                    </p>
                    <p className="mt-3 font-['Cormorant_Garamond'] text-2xl text-[#d6bb89]">
                      {product.price}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
