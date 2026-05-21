export const RECENTLY_VIEWED_KEY = "zenmen_recently_viewed";
export const RECENTLY_VIEWED_MAX = 12;

export type RecentlyViewedItem = {
  _id: string;
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  category?: string;
  viewedAt: number;
};

export function addRecentlyViewed(
  item: Omit<RecentlyViewedItem, "viewedAt">,
): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const existing: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];

    const next: RecentlyViewedItem = {
      ...item,
      viewedAt: Date.now(),
    };

    const filtered = existing.filter(
      (p) => p._id !== next._id && p.slug !== next.slug,
    );
    const merged = [next, ...filtered].slice(0, RECENTLY_VIEWED_MAX);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("zenmen:recently-viewed"));
  } catch {
    // ignore quota / parse errors
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyViewedItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p._id && p.slug && p.title)
      .sort((a, b) => (b.viewedAt ?? 0) - (a.viewedAt ?? 0));
  } catch {
    return [];
  }
}
