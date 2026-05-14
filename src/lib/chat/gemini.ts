type ChatTurn = { role: "user" | "assistant"; content: string };

type GeminiGenerateResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[]; role?: string };
    finishReason?: string;
  }[];
  error?: { message?: string; code?: number; status?: string };
};

/** Models to try after the primary (free-tier quotas differ by model). */
const GEMINI_BUILTIN_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
] as const;

function uniqueModels(primary: string, extras: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of [primary, ...extras]) {
    const s = m.replace(/^models\//, "").trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function shouldTryNextModel(
  status: number,
  message: string,
): boolean {
  if (status === 401 || status === 403) return false;
  if (status === 429 || status === 503 || status === 404) return true;
  const m = message.toLowerCase();
  if (m.includes("api key") && m.includes("invalid")) return false;
  if (m.includes("not valid") && m.includes("api")) return false;
  return (
    m.includes("quota") ||
    m.includes("resource_exhausted") ||
    m.includes("rate limit") ||
    m.includes("limit: 0") ||
    m.includes("overloaded")
  );
}

/** Parse "Please retry in 56.2s" from Gemini error text. */
export function parseGeminiRetryAfterSeconds(message: string): number | undefined {
  const m = message.match(/retry\s+in\s+([\d.]+)\s*s/i);
  if (!m) return undefined;
  const n = Number.parseFloat(m[1]);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.min(Math.ceil(n), 3600);
}

/**
 * Calls Google AI Studio / Gemini `generateContent` (key format `AIzaSy…`).
 * @see https://ai.google.dev/api/rest/v1beta/models.generateContent
 */
export async function generateGeminiReply(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: ChatTurn[];
}): Promise<
  { ok: true; text: string } | { ok: false; status: number; message: string }
> {
  const { apiKey, model, systemPrompt, messages } = params;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const safeModel = model.replace(/^models\//, "").trim() || "gemini-2.5-flash";
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(safeModel)}:generateContent`,
  );
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 1024,
      },
    }),
  });

  const raw = await res.text().catch(() => "");
  let data: GeminiGenerateResponse = {};
  try {
    data = JSON.parse(raw) as GeminiGenerateResponse;
  } catch {
    return {
      ok: false,
      status: res.status,
      message: raw.slice(0, 400) || "Invalid JSON from Gemini",
    };
  }

  if (!res.ok) {
    const msg =
      data.error?.message ??
      (raw.slice(0, 400) || `HTTP ${res.status}`);
    return { ok: false, status: res.status, message: msg };
  }

  if (data.error?.message) {
    return { ok: false, status: res.status || 400, message: data.error.message };
  }

  const parts = data.candidates?.[0]?.content?.parts;
  const text = parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) {
    const reason = data.candidates?.[0]?.finishReason;
    return {
      ok: false,
      status: 200,
      message: reason
        ? `No text in response (finish: ${reason})`
        : "No text in response",
    };
  }

  return { ok: true, text };
}

/**
 * Tries the primary model, then built-in fallbacks (and optional `GEMINI_FALLBACK_MODELS` env).
 * Retries on 429 / quota / overloaded style errors.
 */
export async function generateGeminiWithFallbacks(params: {
  apiKey: string;
  primaryModel: string;
  systemPrompt: string;
  messages: ChatTurn[];
  extraFallbackModels?: string[];
}): Promise<
  | { ok: true; text: string; modelUsed: string }
  | { ok: false; status: number; message: string; retryAfterSeconds?: number }
> {
  const envExtras =
    process.env.GEMINI_FALLBACK_MODELS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const models = uniqueModels(params.primaryModel, [
    ...(params.extraFallbackModels ?? []),
    ...envExtras,
    ...GEMINI_BUILTIN_FALLBACKS,
  ]);

  let last: { ok: false; status: number; message: string } | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i]!;
    const r = await generateGeminiReply({
      apiKey: params.apiKey,
      model,
      systemPrompt: params.systemPrompt,
      messages: params.messages,
    });

    if (r.ok) {
      return { ok: true, text: r.text, modelUsed: model };
    }

    last = r;
    const retryable = shouldTryNextModel(r.status, r.message);
    if (!retryable) {
      return {
        ok: false,
        status: r.status,
        message: r.message,
        retryAfterSeconds: parseGeminiRetryAfterSeconds(r.message),
      };
    }

    if (i < models.length - 1) {
      await new Promise((res) => setTimeout(res, 400));
    }
  }

  return {
    ok: false,
    status: last?.status ?? 503,
    message: last?.message ?? "All Gemini models failed",
    retryAfterSeconds: last?.message
      ? parseGeminiRetryAfterSeconds(last.message)
      : undefined,
  };
}
