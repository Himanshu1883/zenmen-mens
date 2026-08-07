export type GraphReel = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type CacheState = {
  reels: GraphReel[];
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  consecutiveFailures: number;
  lastErrorMessage: string | null;
};

const globalForInstagram = globalThis as typeof globalThis & {
  __zenmenInstagramCache?: CacheState;
};

function getState(): CacheState {
  if (!globalForInstagram.__zenmenInstagramCache) {
    globalForInstagram.__zenmenInstagramCache = {
      reels: [],
      lastSuccessAt: null,
      lastAttemptAt: null,
      consecutiveFailures: 0,
      lastErrorMessage: null,
    };
  }
  return globalForInstagram.__zenmenInstagramCache;
}

function normalizeCaption(caption?: string): string {
  return (caption ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export function getCachedReels(): GraphReel[] {
  return getState().reels;
}

export function getInstagramCacheHealth() {
  const s = getState();
  return {
    hasReels: s.reels.length > 0,
    reelsCount: s.reels.length,
    lastSuccessAt: s.lastSuccessAt,
    lastAttemptAt: s.lastAttemptAt,
    consecutiveFailures: s.consecutiveFailures,
    lastErrorMessage: s.lastErrorMessage,
    isHealthy: s.consecutiveFailures < 5,
  };
}

export async function refreshInstagramReels(): Promise<GraphReel[]> {
  const state = getState();
  state.lastAttemptAt = new Date().toISOString();

  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) {
    state.lastErrorMessage = "INSTAGRAM_ACCESS_TOKEN not set";
    state.consecutiveFailures += 1;
    return state.reels;
  }

  try {
    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    );
    url.searchParams.set("limit", "20");
    url.searchParams.set("access_token", token);

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      throw new Error(`Graph API ${res.status}`);
    }

    const data = (await res.json()) as { data?: GraphReel[] };
    const raw = data.data ?? [];

    const filtered = raw.filter(
      (m) => m.media_type === "VIDEO" || m.media_type === "CAROUSEL_ALBUM",
    );

    const seen = new Set<string>();
    const deduped: GraphReel[] = [];
    for (const item of filtered) {
      const key = normalizeCaption(item.caption) || item.id;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
      if (deduped.length >= 8) break;
    }

    if (deduped.length > 0) {
      state.reels = deduped;
      state.lastSuccessAt = new Date().toISOString();
      state.consecutiveFailures = 0;
      state.lastErrorMessage = null;
    }

    return state.reels;
  } catch (err) {
    state.consecutiveFailures += 1;
    state.lastErrorMessage =
      err instanceof Error ? err.message : "Instagram fetch failed";
    return state.reels;
  }
}
