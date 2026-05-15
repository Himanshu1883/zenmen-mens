"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ShopByCategory = () => {
  const categories = [
    {
      name: "Designer Suits",
      subtitle: "Three Piece Excellence",
      image: "/WhatsApp_Image_2026-05-03_at_4.30.36_PM.jpeg",
      layout: "large",
    },
    {
      name: "Indo Western",
      subtitle: "Luxury Kurtas",
      image: "/WhatsApp_Image_2026-04-28_at_9.56.47_PM.jpeg",
      layout: "tall",
    },
    {
      name: "Formal Collection",
      subtitle: "Premium Tuxedos",
      image: "/WhatsApp_Image_2026-05-03_at_4.30.33_PM.jpeg",
      layout: "wide",
    },
    {
      name: "Embroidered Kurta",
      subtitle: "Black Elegance",
      image: "/WhatsApp_Image_2026-04-28_at_9.56.46_PM.jpeg",
      layout: "medium",
    },
    {
      name: "Safari Shirts",
      subtitle: "Contemporary Style",
      image: "/WhatsApp_Image_2026-04-28_at_9.56.51_PM.jpeg",
      layout: "medium",
    },
    {
      name: "Wedding Specials",
      subtitle: "Mauve Collection",
      image: "/WhatsApp_Image_2026-04-28_at_9.56.46_PM.jpeg",
      layout: "tall",
    },
    {
      name: "White Tuxedo",
      subtitle: "Luxury Eveningwear",
      image: "/WhatsApp_Image_2026-04-28_at_9.56.39_PM.jpeg",
      layout: "medium",
    },
  ];

  return (
    <section className="py-16 px-0 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] tracking-[0.3em] text-[#7da8c7] uppercase mb-4"
          >
            Discover
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#0f172a] mb-6"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Shop By Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[14px] text-[#7da8c7] max-w-2xl mx-auto leading-relaxed"
          >
            From classic tailored suits to contemporary Indo-Western fusion,
            explore our curated collections designed for the modern gentleman.
          </motion.p>
        </div>

        {/* Banner Collage Layout */}
        <div className="grid grid-cols-12 auto-rows-[400px] gap-4 px-4 lg:px-8">
          {/* Large Hero - Spans 2 rows, 6 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-12 lg:col-span-6 row-span-2 relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={categories[0].image}
                alt={categories[0].name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-12">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-white/70 text-[10px] tracking-[0.25em] uppercase mb-3"
              >
                {categories[0].subtitle}
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-white mb-6"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {categories[0].name}
              </motion.h3>
              <motion.button
                whileHover={{ x: 10 }}
                className="flex items-center gap-3 text-white text-[11px] tracking-[0.2em] uppercase group-hover:text-[#7da8c7] transition-colors"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
            </div>
          </motion.div>

          {/* Tall Right - Full height, 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="col-span-6 lg:col-span-3 row-span-2 relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={categories[1].image}
                alt={categories[1].name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white/70 text-[9px] tracking-[0.25em] uppercase mb-2">
                {categories[1].subtitle}
              </p>
              <h3
                className="text-white mb-4"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {categories[1].name}
              </h3>
              <button className="flex items-center gap-2 text-white text-[10px] tracking-[0.2em] uppercase group-hover:text-[#7da8c7] transition-colors">
                <span>Shop Now</span>
                <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>

          {/* Small Square Top Right - 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="col-span-6 lg:col-span-3 row-span-1 relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={categories[3].image}
                alt={categories[3].name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white/70 text-[9px] tracking-[0.25em] uppercase mb-2">
                {categories[3].subtitle}
              </p>
              <h3
                className="text-white mb-3"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {categories[3].name}
              </h3>
              <button className="flex items-center gap-2 text-white text-[9px] tracking-[0.2em] uppercase group-hover:text-[#7da8c7] transition-colors">
                <span>View</span>
                <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>

          {/* Small Square Bottom Right - 3 cols */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="col-span-6 lg:col-span-3 row-span-1 relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={categories[4].image}
                alt={categories[4].name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white/70 text-[9px] tracking-[0.25em] uppercase mb-2">
                {categories[4].subtitle}
              </p>
              <h3
                className="text-white mb-3"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {categories[4].name}
              </h3>
              <button className="flex items-center gap-2 text-white text-[9px] tracking-[0.2em] uppercase group-hover:text-[#7da8c7] transition-colors">
                <span>View</span>
                <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>

          {/* Wide Banner - Full width bottom */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="col-span-12 lg:col-span-8 row-span-1 relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={categories[2].image}
                alt={categories[2].name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="p-10 lg:p-12">
                <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase mb-3">
                  {categories[2].subtitle}
                </p>
                <h3
                  className="text-white mb-4"
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: "clamp(28px, 4vw, 48px)",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {categories[2].name}
                </h3>
                <button className="flex items-center gap-3 text-white text-[11px] tracking-[0.2em] uppercase group-hover:text-[#7da8c7] transition-colors">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Medium Square - 4 cols */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="col-span-12 lg:col-span-4 row-span-1 relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={categories[6].image}
                alt={categories[6].name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white/70 text-[9px] tracking-[0.25em] uppercase mb-2">
                {categories[6].subtitle}
              </p>
              <h3
                className="text-white mb-4"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {categories[6].name}
              </h3>
              <button className="flex items-center gap-2 text-white text-[10px] tracking-[0.2em] uppercase group-hover:text-[#7da8c7] transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 px-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-4 border border-gray text-[#0f172a] text-[11px] tracking-[0.2em] uppercase hover:bg-[#7da8c7] hover:text-white transition-all duration-300 inline-flex items-center gap-4 cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopByCategory;
