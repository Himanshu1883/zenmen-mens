"use client";

import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";
import {
  ChevronRight,
  Clock,
  LayoutDashboard,
  Loader2,
  LogOut,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

type UserAuthPanelProps = {
  open: boolean;
  onClose: () => void;
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

const PANEL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EXIT_MS = 160;

const AUTH_GALLERY_IMAGES: { src: string; alt: string }[] = [
  { src: "/store_1.jpeg", alt: "ZENmen atelier" },
  { src: "/store_2.jpeg", alt: "Bespoke suiting" },
  { src: "/zenmen_white_2.jpeg", alt: "Formal wear" },
  { src: "/WhatsApp_Image_2026-04-28_at_9.56.51_PM.jpeg", alt: "Groomwear" },
  { src: "/store_3.jpeg", alt: "Tailoring" },
  { src: "/banner_kurta.png", alt: "Kurta collection" },
  { src: "/store_4.jpeg", alt: "Atelier detail" },
  { src: "/WhatsApp_Image_2026-05-03_at_4.30.36_PM.jpeg", alt: "Menswear" },
  { src: "/hero_mobile_formal_deck.png", alt: "Deck style" },
  { src: "/store_5.jpeg", alt: "ZENmen store" },
  { src: "/WhatsApp_Image_2026-04-28_at_9.56.47_PM.jpeg", alt: "Collection" },
  { src: "/ChatGPT_Image_May_20__2026__12_08_02_PM.png", alt: "Editorial" },
];

// Split images into 3 columns
const COL_1 = AUTH_GALLERY_IMAGES.slice(0, 4);
const COL_2 = AUTH_GALLERY_IMAGES.slice(4, 8);
const COL_3 = AUTH_GALLERY_IMAGES.slice(8, 12);

// Each column duplicated for seamless loop
function VerticalMarqueeColumn({
  images,
  direction,
  speed = 30,
}: {
  images: { src: string; alt: string }[];
  direction: "down" | "up";
  speed?: number;
}) {
  const doubled = [...images, ...images];

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="flex flex-col gap-[10px]"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="relative w-full flex-shrink-0 overflow-hidden bg-[#1e293b]"
            style={{ height: "140px" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="15vw"
              className="object-cover object-center"
              priority={i < 4}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-down {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes marquee-up {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const AuthMasonryGallery = memo(function AuthMasonryGallery({
  compact = false,
}: {
  compact?: boolean;
}) {
  if (compact) {
    // Mobile: horizontal strip with vertical marquee in 3 mini columns
    return (
      <div
        className="relative shrink-0 overflow-hidden bg-[#0f172a] md:hidden"
        style={{ height: "min(44vw, 200px)", width: "100%" }}
        aria-hidden
      >
        <div className="flex h-full w-full gap-[10px] p-[5px]">
          <VerticalMarqueeColumn images={COL_1} direction="down" speed={18} />
          <VerticalMarqueeColumn images={COL_2} direction="up" speed={22} />
          <VerticalMarqueeColumn images={COL_3} direction="down" speed={20} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f172a]/40 via-transparent to-[#0f172a]/40" />
      </div>
    );
  }

  return (
    <div
      className="relative hidden shrink-0 overflow-hidden bg-white md:flex md:w-[44%] lg:w-[46%]"
      style={{ alignSelf: "stretch" }}
      aria-hidden
    >
      <div className="flex h-full w-full gap-[10px] p-[5px]">
        <VerticalMarqueeColumn images={COL_1} direction="down" speed={25} />
        <VerticalMarqueeColumn images={COL_2} direction="up" speed={30} />
        <VerticalMarqueeColumn images={COL_3} direction="down" speed={22} />
      </div>
      {/* Left-to-right fade into white panel */}
      {/* <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-[#0f172a]/20" /> */}
      {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f172a]/30 via-transparent to-[#0f172a]/30" /> */}
    </div>
  );
});

export default function UserAuthPanel({ open, onClose }: UserAuthPanelProps) {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const [layerMounted, setLayerMounted] = useState(false);
  const [layerVisible, setLayerVisible] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const [reducedMotion, setReducedMotion] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (open) {
      setLayerMounted(true);
      if (reducedMotion) {
        setLayerVisible(true);
        return;
      }
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setLayerVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }

    setLayerVisible(false);
    const delay = reducedMotion ? 0 : EXIT_MS;
    exitTimerRef.current = setTimeout(() => {
      setLayerMounted(false);
      exitTimerRef.current = null;
    }, delay);
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open, reducedMotion]);

  useEffect(() => {
    if (!open || !layerMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, layerMounted]);

  const resetForms = useCallback(() => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirm("");
    setMode("login");
  }, []);

  const handleClose = useCallback(() => {
    resetForms();
    onClose();
  }, [resetForms, onClose]);

  useEffect(() => {
    if (!open || !layerMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, layerMounted, handleClose]);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      toast.error("Could not start Google sign-in");
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email or password");
        return;
      }
      toast.success("Signed in");
      handleClose();
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirm,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not create account");
        return;
      }
      const sign = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (sign?.error) {
        toast.success("Account created — please sign in");
        setMode("login");
        setLoginEmail(parsed.data.email);
        return;
      }
      toast.success("Welcome to ZENmen");
      handleClose();
    } finally {
      setBusy(false);
    }
  };

  const sessionUser = session?.user as SessionUser | undefined;
  const isLoggedIn = Boolean(sessionUser?.email);
  const role = sessionUser?.role ?? "user";
  const isAdmin = role === "admin";

  const backdropDuration = reducedMotion ? "0ms" : "140ms";
  const panelDuration = reducedMotion ? "0ms" : "200ms";

  if (!layerMounted) return null;

  return (
    <div className="fixed inset-0 z-[100] isolate" aria-hidden={!layerVisible}>
      <button
        type="button"
        aria-label="Close account panel"
        className="absolute inset-0 border-0 bg-[#070b14]/55 p-0 transition-opacity ease-out"
        style={{
          opacity: layerVisible ? 1 : 0,
          transitionDuration: backdropDuration,
        }}
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pointer-events-auto absolute left-1/2 top-1/2 flex max-h-[min(92vh,720px)] w-[min(94vw,920px)] flex-col overflow-hidden rounded-[2px] border border-[#1b2232]/12 bg-white shadow-[0_20px_60px_-16px_rgba(15,23,42,0.28)] md:max-h-[min(88vh,640px)] md:min-h-[min(520px,88vh)] md:flex-row"
        style={{
          opacity: layerVisible ? 1 : 0,
          transform: layerVisible
            ? "translate3d(-50%, -50%, 0)"
            : "translate3d(-50%, calc(-50% + 12px), 0)",
          transitionProperty: "opacity, transform",
          transitionDuration: panelDuration,
          transitionTimingFunction: PANEL_EASE,
        }}
      >
        {/* Gallery panels */}
        <AuthMasonryGallery compact />
        <AuthMasonryGallery />

        {/* Right: auth content */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-full p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-6 pt-12 sm:px-8 sm:pt-14">
            <div className="mb-6 text-center md:mb-8">
              <p
                id={titleId}
                className="m-0 font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.28em] text-[#7da8c7] uppercase"
              >
                {isLoggedIn ? "Member lounge" : "Private access"}
              </p>
              <h2 className="m-0 mt-3 font-[family-name:var(--font-playfair)] text-[clamp(1.75rem,4vw,2.25rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[#0f172a]">
                {isLoggedIn ? (sessionUser?.name ?? "Member") : "Welcome back"}
              </h2>
              {!isLoggedIn && (
                <p className="mx-auto m-0 mt-3 max-w-[320px] font-[family-name:var(--font-montserrat)] text-[13px] font-light leading-relaxed text-[#64748b]">
                  Sign in to continue your bespoke journey with ZENmen.
                </p>
              )}
            </div>

            {status === "loading" ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
                <Loader2
                  className="h-9 w-9 animate-spin text-[#7da8c7]"
                  strokeWidth={1.25}
                />
                <p className="m-0 font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.22em] text-[#94a3b8] uppercase">
                  Loading session
                </p>
              </div>
            ) : isLoggedIn ? (
              <div className="mx-auto w-full max-w-[360px] space-y-5">
                <div className="flex items-center gap-4 rounded-[2px] border border-[#1b2232]/8 bg-[#fafbfc] p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#f1f5f9] shadow-sm ring-1 ring-[#1b2232]/5">
                    {sessionUser?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sessionUser.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#7da8c7]">
                        <UserRound className="h-7 w-7" strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate font-[family-name:var(--font-montserrat)] text-[13px] font-medium text-[#0f172a]">
                      {sessionUser?.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#1b2232]/8 bg-white px-2.5 py-0.5">
                      <Sparkles
                        className="h-3 w-3 text-[#7da8c7]"
                        strokeWidth={1.5}
                      />
                      <span className="font-[family-name:var(--font-montserrat)] text-[9px] font-medium tracking-[0.2em] text-[#64748b] uppercase">
                        {isAdmin ? "Administrator" : role}
                      </span>
                    </div>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={handleClose}
                      className="group flex items-center justify-between gap-3 border border-[#1b2232]/10 bg-[#0f172a] px-4 py-3.5 text-white no-underline transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-lg"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-white/10">
                          <LayoutDashboard
                            className="h-4 w-4 text-[#7da8c7]"
                            strokeWidth={1.5}
                          />
                        </span>
                        <span className="text-left">
                          <span className="block font-[family-name:var(--font-montserrat)] text-[11px] font-medium tracking-[0.18em] uppercase">
                            Admin dashboard
                          </span>
                          <span className="mt-0.5 block font-[family-name:var(--font-montserrat)] text-[11px] font-light text-white/65">
                            Orders, products & settings
                          </span>
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-white/50 group-hover:translate-x-0.5"
                        strokeWidth={1.5}
                      />
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={handleClose}
                    className="group flex items-center justify-between gap-3 border border-[#1b2232]/10 bg-white px-4 py-3.5 text-[#0f172a] no-underline shadow-sm transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:border-[#7da8c7]/35 hover:shadow-md"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#f8fafc]">
                        <UserRound
                          className="h-4 w-4 text-[#7da8c7]"
                          strokeWidth={1.5}
                        />
                      </span>
                      <span className="font-[family-name:var(--font-montserrat)] text-[11px] font-medium tracking-[0.2em] uppercase">
                        Your profile
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#cbd5e1] group-hover:translate-x-0.5 group-hover:text-[#7da8c7]"
                      strokeWidth={1.5}
                    />
                  </Link>

                  <Link
                    href="/profile#recently-viewed"
                    onClick={handleClose}
                    className="group flex items-center justify-between gap-3 border border-[#1b2232]/10 bg-white px-4 py-3.5 text-[#0f172a] no-underline shadow-sm transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:border-[#7da8c7]/35 hover:shadow-md"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#f8fafc]">
                        <Clock
                          className="h-4 w-4 text-[#7da8c7]"
                          strokeWidth={1.5}
                        />
                      </span>
                      <span className="font-[family-name:var(--font-montserrat)] text-[11px] font-medium tracking-[0.2em] uppercase">
                        Recently viewed
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#cbd5e1] group-hover:translate-x-0.5 group-hover:text-[#7da8c7]"
                      strokeWidth={1.5}
                    />
                  </Link>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await signOut({ callbackUrl: "/" });
                        handleClose();
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2.5 border border-[#1b2232]/12 bg-transparent py-3.5 font-[family-name:var(--font-montserrat)] text-[11px] font-medium tracking-[0.2em] text-[#475569] uppercase transition-colors hover:border-[#b45309]/25 hover:bg-[#fff7ed]/80 hover:text-[#9a3412] disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Sign out
                  </button>
                </nav>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[360px] space-y-5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleGoogle}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 border border-[#1b2232]/12 bg-white py-3.5 font-[family-name:var(--font-montserrat)] text-[12px] font-medium tracking-[0.1em] text-[#0f172a] shadow-sm transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-md disabled:opacity-50"
                >
                  <GoogleMark />
                  Continue with Google
                </button>

                <div className="flex items-center gap-4">
                  <span className="h-px flex-1 bg-[#e2e8f0]" />
                  <span className="shrink-0 font-[family-name:var(--font-montserrat)] text-[9px] font-medium tracking-[0.28em] text-[#94a3b8] uppercase">
                    or with email
                  </span>
                  <span className="h-px flex-1 bg-[#e2e8f0]" />
                </div>

                <div className="flex border border-[#e2e8f0] p-1">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`flex-1 cursor-pointer border-0 py-2.5 font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.2em] uppercase transition-colors ${
                      mode === "login"
                        ? "bg-[#0f172a] text-white"
                        : "bg-transparent text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`flex-1 cursor-pointer border-0 py-2.5 font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.2em] uppercase transition-colors ${
                      mode === "signup"
                        ? "bg-[#0f172a] text-white"
                        : "bg-transparent text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    Sign up
                  </button>
                </div>

                {mode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <Field
                      label="Email"
                      type="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={setLoginEmail}
                    />
                    <Field
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={setLoginPassword}
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 border-0 bg-[#0f172a] py-4 font-[family-name:var(--font-montserrat)] text-[11px] font-medium tracking-[0.22em] text-white uppercase transition-[transform,opacity] duration-150 hover:bg-[#1e293b] disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          strokeWidth={1.5}
                        />
                      ) : null}
                      Sign in
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-5">
                    <Field
                      label="Full name"
                      type="text"
                      autoComplete="name"
                      value={signupName}
                      onChange={setSignupName}
                    />
                    <Field
                      label="Email"
                      type="email"
                      autoComplete="email"
                      value={signupEmail}
                      onChange={setSignupEmail}
                    />
                    <Field
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={setSignupPassword}
                    />
                    <Field
                      label="Confirm password"
                      type="password"
                      autoComplete="new-password"
                      value={signupConfirm}
                      onChange={setSignupConfirm}
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 border-0 bg-[#0f172a] py-4 font-[family-name:var(--font-montserrat)] text-[11px] font-medium tracking-[0.22em] text-white uppercase transition-[transform,opacity] duration-150 hover:bg-[#1e293b] disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          strokeWidth={1.5}
                        />
                      ) : null}
                      Create account
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full cursor-pointer border-0 bg-transparent py-1 font-[family-name:var(--font-montserrat)] text-[12px] font-light text-[#64748b] underline-offset-2 hover:text-[#0f172a] hover:underline"
                >
                  No thanks
                </button>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[#f1f5f9] bg-[#fafbfc] px-6 py-3">
            <p className="m-0 text-center font-[family-name:var(--font-montserrat)] text-[9px] font-light tracking-[0.24em] text-[#94a3b8] uppercase">
              ZENmen · Bespoke tailoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = memo(function Field({
  label,
  type,
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={`${label}${type === "email" ? " *" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-[#cbd5e1] bg-transparent px-0 py-2.5 font-[family-name:var(--font-montserrat)] text-sm font-light tracking-wide text-[#0f172a] outline-none transition-[border-color] duration-150 placeholder:text-[#94a3b8] focus:border-[#0f172a]"
      />
    </label>
  );
});

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
