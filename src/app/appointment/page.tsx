"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type AppointmentType = "in-store" | "virtual";
type VirtualPlatform =
  | "whatsapp_video"
  | "zoom"
  | "google_meet"
  | "ms_teams"
  | "facetime";
type OccasionType = "wedding" | "corporate" | "casual" | "festive" | "custom";

interface FormState {
  name: string;
  email: string;
  phone: string;
  appointmentType: AppointmentType;
  virtualPlatform: VirtualPlatform | "";
  occasion: OccasionType | "";
  preferredDate: string;
  preferredTime: string;
  budget: string;
  message: string;
  consent: boolean;
}

interface FormErrors {
  [key: string]: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "919650753273"; // +91 96507 53273

const VIRTUAL_PLATFORMS = [
  {
    id: "whatsapp_video" as VirtualPlatform,
    label: "WhatsApp Video",
    icon: "💬",
  },
  { id: "zoom" as VirtualPlatform, label: "Zoom", icon: "🎥" },
  { id: "google_meet" as VirtualPlatform, label: "Google Meet", icon: "📹" },
  { id: "ms_teams" as VirtualPlatform, label: "Microsoft Teams", icon: "💼" },
  { id: "facetime" as VirtualPlatform, label: "FaceTime", icon: "📱" },
];

const OCCASIONS: { id: OccasionType; label: string }[] = [
  { id: "wedding", label: "Wedding / Sherwani" },
  { id: "corporate", label: "Corporate / Formal" },
  { id: "casual", label: "Casual / Everyday" },
  { id: "festive", label: "Festive / Celebration" },
  { id: "custom", label: "Custom Bespoke" },
];

const TIME_SLOTS = [
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
];

const BUDGET_OPTIONS = [
  "Under ₹15,000",
  "₹15,000 – ₹30,000",
  "₹30,000 – ₹60,000",
  "₹60,000 – ₹1,00,000",
  "Above ₹1,00,000",
  "Prefer not to say",
];

// ── Validation ────────────────────────────────────────────────────────────────

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim() || form.name.trim().length < 2)
    errors.name = "Please enter your full name.";

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim() || !emailRe.test(form.email))
    errors.email = "Please enter a valid email address.";

  const phoneRe = /^[+]?[\d\s\-()]{8,15}$/;
  if (!form.phone.trim() || !phoneRe.test(form.phone))
    errors.phone = "Please enter a valid phone number.";

  if (!form.occasion) errors.occasion = "Please select an occasion.";

  if (!form.preferredDate)
    errors.preferredDate = "Please select a preferred date.";

  if (!form.preferredTime)
    errors.preferredTime = "Please select a preferred time.";

  if (form.appointmentType === "virtual" && !form.virtualPlatform)
    errors.virtualPlatform = "Please select your preferred video platform.";

  if (!form.consent)
    errors.consent = "Please accept the privacy policy to continue.";

  return errors;
}

// ── WhatsApp message builder ──────────────────────────────────────────────────

function buildWhatsAppMessage(form: FormState): string {
  const platform =
    form.appointmentType === "virtual"
      ? (VIRTUAL_PLATFORMS.find((p) => p.id === form.virtualPlatform)?.label ??
        "")
      : "";

  const occasion =
    OCCASIONS.find((o) => o.id === form.occasion)?.label ?? form.occasion;

  const lines = [
    `Hello ZENmen 👋`,
    ``,
    `I'd like to book a ${form.appointmentType === "in-store" ? "🏪 In-Store" : `🎥 Virtual (${platform})`} appointment.`,
    ``,
    `📋 *Details*`,
    `• Name: ${form.name}`,
    `• Email: ${form.email}`,
    `• Phone: ${form.phone}`,
    `• Occasion: ${occasion}`,
    `• Date: ${form.preferredDate}`,
    `• Time: ${form.preferredTime}`,
    form.budget ? `• Budget: ${form.budget}` : "",
    ``,
    form.message ? `💬 *Message*\n${form.message}` : "",
    ``,
    `Looking forward to hearing from you!`,
  ]
    .filter((l) => l !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return encodeURIComponent(lines);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500">
      <span>⚠</span> {msg}
    </p>
  );
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#64748b]">
      {children}
      {required && <span className="ml-1 text-[#7da8c7]">*</span>}
    </label>
  );
}

