"use client";

import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";
import { saveCartToStorage } from "@/lib/cart-storage";
import type { CartItem } from "@/store/slices/cartSlice";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

type Props = {
  cartItems: CartItem[];
};

export default function CheckoutAuthForm({ cartItems }: Props) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const inputClass =
    "w-full border border-[#e2e8f0] bg-white px-4 py-3 font-['Jost'] text-sm text-[#0f172a] outline-none transition-shadow focus:border-[#7da8c7] focus:ring-2 focus:ring-[#7da8c7]/20";
  const labelClass =
    "mb-1.5 block font-['Jost'] text-[10px] font-medium uppercase tracking-[0.18em] text-[#64748b]";

  async function persistCartBeforeAuth() {
    saveCartToStorage(cartItems);
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      await persistCartBeforeAuth();
      await signIn("google", { callbackUrl: "/checkout" });
    } catch {
      toast.error("Could not start Google sign-in");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
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
      await persistCartBeforeAuth();
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email/mobile or password");
        return;
      }
      toast.success("Signed in — your cart is ready");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
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
      await persistCartBeforeAuth();
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
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-sm border border-[#e2e8f0] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5 space-y-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleGoogle()}
          className="flex w-full items-center justify-center gap-2 border border-[#e2e8f0] bg-white py-3.5 font-['Jost'] text-[10px] font-medium uppercase tracking-[0.18em] text-[#0f172a] transition-colors hover:border-[#7da8c7] hover:bg-[#f8fafc] disabled:opacity-60"
        >
          Continue with Google
        </button>
        <p className="text-center font-['Jost'] text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
          or with email / mobile
        </p>

        <div className="flex gap-2 border-b border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 border-b-2 pb-3 font-['Jost'] text-[10px] font-medium uppercase tracking-[0.2em] transition-colors ${
              mode === "login"
                ? "border-[#7da8c7] text-[#0f172a]"
                : "border-transparent text-[#94a3b8] hover:text-[#0f172a]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 border-b-2 pb-3 font-['Jost'] text-[10px] font-medium uppercase tracking-[0.2em] transition-colors ${
              mode === "signup"
                ? "border-[#7da8c7] text-[#0f172a]"
                : "border-transparent text-[#94a3b8] hover:text-[#0f172a]"
            }`}
          >
            Create account
          </button>
        </div>
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={labelClass}>Email or mobile number</label>
            <input
              type="text"
              inputMode="email"
              className={inputClass}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              className={inputClass}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 bg-[#0f172a] py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#7da8c7] hover:text-[#0f172a] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in & continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              className={inputClass}
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email or mobile number</label>
            <input
              type="text"
              inputMode="email"
              className={inputClass}
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              className={inputClass}
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Confirm password</label>
            <input
              type="password"
              className={inputClass}
              value={signupConfirm}
              onChange={(e) => setSignupConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 bg-[#0f172a] py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#7da8c7] hover:text-[#0f172a] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create account & continue
          </button>
        </form>
      )}
    </div>
  );
}
