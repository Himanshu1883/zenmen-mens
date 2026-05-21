"use client";

import {
  getRecentlyViewed,
  type RecentlyViewedItem,
} from "@/lib/recently-viewed";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function RecentlyViewedGrid() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    setItems(getRecentlyViewed());
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("zenmen:recently-viewed", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("zenmen:recently-viewed", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [load]);

  if (!ready) {
    return <p className="recent-loading">Loading recently viewed…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="recent-empty">
        <p>Explore the collection to build your shortlist.</p>
        <Link href="/collection" className="profile-btn">
          Shop Collection
        </Link>
      </div>
    );
  }

  return (
    <ul className="recent-grid">
      {items.map((item) => (
        <li key={item._id}>
          <Link
            href={`/collection/${encodeURIComponent(item.slug)}`}
            className="recent-card"
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="recent-img" />
            ) : (
              <div className="recent-img placeholder" aria-hidden />
            )}
            <div className="recent-body">
              {item.category ? <p className="recent-cat">{item.category}</p> : null}
              <h3 className="recent-name">{item.title}</h3>
              <p className="recent-price">{formatInr(item.price)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
