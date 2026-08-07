"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { useSwipeSlider } from "@/hooks/useSwipeSlider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import type { Product } from "@/types/product";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const SLIDER_COUNT = 7;

type SlideProduct = {
  key: string;
  name: string;
  category: string;
  priceInr: number;
  image: string;
  imageAlt: string;
  href: string;
  catalogId: string;
  slug: string;
  colors?: string[];
  sizes?: string[];
  canCart: boolean;
};

function primaryImage(product: Product) {
  return product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
}

function displayPriceInr(product: Product): number {
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  return hasDiscount
    ? Math.round(product.price * (1 - (product.discount ?? 0) / 100))
    : product.price;
}

function isEligible(product: Product): boolean {
  return Boolean(
    product.slug &&
      product.isAvailable !== false &&
      primaryImage(product)?.url,
  );
}

/** Seven unique catalog products — featured first, then newest from collection */
function pickSliderProducts(catalog: Product[]): SlideProduct[] {
  const eligible = catalog.filter(isEligible);
  const featured = eligible.filter((p) => p.isFeatured);
  const rest = eligible.filter((p) => !p.isFeatured);

  const picked: Product[] = [];
  const seen = new Set<string>();

  for (const list of [featured, rest]) {
    for (const product of list) {
      if (picked.length >= SLIDER_COUNT) break;
      if (seen.has(product._id)) continue;
      seen.add(product._id);
      picked.push(product);
    }
    if (picked.length >= SLIDER_COUNT) break;
  }

  return picked.map((product) => {
    const img = primaryImage(product)!;
    return {
      key: product._id,
      name: product.title,
      category: product.category ?? product.subCategory ?? "Collection",
      priceInr: displayPriceInr(product),
      image: img.url,
      imageAlt: img.alt ?? product.title,
      href: `/collection/${encodeURIComponent(product.slug)}`,
      catalogId: product._id,
      slug: product.slug,
      colors: product.colors,
      sizes: product.sizes,
      canCart: true,
    };
  });
}

