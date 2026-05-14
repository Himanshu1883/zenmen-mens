"use client";

import { cn } from "@/lib/utils";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WA_LINK =
  "https://wa.me/919650753273?text=" +
  encodeURIComponent(
    "Hi ZENmen, I'd like to book an appointment for bespoke tailoring.",
  );

/** Above WhatsApp: `bottom-18` (4.5rem) + `h-14` (3.5rem) + gap */
const CHAT_BOTTOM = "calc(4.5rem + 3.5rem + 0.75rem)";

export default function AiChatWidget() {
  const pathname = usePathname();
  const panelId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello — I’m the ZENmen concierge. Ask about bespoke tailoring, appointments, or our collections.",
    },
  ]);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextUser: ChatMessage = { role: "user", content: text };
    setInput("");
    setMessages((m) => [...m, nextUser]);
    setLoading(true);

    try {
      const history = [...messages, nextUser].slice(-20);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        source?: string;
        _devHint?: string;
      };
      if (process.env.NODE_ENV === "development" && data._devHint) {
        console.warn("[ZENmen chat]", data._devHint);
      }
      if (!res.ok) {
        toast.error(data.error ?? "Could not get a reply");
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "Sorry — something went wrong. Please try again or message us on WhatsApp.",
          },
        ]);
        return;
      }
      if (data.reply) {
        const reply = data.reply;
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      }
    } catch {
      toast.error("Network error");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn’t reach the server. Check your connection or use WhatsApp below.",
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [input, loading, messages]);

  if (isAdmin) return null;

  return (
    <div
      className="pointer-events-none fixed right-6 z-[91]"
      style={{ bottom: CHAT_BOTTOM }}
    >
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {open && (
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="ZENmen chat"
            className="mb-2 flex max-h-[min(520px,calc(100vh-12rem))] w-[min(calc(100vw-3rem),380px)] flex-col overflow-hidden rounded-sm border border-[#1b2232]/12 bg-[#fafaf9] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#1b2232]/10 bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-4 py-3 text-white">
              <div>
                <p className="m-0 font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.22em] text-[#7da8c7] uppercase">
                  ZENmen
                </p>
                <p className="m-0 mt-0.5 font-[family-name:var(--font-playfair)] text-lg font-normal tracking-tight">
                  Concierge
                </p>
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="rounded-full border-0 bg-white/10 p-2 text-white transition-colors hover:bg-white/20 cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="max-h-[340px] min-h-[200px] space-y-3 overflow-y-auto px-4 py-3"
            >
              {messages.map((msg, i) => (
                <div
                  key={`${i}-${msg.role}-${msg.content.slice(0, 12)}`}
                  className={cn(
                    "max-w-[92%] rounded-sm px-3 py-2 text-[13px] leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "ml-auto bg-[#0f172a] text-white"
                      : "mr-auto border border-[#e2e8f0] bg-white text-[#334155]",
                  )}
                >
                  <p className="m-0 whitespace-pre-wrap font-[family-name:var(--font-montserrat)] font-light">
                    {msg.content}
                  </p>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 rounded-sm border border-[#e2e8f0] bg-white px-3 py-2 text-[#64748b]">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="font-[family-name:var(--font-montserrat)] text-[12px]">
                    Thinking…
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-[#1b2232]/8 bg-white/90 px-3 py-2">
              <p className="m-0 text-center font-[family-name:var(--font-montserrat)] text-[9px] tracking-[0.12em] text-[#94a3b8]">
                <Link
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  WhatsApp a stylist
                </Link>
                {" · "}
                <Link
                  href="/contact"
                  className="underline-offset-2 hover:underline"
                >
                  Contact
                </Link>
              </p>
            </div>

            <form
              className="flex gap-2 border-t border-[#1b2232]/10 bg-[#f8fafc] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask about tailoring…"
                disabled={loading}
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-sm border border-[#1b2232]/12 bg-white px-3 py-2.5 font-[family-name:var(--font-montserrat)] text-sm text-[#0f172a] outline-none focus:border-[#7da8c7]/60 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-0 bg-[#0f172a] text-white transition-colors hover:bg-[#7da8c7] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1b2232]/15 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white shadow-[0_14px_30px_-12px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {open ? (
            <X className="h-6 w-6" strokeWidth={1.5} />
          ) : (
            <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}
