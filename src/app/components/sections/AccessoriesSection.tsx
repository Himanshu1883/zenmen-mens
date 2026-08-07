"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const AccessoriesSection = () => {
  const accessories = [
    {
      name: 'Luxury Ties',
      description: 'Handcrafted silk ties in premium patterns',
      price: 'From ₹2,500',
      image: 'https://i.pinimg.com/736x/44/4e/96/444e96341bab6594a6f14d9d731af270.jpg',
      items: '50+ Designs',
    },
    {
      name: 'Designer Brooches',
      description: 'Elegant lapel pins and statement brooches',
      price: 'From ₹1,800',
      image: 'https://i.pinimg.com/736x/c3/67/0b/c3670bdc7b99e3553e75831c418f8cce.jpg',
      items: '30+ Styles',
    },
    {
      name: 'Premium Buttons',
      description: 'Bespoke buttons and cufflinks collection',
      price: 'From ₹1,200',
      image: 'https://i.pinimg.com/736x/8a/e3/d1/8ae3d160a3bb65b43478bcd22e79d32e.jpg',
      items: '40+ Options',
    },
  ];

  const featuredAccessories = [
    {
      name: 'Silk Bow Tie Collection',
      category: 'Ties',
      price: '₹3,200',
      image: 'https://i.pinimg.com/1200x/e0/8e/b4/e08eb476405e395cf40fa816a4098343.jpg',
    },
    {
      name: 'Crystal Lapel Pin',
      category: 'Brooches',
      price: '₹4,500',
      image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      name: 'Gold Cufflinks Set',
      category: 'Buttons',
      price: '₹5,800',
      image: 'https://i.pinimg.com/736x/e5/87/4b/e5874be2563f644c685902447b15e491.jpg',
    },
    {
      name: 'Classic Striped Ties',
      category: 'Ties',
      price: '₹2,800',
      image: 'https://i.pinimg.com/1200x/1b/a3/c8/1ba3c8ab4b19e55a2bacba1014bcc931.jpg',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-8 lg:px-16 mb-20 md:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] tracking-[0.3em] text-[#7da8c7] uppercase mb-4">
              Complete Your Look
            </p>
            <h2
              className="text-[#0f172a] mb-6"
              style={{
                fontFamily: 'var(--heading-font-family)',
                fontSize: 'clamp(36px, 6vw, 72px)',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Luxury Accessories
            </h2>
            <p className="text-[15px] text-[#6b7280] leading-relaxed mb-8 max-w-xl">
              Elevate your ensemble with our curated collection of premium ties, designer brooches,
              and bespoke buttons. Each piece is carefully selected to add the perfect finishing
              touch to your sophisticated wardrobe.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-[#0f172a] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#7da8c7] transition-all duration-300 rounded-sm font-medium"
            >
              Shop All Accessories
            </motion.button>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Accessories"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="absolute bottom-8 right-8 px-6 py-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#7da8c7]" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.2em] text-[#7da8c7] uppercase">
                  Premium Quality
                </span>
              </div>
              <p className="text-[#0f172a] text-[13px] font-medium">Handcrafted Excellence</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Categories */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-8 lg:px-16 mb-20 md:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {accessories.map((accessory, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-[450px] rounded-xl overflow-hidden mb-6 bg-[#f8fafc]">
                <img
                  src={accessory.image}
                  alt={accessory.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-[1px] bg-[#7da8c7]" />
                    <span className="text-white/80 text-[10px] tracking-[0.25em] uppercase">
                      {accessory.items}
                    </span>
                  </div>
                  <h3 className="text-white text-[20px] font-medium mb-2" style={{ fontFamily: 'var(--heading-font-family)' }}>
                    {accessory.name}
                  </h3>
                  <p className="text-white/70 text-[12px] mb-3 leading-relaxed">
                    {accessory.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-[14px] font-medium">{accessory.price}</span>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-white text-[10px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Details Below */}
              <div className="px-2">
                <h4 className="text-[#0f172a] text-[15px] font-medium mb-2 group-hover:text-[#7da8c7] transition-colors duration-300">
                  {accessory.name}
                </h4>
                <p className="text-[#6b7280] text-[12px]">{accessory.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Products Grid */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-8 lg:px-16">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.3em] text-[#7da8c7] uppercase mb-4">
            Handpicked Selections
          </p>
          <h3
            className="text-[#0f172a]"
            style={{
              fontFamily: 'var(--heading-font-family)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Featured Accessories
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredAccessories.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              <div className="relative h-[280px] md:h-[350px] rounded-lg overflow-hidden mb-4 bg-[#f8fafc]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-6 py-2.5 bg-white text-[#0f172a] text-[10px] tracking-[0.2em] uppercase font-medium rounded-sm"
                  >
                    Quick View
                  </motion.button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] tracking-[0.2em] text-[#7da8c7] uppercase">
                  {item.category}
                </p>
                <h4 className="text-[#0f172a] text-[13px] md:text-[14px] font-medium leading-tight group-hover:text-[#7da8c7] transition-colors duration-300">
                  {item.name}
                </h4>
                <p className="text-[#0f172a] text-[15px] font-semibold" style={{ fontFamily: 'var(--heading-font-family)' }}>
                  {item.price}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 border-2 border-[#0f172a] text-[#0f172a] text-[11px] tracking-[0.2em] uppercase hover:bg-[#0f172a] hover:text-white transition-all duration-300 rounded-sm font-medium"
          >
            View All Accessories
          </motion.button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-8 lg:px-16 mt-20 md:mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#f8fafc] to-[#e8f4f8] rounded-2xl p-8 md:p-12 lg:p-16 text-center"
        >
          <Sparkles className="w-8 h-8 text-[#7da8c7] mx-auto mb-6" strokeWidth={1.5} />
          <h3
            className="text-[#0f172a] mb-4"
            style={{
              fontFamily: 'var(--heading-font-family)',
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 600,
            }}
          >
            Personalization Available
          </h3>
          <p className="text-[14px] text-[#6b7280] max-w-2xl mx-auto leading-relaxed mb-8">
            Add a personal touch to your accessories. Our expert craftsmen can customize ties,
            brooches, and buttons with monograms, custom designs, or special engravings.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-[#7da8c7] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#6b97b7] transition-all duration-300 rounded-sm font-medium"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default AccessoriesSection;