function SliderSkeleton() {
  return (
    <section className="py-16 md:py-16 px-4 md:px-8 lg:px-16 bg-white">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8 md:mb-16 h-24 animate-pulse rounded bg-[#f1f5f9]" />
        <div className="flex gap-4 md:gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full sm:w-1/2 md:w-1/4 lg:w-1/5"
            >
              <div className="h-[500px] md:h-[600px] animate-pulse bg-[#f1f5f9] mb-4" />
              <div className="h-4 w-24 animate-pulse bg-[#f1f5f9] mb-2" />
              <div className="h-5 w-3/4 animate-pulse bg-[#f1f5f9] mb-2" />
              <div className="h-6 w-20 animate-pulse bg-[#f1f5f9]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ProductSlider = () => {
  const dispatch = useAppDispatch();
  const { format: formatPrice } = useDisplayPrice();
  const { products: catalog, loading, loaded, error } = useAppSelector(
    (s) => s.products,
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded && !loading) dispatch(fetchProducts());
  }, [dispatch, loaded, loading]);

  const products = useMemo(() => pickSliderProducts(catalog), [catalog]);

  useEffect(() => {
    const updateItemsPerView = () => {
      let next = 4;
      if (window.innerWidth < 640) next = 1;
      else if (window.innerWidth < 768) next = 2;
      else if (window.innerWidth < 1024) next = 4;
      else next = 4;

      setItemsPerView((prev) => {
        if (prev !== next) setCurrentSlide(0);
        return next;
      });
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxSlide = Math.max(0, products.length - itemsPerView);

  useEffect(() => {
    setCurrentSlide((prev) => Math.min(prev, maxSlide));
  }, [maxSlide]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < maxSlide ? prev + 1 : prev));
  }, [maxSlide]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const swipeHandlers = useSwipeSlider({
    onNext: handleNext,
    onPrev: handlePrev,
    enabled: maxSlide > 0,
  });

  const handleAddToCart = useCallback(
    (product: SlideProduct, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dispatch(
        addItem({
          _id: product.catalogId,
          title: product.name,
          slug: product.slug,
          price: product.priceInr,
          image: { url: product.image, alt: product.imageAlt },
          selectedColor: product.colors?.[0],
          selectedSize: product.sizes?.[0],
          qty: 1,
        }),
      );

      setAddedKey(product.key);
      toast.success("Added to bag");
      setTimeout(() => setAddedKey(null), 2000);
    },
    [dispatch],
  );

  const slidePercentage = itemsPerView > 0 ? 100 / itemsPerView : 100;

  if (loading && !loaded) {
    return <SliderSkeleton />;
  }

  if (products.length === 0) {
    if (error && !loaded) {
      return (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
          <div className="max-w-[1800px] mx-auto text-center">
            <p className="text-[#64748b] text-sm tracking-[0.2em] uppercase mb-4">
              Unable to load collection
            </p>
            <button
              type="button"
              onClick={() => dispatch(fetchProducts())}
              className="px-6 py-2.5 border border-[#7da8c7] text-[#0f172a] text-[11px] uppercase tracking-[0.2em] hover:bg-[#7da8c7] hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="py-16 md:py-16 px-4 md:px-8 lg:px-16 bg-white">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-end justify-between mb-8 md:mb-16">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-[#7da8c7] uppercase mb-4">
              Featured
            </p>
            <h2
              className="text-[#0f172a]"
              style={{
                fontFamily: "var(--heading-font-family)",
                fontSize: "clamp(28px, 5vw, 64px)",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Signature Collection
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentSlide === 0
                  ? "border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed"
                  : "border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
              }`}
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              disabled={currentSlide >= maxSlide}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentSlide >= maxSlide
                  ? "border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed"
                  : "border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
              }`}
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden touch-pan-y"
          ref={sliderRef}
          {...swipeHandlers}
        >
          <motion.div
            animate={{ x: `-${currentSlide * slidePercentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-4 md:gap-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.key}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/4 lg:w-1/5 group md:hover:-translate-y-3 transition-transform duration-300"
              >
                <div className="relative h-[500px] sm:h-[550px] md:h-[550px] lg:h-[600px] overflow-hidden bg-[#f8fafc] mb-4">
                  <Link
                    href={product.href}
                    className="absolute inset-0 z-[1] block"
                    aria-label={`View ${product.name}`}
                  />

                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    className="relative z-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(product, e)}
                    aria-label={`Quick add ${product.name} to bag`}
                    className={`absolute bottom-4 right-4 z-20 flex h-11 items-center overflow-hidden border-0 shadow-lg transition-all duration-300 ${
                      addedKey === product.key
                        ? "bg-[#7da8c7] text-[#0f172a]"
                        : "bg-[#0f172a] text-white hover:bg-[#7da8c7] hover:text-[#0f172a]"
                    } opacity-100 md:opacity-90 md:group-hover:opacity-100`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:max-w-[72px] group-hover:pr-3 group-hover:opacity-100">
                      {addedKey === product.key ? "Added" : "Quick"}
                    </span>
                  </button>
                </div>

                <Link href={product.href} className="block space-y-2 no-underline">
                  <p className="text-[10px] tracking-[0.2em] text-[#7da8c7] uppercase">
                    {product.category}
                  </p>
                  <h3 className="text-[#0f172a] text-[15px] md:text-[16px] font-medium leading-tight group-hover:text-[#7da8c7] transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p
                    className="text-[#0f172a]"
                    style={{
                      fontFamily: "var(--heading-font-family)",
                      fontSize: "20px",
                      fontWeight: 600,
                    }}
                  >
                    {formatPrice(product.priceInr)}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <div className="flex md:hidden items-center justify-center gap-4 mt-8">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              currentSlide === 0
                ? "border-[#e2e8f0] text-[#cbd5e1]"
                : "border-[#0f172a] text-[#0f172a]"
            }`}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={currentSlide >= maxSlide}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              currentSlide >= maxSlide
                ? "border-[#e2e8f0] text-[#cbd5e1]"
                : "border-[#0f172a] text-[#0f172a]"
            }`}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </motion.button>
        </div>

        {maxSlide > 0 && (
          <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
            {Array.from({ length: maxSlide + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "w-8 bg-[#7da8c7]"
                    : "w-6 bg-[#e2e8f0] hover:bg-[#cbd5e1]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSlider;
