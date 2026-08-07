"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function ProfileNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        fetch("/api/profile/notifications"),
        fetch("/api/profile/notifications/unread-count"),
      ]);
      const list = await listRes.json();
      const count = await countRes.json();
      if (list.success) {
        setItems(
          (list.notifications ?? []).map(
            (n: Record<string, unknown>) => ({
              _id: String(n._id),
              type: String(n.type),
              title: String(n.title),
              message: String(n.message),
              read: Boolean(n.read),
              createdAt: String(n.createdAt),
            }),
          ),
        );
      }
      if (count.success) setUnread(Number(count.count ?? 0));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAllRead() {
    await fetch("/api/profile/notifications/read-all", { method: "POST" });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="notif-wrap">
      <button
        type="button"
        className="notif-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Notifications
        {unread > 0 ? (
          <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
        ) : null}
      </button>

      {open ? (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <span>Updates</span>
            {unread > 0 ? (
              <button type="button" className="notif-mark" onClick={() => void markAllRead()}>
                Mark all read
              </button>
            ) : null}
          </div>
          {loading ? (
            <p className="notif-empty">Loading…</p>
          ) : items.length === 0 ? (
            <p className="notif-empty">
              No notifications yet. Shipping and delivery updates appear here.
            </p>
          ) : (
            <ul className="notif-list">
              {items.map((n) => (
                <li key={n._id} className={n.read ? "read" : ""}>
                  <p className="notif-title">{n.title}</p>
                  <p className="notif-msg">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/profile" className="notif-foot" onClick={() => setOpen(false)}>
            View orders below
          </Link>
        </div>
      ) : null}

      <style>{`
        .notif-wrap { position: relative; margin-top: 12px; }
        .notif-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 8px 14px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
        }
        .notif-badge {
          background: #7da8c7;
          color: #0f172a;
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          font-size: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
        }
        .notif-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 20;
          width: min(360px, 92vw);
          border: 1px solid #e2e8f0;
          background: #fff;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
        }
        .notif-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748b;
        }
        .notif-mark {
          background: none;
          border: none;
          color: #7da8c7;
          font-size: 11px;
          cursor: pointer;
          text-transform: none;
          letter-spacing: 0;
          font-weight: 600;
        }
        .notif-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 280px;
          overflow-y: auto;
        }
        .notif-list li {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
        }
        .notif-list li:not(.read) { background: rgba(125, 168, 199, 0.08); }
        .notif-title { margin: 0; font-size: 13px; font-weight: 700; color: #0f172a; }
        .notif-msg { margin: 4px 0 0; font-size: 12px; color: #64748b; line-height: 1.5; }
        .notif-empty { margin: 0; padding: 16px 14px; font-size: 13px; color: #94a3b8; }
        .notif-foot {
          display: block;
          padding: 10px 14px;
          font-size: 11px;
          text-align: center;
          color: #7da8c7;
          text-decoration: none;
          border-top: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
}
