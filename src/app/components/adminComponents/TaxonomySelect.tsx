"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type TaxonomyOption = {
  value: string;
  label: string;
  hint?: string;
};

type Props = {
  id?: string;
  value: string;
  options: TaxonomyOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function TaxonomySelect({
  id,
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState({ top: 0, left: 0, width: 0, maxHeight: 280 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label || (value ? value : placeholder);

  const placeMenu = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const gap = 6;
    const maxHeight = Math.min(320, Math.max(160, window.innerHeight - r.bottom - 16));
    setMenu({
      top: r.bottom + gap,
      left: r.left,
      width: r.width,
      maxHeight,
    });
  };

  useEffect(() => {
    if (!open) return;
    placeMenu();
    const onWin = () => placeMenu();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <>
      <button
        id={id}
        ref={btnRef}
        type="button"
        disabled={disabled}
        className="zm-select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
      >
        <span className={selected || value ? "zm-select-value" : "zm-select-placeholder"}>
          {label}
        </span>
        <span className="zm-select-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              className="zm-select-menu"
              style={{
                top: menu.top,
                left: menu.left,
                width: menu.width,
                maxHeight: menu.maxHeight,
              }}
            >
              {options.length === 0 ? (
                <div className="zm-select-empty">No collections available</div>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    className={`zm-select-option ${opt.value === value ? "is-on" : ""}`}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {opt.hint ? <em>{opt.hint}</em> : null}
                  </button>
                ))
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