function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  min,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  min?: string;
}) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border bg-white px-4 py-3 text-[13px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] transition-colors duration-200 ${
          error
            ? "border-red-300 focus:border-red-400"
            : "border-[#e2e8f0] focus:border-[#7da8c7]"
        }`}
      />
      <FieldError msg={error} />
    </div>
  );
}

// ── Info Column ───────────────────────────────────────────────────────────────

function InfoColumn() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.38em] text-[#7da8c7]">
          Private Consultation
        </p>
        <h2 className="mb-4 font-heading text-[clamp(32px,4vw,52px)] font-light leading-[1.02] text-[#0f172a]">
          Book Your
          <br />
          <em className="not-italic text-[#7da8c7]">Fitting Session</em>
        </h2>
        <p className="text-[13px] leading-[1.85] text-[#475569]">
          Whether you're in Delhi or across the world, our master craftsmen are
          ready to guide you — in person at our atelier or via a private virtual
          consultation.
        </p>
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {/* In-Store */}
        <div className="border border-[#e2e8f0] bg-[#f8fafc] p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center border border-[#d6e1ec] bg-white text-base">
              🏪
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#0f172a] font-medium">
              In-Store
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-[#64748b]">
            Visit our South Extension atelier. Try fabrics, get measured, and
            walk away with a custom fit plan.
          </p>
          <div className="mt-4 space-y-1.5 text-[11px] text-[#475569]">
            <p>📍 South Extension Part II, New Delhi</p>
            <p>🕐 Mon–Sat · 11 AM – 8 PM</p>
            <p>✅ Walk-ins & appointments welcome</p>
          </div>
        </div>

        {/* Virtual */}
        <div className="border border-[#e2e8f0] bg-[#f8fafc] p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center border border-[#d6e1ec] bg-white text-base">
              🎥
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#0f172a] font-medium">
              Virtual
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-[#64748b]">
            Connect via WhatsApp Video, Zoom, Google Meet, Teams, or FaceTime —
            we come to you.
          </p>
          <div className="mt-4 space-y-1.5 text-[11px] text-[#475569]">
            <p>🌍 Available worldwide</p>
            <p>🕐 Mon–Sat · 11 AM – 8 PM IST</p>
            <p>📦 Swatches shipped on request</p>
          </div>
        </div>
      </div>

      {/* Detail tiles */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { k: "Turnaround", v: "10–21 Days" },
          { k: "Rush Orders", v: "7 Days Available" },
          { k: "Specialty", v: "Bespoke Groom & Occasion" },
          { k: "Guarantee", v: "Perfect Fit Promise" },
        ].map(({ k, v }) => (
          <div key={k} className="border border-[#e2e8f0] bg-white p-4">
            <p className="mb-1 text-[9px] uppercase tracking-[0.22em] text-[#7da8c7]">
              {k}
            </p>
            <p className="font-heading text-[17px] font-light leading-snug text-[#0f172a]">
              {v}
            </p>
          </div>
        ))}
      </div>

      {/* Direct WhatsApp CTA */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between border border-[#25D366] bg-[#f0fdf4] px-5 py-4 transition-colors duration-200 hover:bg-[#dcfce7] no-underline"
      >
        <div className="flex items-center gap-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M12.032 3.024c-4.967 0-9 4.033-9 9 0 1.59.414 3.153 1.2 4.53L3 21.024l4.545-1.212a8.97 8.97 0 0 0 4.287 1.092c4.967 0 9-4.033 9-9s-4.033-9-9-9z"
              fill="#25D366"
            />
            <path
              d="M16.968 13.68c-.276-.144-1.632-.804-1.884-.9-.252-.096-.432-.144-.612.144-.18.288-.696.9-.852 1.08-.156.18-.312.204-.588.06-.804-.372-1.68-.828-2.352-1.488a8.973 8.973 0 0 1-1.62-2.052c-.144-.252-.012-.384.108-.504.108-.108.252-.288.384-.432.12-.144.168-.24.252-.408.084-.168.036-.312-.024-.432-.06-.12-.612-1.476-.84-2.028-.216-.528-.444-.456-.612-.468-.156-.012-.336-.012-.516-.012a.96.96 0 0 0-.696.324 2.94 2.94 0 0 0-.912 2.148c0 1.26.912 2.472 1.032 2.64.12.168 1.764 2.736 4.272 3.84.6.264 1.056.42 1.416.54.6.192 1.152.156 1.584.096.48-.072 1.476-.6 1.68-1.188.204-.588.204-1.092.144-1.2-.06-.096-.216-.156-.48-.3z"
              fill="white"
            />
          </svg>
          <div>
            <p className="text-[12px] font-medium text-[#15803d]">
              Chat directly on WhatsApp
            </p>
            <p className="text-[11px] text-[#166534]/70">
              +91 96507 53273 · Usually replies in minutes
            </p>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#25D366"
          strokeWidth="1.5"
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        >
          <path
            d="M5 12h14M12 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Contact() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    appointmentType: "in-store",
    virtualPlatform: "",
    occasion: "",
    preferredDate: "",
    preferredTime: "",
    budget: "",
    message: "",
    consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      document
        .getElementById(firstKey)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Build WhatsApp URL and open
    const msg = buildWhatsAppMessage(form);
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      appointmentType: "in-store",
      virtualPlatform: "",
      occasion: "",
      preferredDate: "",
      preferredTime: "",
      budget: "",
      message: "",
      consent: false,
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section
      id="contact"
      className="bg-[#f8fafc] border-t border-[#e2e8f0] py-20 md:py-28 px-4 sm:px-8 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Section eyebrow */}
        <div className="mb-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e2e8f0]" />
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#94a3b8]">
            ZENmen · New Delhi
          </p>
          <div className="h-px flex-1 bg-[#e2e8f0]" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* LEFT — Info */}
          <InfoColumn />

          {/* RIGHT — Form */}
          <div className="border border-[#e2e8f0] bg-white p-6 sm:p-8 md:p-10 shadow-[0_4px_40px_rgba(15,23,42,0.05)]">
            {submitted ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center border border-[#d6e1ec] bg-[#f0f6fb]">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7da8c7"
                    strokeWidth="1.5"
                  >
                    <path
                      d="m5 12 5 5L20 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 font-heading text-[28px] font-light text-[#0f172a]">
                  Request Sent
                </h3>
                <p className="mb-2 text-[13px] leading-relaxed text-[#475569]">
                  Your booking request has been sent to WhatsApp. Our team will
                  confirm your appointment shortly.
                </p>
                <p className="mb-8 text-[12px] text-[#94a3b8]">
                  Didn't open WhatsApp?{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7da8c7] underline underline-offset-2 hover:text-[#5a8faf]"
                  >
                    Click here
                  </a>
                </p>
                <button
                  onClick={handleReset}
                  className="border border-[#e2e8f0] bg-white px-8 py-3 text-[10px] uppercase tracking-[0.22em] text-[#475569] transition-colors hover:border-[#7da8c7] hover:text-[#7da8c7]"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="mb-8">
                  <h3 className="mb-1 font-heading text-[28px] font-light text-[#0f172a]">
                    Reserve Your Fitting
                  </h3>
                  <p className="text-[12px] uppercase tracking-[0.15em] text-[#94a3b8]">
                    All fields marked <span className="text-[#7da8c7]">*</span>{" "}
                    are required
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* ── Step 1: Appointment Type ── */}
                  <div>
                    <Label required>Appointment Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["in-store", "virtual"] as AppointmentType[]).map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              set("appointmentType", type);
                              set("virtualPlatform", "");
                            }}
                            className={`flex items-center gap-2.5 border px-4 py-3.5 text-left text-[12px] transition-all duration-200 ${
                              form.appointmentType === type
                                ? "border-[#7da8c7] bg-[#f0f6fb] text-[#0f172a]"
                                : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#7da8c7]"
                            }`}
                          >
                            <span className="text-base">
                              {type === "in-store" ? "🏪" : "🎥"}
                            </span>
                            <span className="font-medium capitalize">
                              {type === "in-store" ? "In-Store" : "Virtual"}
                            </span>
                            {form.appointmentType === type && (
                              <span className="ml-auto">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#7da8c7"
                                  strokeWidth="2.5"
                                >
                                  <path
                                    d="m5 12 5 5L20 7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* ── Virtual Platform Picker ── */}
                  {form.appointmentType === "virtual" && (
                    <div id="virtualPlatform">
                      <Label required>Video Platform</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {VIRTUAL_PLATFORMS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => set("virtualPlatform", p.id)}
                            className={`flex items-center gap-2 border px-3 py-2.5 text-[12px] transition-all duration-200 ${
                              form.virtualPlatform === p.id
                                ? "border-[#7da8c7] bg-[#f0f6fb] text-[#0f172a]"
                                : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#7da8c7]"
                            }`}
                          >
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>
                      <FieldError msg={errors.virtualPlatform} />
                    </div>
                  )}

                  {/* ── Personal Details ── */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div id="name">
                        <Label required>Full Name</Label>
                        <Input
                          placeholder="Your full name"
                          value={form.name}
                          onChange={(v) => set("name", v)}
                          error={errors.name}
                        />
                      </div>
                      <div id="phone">
                        <Label required>Phone / WhatsApp</Label>
                        <Input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(v) => set("phone", v)}
                          error={errors.phone}
                        />
                      </div>
                    </div>
                    <div id="email">
                      <Label required>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(v) => set("email", v)}
                        error={errors.email}
                      />
                    </div>
                  </div>

                  {/* ── Occasion ── */}
                  <div id="occasion">
                    <Label required>Occasion</Label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => set("occasion", o.id)}
                          className={`border px-3.5 py-2 text-[11px] tracking-[0.06em] transition-all duration-200 ${
                            form.occasion === o.id
                              ? "border-[#7da8c7] bg-[#f0f6fb] text-[#0f172a]"
                              : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#7da8c7]"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <FieldError msg={errors.occasion} />
                  </div>

                  {/* ── Date & Time ── */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div id="preferredDate">
                      <Label required>Preferred Date</Label>
                      <input
                        type="date"
                        min={today}
                        value={form.preferredDate}
                        onChange={(e) => set("preferredDate", e.target.value)}
                        className={`w-full border bg-white px-4 py-3 text-[13px] text-[#0f172a] outline-none transition-colors duration-200 ${
                          errors.preferredDate
                            ? "border-red-300 focus:border-red-400"
                            : "border-[#e2e8f0] focus:border-[#7da8c7]"
                        }`}
                      />
                      <FieldError msg={errors.preferredDate} />
                    </div>
                    <div id="preferredTime">
                      <Label required>Preferred Time</Label>
                      <select
                        value={form.preferredTime}
                        onChange={(e) => set("preferredTime", e.target.value)}
                        className={`w-full border bg-white px-4 py-3 text-[13px] text-[#0f172a] outline-none transition-colors duration-200 ${
                          errors.preferredTime
                            ? "border-red-300 focus:border-red-400"
                            : "border-[#e2e8f0] focus:border-[#7da8c7]"
                        }`}
                      >
                        <option value="">Select a time slot</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <FieldError msg={errors.preferredTime} />
                    </div>
                  </div>

                  {/* ── Budget ── */}
                  <div>
                    <Label>Approximate Budget</Label>
                    <div className="flex flex-wrap gap-2">
                      {BUDGET_OPTIONS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() =>
                            set("budget", form.budget === b ? "" : b)
                          }
                          className={`border px-3 py-1.5 text-[11px] tracking-[0.04em] transition-all duration-200 ${
                            form.budget === b
                              ? "border-[#7da8c7] bg-[#f0f6fb] text-[#0f172a]"
                              : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#7da8c7]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Message ── */}
                  <div>
                    <Label>Additional Message</Label>
                    <textarea
                      placeholder="Tell us your style preferences, measurements, references or any special requests..."
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      rows={4}
                      maxLength={600}
                      className="w-full resize-none border border-[#e2e8f0] bg-white px-4 py-3 text-[13px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] transition-colors duration-200 focus:border-[#7da8c7]"
                    />
                    <p className="mt-1 text-right text-[10px] text-[#94a3b8]">
                      {form.message.length}/600
                    </p>
                  </div>

                  {/* ── Consent ── */}
                  <div id="consent">
                    <label className="flex cursor-pointer items-start gap-3">
                      <div
                        onClick={() => set("consent", !form.consent)}
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border-2 transition-colors duration-200 ${
                          form.consent
                            ? "border-[#7da8c7] bg-[#7da8c7]"
                            : errors.consent
                              ? "border-red-400"
                              : "border-[#cbd5e1]"
                        }`}
                      >
                        {form.consent && (
                          <svg
                            width="9"
                            height="7"
                            viewBox="0 0 9 7"
                            fill="none"
                          >
                            <path
                              d="M1 3.5L3.5 6L8 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-[12px] leading-relaxed text-[#475569]">
                        I agree that ZENmen may contact me via WhatsApp and
                        email regarding my appointment. I have read the{" "}
                        <Link
                          href="/privacy"
                          className="text-[#7da8c7] underline underline-offset-2 hover:text-[#5a8faf]"
                        >
                          Privacy Policy
                        </Link>
                        . My data is never shared.
                      </span>
                    </label>
                    <FieldError msg={errors.consent} />
                  </div>

                  {/* ── Submit ── */}
                  <button
                    type="submit"
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden border border-[#25D366] bg-[#25D366] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:bg-[#20b859]"
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M12.032 3.024c-4.967 0-9 4.033-9 9 0 1.59.414 3.153 1.2 4.53L3 21.024l4.545-1.212a8.97 8.97 0 0 0 4.287 1.092c4.967 0 9-4.033 9-9s-4.033-9-9-9z"
                        fill="white"
                      />
                      <path
                        d="M16.968 13.68c-.276-.144-1.632-.804-1.884-.9-.252-.096-.432-.144-.612.144-.18.288-.696.9-.852 1.08-.156.18-.312.204-.588.06-.804-.372-1.68-.828-2.352-1.488a8.973 8.973 0 0 1-1.62-2.052c-.144-.252-.012-.384.108-.504.108-.108.252-.288.384-.432.12-.144.168-.24.252-.408.084-.168.036-.312-.024-.432-.06-.12-.612-1.476-.84-2.028-.216-.528-.444-.456-.612-.468-.156-.012-.336-.012-.516-.012a.96.96 0 0 0-.696.324 2.94 2.94 0 0 0-.912 2.148c0 1.26.912 2.472 1.032 2.64.12.168 1.764 2.736 4.272 3.84.6.264 1.056.42 1.416.54.6.192 1.152.156 1.584.096.48-.072 1.476-.6 1.68-1.188.204-.588.204-1.092.144-1.2-.06-.096-.216-.156-.48-.3z"
                        fill="rgba(255,255,255,0.3)"
                      />
                    </svg>

                    <span className="relative">Send via WhatsApp</span>
                  </button>

                  <p className="text-center text-[11px] text-[#94a3b8]">
                    Tapping "Send" opens WhatsApp with your details pre-filled.
                    We confirm appointments within 2 hours.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Bottom trust strip */}
        <div className="mt-16 border-t border-[#e2e8f0] pt-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              {
                icon: "🔒",
                label: "Secure & Private",
                sub: "Your data is never shared or sold",
              },
              {
                icon: "⚡",
                label: "Fast Response",
                sub: "Reply within 2 business hours",
              },
              {
                icon: "🧵",
                label: "Master Crafted",
                sub: "2,000+ bespoke garments delivered",
              },
              {
                icon: "🌍",
                label: "Ships Worldwide",
                sub: "22+ countries served",
              },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="text-center">
                <span className="mb-2 block text-2xl">{icon}</span>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#0f172a]">
                  {label}
                </p>
                <p className="text-[11px] leading-relaxed text-[#94a3b8]">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
