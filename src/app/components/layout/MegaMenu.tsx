import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface MegaMenuProps {
  isOpen: boolean;
  shellClass: string;
}

const collections = [
  { name: "Kurta-Pajama", featured: true, q: "kurta" },
  { name: "Pants/Trousers", featured: false, q: "pants" },
  { name: "Shirt", featured: false, q: "shirt" },
  { name: "Suit", featured: true, q: "suit" },
  { name: "Designer Suits", featured: true, q: "designer suit" },
  { name: "Double Breasted Suit", featured: false, q: "double breasted" },
  { name: "Three Piece Suit", featured: true, q: "three piece" },
  { name: "Five Piece Suit", featured: false, q: "five piece" },
  { name: "Two Piece Suit", featured: false, q: "two piece" },
  { name: "Indo-Western", featured: true, q: "indo-western" },
  { name: "Designer Shirt", featured: false, q: "designer shirt" },
  { name: "Buttons", featured: false, q: "button" },
  { name: "Tie", featured: false, q: "tie" },
  { name: "Broches", featured: false, q: "brooch" },
] as const;

const MegaMenu = ({ isOpen, shellClass }: MegaMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute top-full left-0 right-0 bg-white shadow-xl"
        >
          <motion.div className={`${shellClass} py-10 lg:py-14`}>
            <motion.div className="grid grid-cols-12 gap-16">
              <motion.div className="col-span-5">
                <motion.div className="grid grid-cols-2 gap-x-14 gap-y-4">
                  {collections.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/collection?q=${encodeURIComponent(item.q)}`}
                        className="group inline-block no-underline mb-3"
                      >
                        <motion.div className="inline-flex items-center gap-6 relative">
                          <span className="relative text-[13px] tracking-[0.15em] text-[#0f172a] group-hover:text-[#7da8c7] transition-colors duration-300 uppercase">
                            {item.name}
                            <span className="absolute left-0 -bottom-2 h-[1px] w-0 bg-[#7da8c7] group-hover:w-full transition-all duration-500" />
                          </span>
                          {item.featured && (
                            <span className="text-[9px] tracking-[0.2em] text-[#7da8c7] uppercase px-2 py-1 border border-[#7da8c7] rounded-sm">
                              Featured
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div className="mt-12 pt-8 border-t border-[#e2e8f0]">
                  <Link
                    href="/collection"
                    className="inline-block no-underline px-8 py-3 bg-[#0f172a] text-white text-[11px] tracking-[0.15em] uppercase hover:bg-[#7da8c7] transition-colors duration-300 rounded-sm"
                  >
                    View All Collections
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div className="col-span-7">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="relative h-[480px] rounded-lg overflow-hidden group"
                >
                  <img
                    src="/zenmen_kurta.png"
                    alt="Spring Collection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <motion.div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                  <motion.div className="absolute bottom-0 left-0 right-0 p-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-[10px] tracking-[0.25em] text-white/80 uppercase mb-2">
                        ZEN/men 2026
                      </p>
                      <h3
                        className="text-white mb-4"
                        style={{
                          fontFamily: "Playfair Display, serif",
                          fontSize: "36px",
                          fontWeight: 500,
                          lineHeight: 1.3,
                        }}
                      >
                        Modern Elegance
                      </h3>
                      <Link
                        href="/collection"
                        className="inline-block no-underline text-[11px] tracking-[0.15em] text-white uppercase border-b border-white/40 hover:border-white pb-1 transition-colors duration-300"
                      >
                        Explore Collection
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;
