import { fallbackAssistantReply, ZENMEN_SYSTEM_PROMPT } from "@/lib/chat/assistant";
import { generateGeminiWithFallbacks } from "@/lib/chat/gemini";
import { chatRequestSchema } from "@/lib/validations/chat.schema";
import { NextResponse } from "next/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function normalizeEnvKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const noBom = raw.replace(/^\uFEFF/, "").trim();
  const unquoted = noBom.replace(/^["']|["']$/g, "").trim();
  return unquoted || undefined;
}

type ResolvedAi =
  | { provider: "openai"; apiKey: string; model: string }
  | { provider: "gemini"; apiKey: string; model: string };

/**
 * Resolves which cloud model to call.
 * - `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` → Gemini
 * - `OPENAI_API_KEY` starting with `AIza` (Google key pasted by mistake) → Gemini
 * - `OPENAI_API_KEY` starting with `sk-` → OpenAI
 */
function resolveChatAi(): ResolvedAi | undefined {
  const geminiLine =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_AI_STUDIO_KEY;
  const gemKey = normalizeEnvKey(geminiLine);
  if (gemKey) {
    return {
      provider: "gemini",
      apiKey: gemKey,
      model:
        normalizeEnvKey(process.env.GEMINI_CHAT_MODEL) ?? "gemini-2.5-flash",
    };
  }

  const openaiLine = process.env.OPENAI_API_KEY ?? process.env.OPENAI_KEY;
  const k = normalizeEnvKey(openaiLine);
  if (!k) return undefined;

  if (k.startsWith("AIza")) {
    return {
      provider: "gemini",
      apiKey: k,
      model:
        normalizeEnvKey(process.env.GEMINI_CHAT_MODEL) ?? "gemini-2.5-flash",
    };
  }

  return {
    provider: "openai",
    apiKey: k,
    model: normalizeEnvKey(process.env.OPENAI_CHAT_MODEL) ?? "gpt-4o-mini",
  };
}

/** Drop UI “concierge hello” assistant turns so the first turn is `user`. */
function stripLeadingAssistants(
  messages: { role: "user" | "assistant"; content: string }[],
): { role: "user" | "assistant"; content: string }[] {
  const rest = [...messages];
  while (rest.length > 0 && rest[0].role === "assistant") {
    rest.shift();
  }
  return rest;
}

function toOpenAiMessagePayload(
  messages: { role: "user" | "assistant"; content: string }[],
): { role: "system" | "user" | "assistant"; content: string }[] {
  const rest = stripLeadingAssistants(messages);
  if (rest.length === 0) {
    return [{ role: "system", content: ZENMEN_SYSTEM_PROMPT }];
  }
  return [
    { role: "system", content: ZENMEN_SYSTEM_PROMPT },
    ...rest.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = chatRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 422 },
      );
    }

    const { messages } = parsed.data;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");

    const resolved = resolveChatAi();
    if (!resolved) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[chat] No AI key — set OPENAI_API_KEY (sk-…) or GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY (AIza…). Restart `next dev` after `.env.local` changes.",
        );
      }
      const text = lastUser
        ? fallbackAssistantReply(lastUser.content)
        : "Hello — I’m here to help with ZENmen bespoke tailoring. What would you like to know?";
      return NextResponse.json({
        reply: text,
        source: "fallback" as const,
      });
    }

    if (process.env.NODE_ENV === "development" && resolved.provider === "gemini") {
      const fromOpenAiSlot =
        normalizeEnvKey(process.env.OPENAI_API_KEY ?? process.env.OPENAI_KEY)
          ?.startsWith("AIza");
      if (fromOpenAiSlot) {
        console.info(
          "[chat] Google AI (Gemini) key detected in OPENAI_API_KEY — using Gemini API (not OpenAI). Prefer GEMINI_API_KEY for clarity.",
        );
      }
    }

    const turns = stripLeadingAssistants(messages);
    if (turns.length === 0) {
      return NextResponse.json(
        { error: "No user message to answer." },
        { status: 422 },
      );
    }

    if (resolved.provider === "gemini") {
      const gem = await generateGeminiWithFallbacks({
        apiKey: resolved.apiKey,
        primaryModel: resolved.model,
        systemPrompt: ZENMEN_SYSTEM_PROMPT,
        messages: turns,
      });

      if (!gem.ok) {
        console.error("[chat] Gemini (all fallbacks)", gem.status, gem.message);
        const msgLower = gem.message.toLowerCase();
        const authFail =
          gem.status === 401 ||
          gem.status === 403 ||
          (msgLower.includes("api key") &&
            (msgLower.includes("invalid") || msgLower.includes("not valid")));

        if (authFail) {
          return NextResponse.json({
            reply:
              "Your Google API key was rejected or lacks access. Create a key in Google AI Studio, enable the Generative Language API, and set `GEMINI_API_KEY` (or fix `OPENAI_API_KEY` if you put the Google key there). Restart `npm run dev` after saving `.env.local`.",
            source: "error" as const,
            ...(process.env.NODE_ENV === "development" && {
              _devHint: `Gemini ${gem.status}: ${gem.message.slice(0, 280)}`,
            }),
          });
        }

        const retry = gem.retryAfterSeconds;
        const quick =
          lastUser != null ? fallbackAssistantReply(lastUser.content) : null;
        const text = quick
          ? `Google’s AI is temporarily over quota or rate-limited${retry ? ` — try again in about ${retry}s` : ""}. Meanwhile: ${quick}`
          : `Google’s AI is temporarily unavailable${retry ? ` — please retry in about ${retry}s` : ""}. Use WhatsApp below for immediate help from our team.`;

        return NextResponse.json({
          reply: text,
          source: "fallback_quota" as const,
          retryAfterSeconds: retry,
          ...(process.env.NODE_ENV === "development" && {
            _devHint: `Gemini ${gem.status}: ${gem.message.slice(0, 280)}`,
          }),
        });
      }

      return NextResponse.json({
        reply: gem.text,
        source: "gemini" as const,
        modelUsed: gem.modelUsed,
      });
    }

    const payloadMessages = toOpenAiMessagePayload(messages);

    const openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resolved.apiKey}`,
      },
      body: JSON.stringify({
        model: resolved.model,
        messages: payloadMessages,
        max_tokens: 900,
        temperature: 0.65,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "");
      let errJson: { error?: { message?: string; code?: string } } = {};
      try {
        errJson = JSON.parse(errText) as typeof errJson;
      } catch {
        /* plain text */
      }
      const errMsg = errJson.error?.message ?? errText.slice(0, 200);
      console.error("[chat] OpenAI HTTP", openaiRes.status, errMsg);

      const text =
        "Something went wrong connecting to OpenAI. Confirm an `sk-` API key and billing, restart the dev server after changing `.env.local`, then try again — or use WhatsApp below.";

      return NextResponse.json({
        reply: text,
        source: "error" as const,
        ...(process.env.NODE_ENV === "development" && {
          _devHint: `OpenAI ${openaiRes.status}: ${errMsg || "unknown"}`,
        }),
      });
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        {
          reply:
            "I didn’t get a clear response. Could you rephrase your question?",
          source: "openai" as const,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ reply, source: "openai" as const });
  } catch (e) {
    console.error("[chat]", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
