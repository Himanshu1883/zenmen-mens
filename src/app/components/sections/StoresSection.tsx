"use client";

import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

/** Single atelier — same copy on every card; images vary for the grid layout only */
const ZENMEN_ATELIER = {
  name: "ZENMEN Bespoke",
  location: "Lajpat Nagar II, New Delhi",
  address: "E-39, Lajpat Nagar II, New Delhi – 110024",
  mapsUrl:
    "https://maps.google.com/?q=E-39+Lajpat+Nagar+2+New+Delhi",
  phone: "+91 96507 53273",
};

const StoresSection = () => {
  const storeImages = [
    "/store_1.jpeg",
    "/store_2.jpeg",
    "/store_3.jpeg",
    "/store_4.jpeg",
    "/store_5.jpeg",
  ];

  const stores = storeImages.map((image) => ({
    ...ZENMEN_ATELIER,
    image,
  }));

  return (
    <section className="py-20 md:py-32 px-6 md:px-8 lg:px-16 bg-[#fafbfc]">
      <div className="max-w-[1800px] mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-[#7da8c7] uppercase mb-4">
              Visit Us
            </p>
            <h2
              className="text-[#0f172a]"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(32px, 5vw, 64px)',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Our Atelier
            </h2>
          </div>

          <motion.a
            href={ZENMEN_ATELIER.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 5 }}
            className="hidden md:flex items-center gap-2 text-[#0f172a] text-[11px] tracking-[0.2em] uppercase hover:text-[#7da8c7] transition-colors"
          >
            <span>Get Directions</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </motion.a>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {stores.map((store, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              {/* Store Image */}
              <div className="relative h-[400px] md:h-[450px] rounded-lg overflow-hidden mb-4 bg-[#f8fafc]">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Store Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#7da8c7] flex-shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-white text-[14px] font-medium mb-1 leading-tight">
                        {store.name}
                      </h3>
                      <p className="text-white/80 text-[11px] leading-relaxed">
                        {store.location}
                      </p>
                    </div>
                  </div>

                  {/* Address - Shows on Hover */}
                  <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-300">
                    <p className="text-white/70 text-[10px] tracking-wide mb-3">
                      {store.address}
                    </p>
                    <motion.a
                      href={ZENMEN_ATELIER.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ x: 5 }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-white text-[10px] tracking-[0.2em] uppercase no-underline"
                    >
                      <span>Get Directions</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Store Name Below (Alternative Display) */}
              <div className="hidden md:block">
                <h4 className="text-[#0f172a] text-[13px] font-medium mb-1 group-hover:text-[#7da8c7] transition-colors duration-300">
                  {store.name}
                </h4>
                <p className="text-[#6b7280] text-[11px]">{store.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden text-center mt-8">
          <motion.a
            href={ZENMEN_ATELIER.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#0f172a] text-[#0f172a] text-[11px] tracking-[0.2em] uppercase hover:bg-[#0f172a] hover:text-white transition-all duration-300 rounded-sm"
          >
            <span>Get Directions</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </motion.a>
        </div>

        {/* Store Features */}
        <div className="mt-16 pt-16 border-t border-[#e2e8f0]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: 'Personal Styling',
                description:
                  'One-on-one consultation with our stylists at our Lajpat Nagar atelier',
              },
              {
                title: 'Custom Tailoring',
                description:
                  'Bespoke fittings and made-to-measure work, crafted in New Delhi',
              },
              {
                title: 'Private Appointments',
                description:
                  'Book a private session at E-39, Lajpat Nagar II — call +91 96507 53273',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#7da8c7]/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-2 h-2 bg-[#7da8c7] rounded-full" />
                </div>
                <h3 className="text-[#0f172a] text-[14px] font-medium mb-2 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-[#6b7280] text-[12px] leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoresSection;
