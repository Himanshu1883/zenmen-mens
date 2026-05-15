"use client";

import { useSwipeSlider } from '@/hooks/useSwipeSlider';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ProductSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      const prevItemsPerView = itemsPerView;
      let newItemsPerView = 4;

      if (window.innerWidth < 640) {
        newItemsPerView = 1; // Mobile: 1 item
      } else if (window.innerWidth < 768) {
        newItemsPerView = 2; // Small: 2 items
      } else if (window.innerWidth < 1024) {
        newItemsPerView = 4; // Medium: 4 items
      } else {
        newItemsPerView = 4; // Large: 5 items
      }

      if (prevItemsPerView !== newItemsPerView) {
        setItemsPerView(newItemsPerView);
        setCurrentSlide(0); // Reset to first slide on resize
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [itemsPerView]);

  const products = [
    {
      name: 'Embellished Designer Blazer',
      category: 'Indo Western',
      price: '₹38,500',
      image: '/WhatsApp_Image_2026-05-03_at_4.30.36_PM.jpeg',
    },
    {
      name: 'Luxury Three Piece Tuxedo',
      category: 'Formal Collection',
      price: '₹65,000',
      image: '/WhatsApp_Image_2026-05-03_at_4.30.33_PM.jpeg',
    },
    {
      name: 'Premium Double Breasted Suit',
      category: 'Designer Suits',
      price: '₹58,000',
      image: '/WhatsApp_Image_2026-05-03_at_4.30.31_PM.jpeg',
    },
    {
      name: 'Contemporary Safari Shirt',
      category: 'Casual Luxury',
      price: '₹12,500',
      image: '/WhatsApp_Image_2026-04-28_at_9.56.51_PM.jpeg',
    },
    {
      name: 'Embroidered Black Kurta',
      category: 'Wedding Special',
      price: '₹28,500',
      image: '/WhatsApp_Image_2026-04-28_at_9.56.47_PM.jpeg',
    },
    {
      name: 'Royal Mauve Sherwani',
      category: 'Bridal Collection',
      price: '₹45,000',
      image: '/WhatsApp_Image_2026-04-28_at_9.56.46_PM.jpeg',
    },
    {
      name: 'White Luxury Tuxedo',
      category: 'Evening Wear',
      price: '₹72,000',
      image: '/WhatsApp_Image_2026-04-28_at_9.56.39_PM.jpeg',
    },
  ];

  const maxSlide = products.length - itemsPerView;

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

  const slidePercentage = 100 / itemsPerView;

  return (
    <section className="py-16 md:py-16 px-4 md:px-8 lg:px-16 bg-white">
      <div className="max-w-[1800px] mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 md:mb-16">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-[#7da8c7] uppercase mb-4">
              Featured
            </p>
            <h2
              className="text-[#0f172a]"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(28px, 5vw, 64px)',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Signature Collection
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentSlide === 0
                  ? 'border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed'
                  : 'border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              disabled={currentSlide >= products.length - itemsPerView}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentSlide >= products.length - itemsPerView
                  ? 'border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed'
                  : 'border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white'
              }`}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        {/* Slider Container */}
        <motion.div
          className="relative overflow-hidden touch-pan-y"
          ref={sliderRef}
          {...swipeHandlers}
        >
          <motion.div
            animate={{
              x: `-${currentSlide * slidePercentage}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="flex gap-4 md:gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/4 lg:w-1/5 group cursor-pointer md:hover:-translate-y-3 transition-transform duration-300"
              >
                {/* Product Image */}
                <div className="relative h-[500px] sm:h-[550px] md:h-[550px] lg:h-[600px] overflow-hidden bg-[#f8fafc] mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Quick Add Button - Shows on Hover */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-white text-[#0f172a] text-[10px] tracking-[0.2em] uppercase font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 shadow-xl"
                  >
                    <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                    <span>Quick Add</span>
                  </motion.button>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] text-[#7da8c7] uppercase">
                    {product.category}
                  </p>
                  <h3 className="text-[#0f172a] text-[15px] md:text-[16px] font-medium leading-tight group-hover:text-[#7da8c7] transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p
                    className="text-[#0f172a]"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '20px',
                      fontWeight: 600,
                    }}
                  >
                    {product.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-center gap-4 mt-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              currentSlide === 0
                ? 'border-[#e2e8f0] text-[#cbd5e1]'
                : 'border-[#0f172a] text-[#0f172a]'
            }`}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={currentSlide >= products.length - itemsPerView}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              currentSlide >= products.length - itemsPerView
                ? 'border-[#e2e8f0] text-[#cbd5e1]'
                : 'border-[#0f172a] text-[#0f172a]'
            }`}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </motion.button>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
          {Array.from({ length: products.length - itemsPerView + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'w-8 bg-[#7da8c7]'
                  : 'w-6 bg-[#e2e8f0] hover:bg-[#cbd5e1]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
