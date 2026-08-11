"use client";

import { ZenIcon } from "@/components/icons";
import { useNavCategories } from "@/hooks/useNavCategories";
import { useAppSelector } from "@/store/hooks";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import CurrencyIcon from "./CurrencyIcon";
import CurrencySwitcher from "./CurrencySwitcher";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

const linkClass =
  "block no-underline py-4 px-4 text-[13px] tracking-[0.15em] text-[#0f172a] hover:bg-[#f8fafc] hover:text-[#7da8c7] transition-all duration-300 uppercase rounded-sm";

const MobileMenu = ({ isOpen, onClose, onOpenAuth }: MobileMenuProps) => {
  const { groups } = useNavCategories();
  const activeCurrency = useAppSelector((s) => s.currency.code);

  let animIndex = 0;
  const stagger = () => {
    const delay = animIndex * 0.05;
    animIndex += 1;
    return delay;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3 select-none">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-[#1b2232]">
                    <img
                      src="/logo_zenmen.png"
                      alt="ZENmen logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="m-0 text-[28px] leading-[0.92] text-[#0f172a]">
                      ZENMEN
                    </p>
                    <p className="m-0 text-[8px] tracking-[0.32em] text-[#7da8c7] uppercase mt-1">
                      Bespoke Tailoring
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-transparent border-0 text-[#0f172a] p-2 hover:bg-[#f8fafc] rounded-full transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <ZenIcon name="times" className="w-6 h-6" />
                </button>
              </div>

              <nav className="mb-12">
                <div className="space-y-1">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: stagger() }}
                  >
                    <Link
                      href="/collection"
                      className={linkClass}
                      onClick={onClose}
                    >
                      Collections
                    </Link>
                  </motion.div>

                  {groups.map((group) => (
                    <div key={group.parent._id ?? group.parent.slug}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: stagger() }}
                      >
                        <Link
                          href={group.parent.href}
                          className={`${linkClass} pl-8 text-[12px] font-medium`}
                          onClick={onClose}
                        >
                          {group.parent.name}
                        </Link>
                      </motion.div>

                      {group.isGroup
                        ? group.children.map((child) => (
                            <motion.div
                              key={child._id ?? child.slug}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: stagger() }}
                            >
                              <Link
                                href={child.href}
                                className={`${linkClass} pl-12 text-[11px] text-[#64748b]`}
                                onClick={onClose}
                              >
                                {child.name}
                              </Link>
                            </motion.div>
                          ))
                        : null}
                    </div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: stagger() }}
                  >
                    <Link
                      href="/about"
                      className={linkClass}
                      onClick={onClose}
                    >
                      About
                    </Link>
                  </motion.div>
                </div>
              </nav>

              <div className="space-y-4 mb-12">
                <button
                  type="button"
                  className="w-full bg-transparent border-0 flex items-center gap-4 py-4 px-4 text-[13px] tracking-[0.1em] text-[#0f172a] hover:bg-[#f8fafc] transition-colors rounded-sm uppercase cursor-pointer"
                >
                  <ZenIcon name="search" className="w-5 h-5" />
                  Search
                </button>
                <div className="border-t border-[#e2e8f0] pt-4 -mx-2">
                  <div className="flex items-center gap-3 px-4 pb-1">
                    <CurrencyIcon
                      code={activeCurrency}
                      className="w-5 h-5 shrink-0 text-[#0f172a]"
                      strokeWidth={1.5}
                    />
                    <span className="font-[family-name:var(--font-montserrat)] text-[13px] tracking-[0.1em] text-[#0f172a] uppercase">
                      Currency
                    </span>
                  </div>
                  <CurrencySwitcher mode="inline" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth?.();
                    onClose();
                  }}
                  className="w-full bg-transparent border-0 flex items-center gap-4 py-4 px-4 text-[13px] tracking-[0.1em] text-[#0f172a] hover:bg-[#f8fafc] transition-colors rounded-sm uppercase cursor-pointer"
                >
                  <ZenIcon name="user" className="w-5 h-5" />
                  Account
                </button>
                <button
                  type="button"
                  className="w-full bg-transparent border-0 flex items-center gap-4 py-4 px-4 text-[13px] tracking-[0.1em] text-[#0f172a] hover:bg-[#f8fafc] transition-colors rounded-sm uppercase cursor-pointer"
                >
                  <ZenIcon name="shopping-bag" className="w-5 h-5" />
                  Cart
                </button>
              </div>

              <Link
                href="/appointment"
                onClick={onClose}
                className="block w-full text-center bg-[#0f172a] border-0 px-6 py-4 text-white text-[11px] tracking-[0.15em] uppercase no-underline hover:bg-[#7da8c7] transition-colors duration-300 rounded-sm"
              >
                Book Appointment
              </Link>

              <div className="mt-12 pt-8 border-t border-[#e2e8f0]">
                <p className="text-[10px] tracking-[0.2em] text-[#6b7280] uppercase text-center">
                  Bespoke Tailoring Since 2020
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
