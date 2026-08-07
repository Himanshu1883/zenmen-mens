"use client";

import { CANCEL_REASONS } from "@/config/cancellationConfig";
import { saveCartToStorage } from "@/lib/cart-storage";
import type { SerializedOrder } from "@/lib/order-display";
import { formatInr, formatOrderDateTime } from "@/lib/order-display";
import { useAppDispatch } from "@/store/hooks";
import { setCartItems, type CartItem } from "@/store/slices/cartSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import OrderStatusTracker from "./OrderStatusTracker";

const REASON_LABELS: Record<string, string> = {
  changed_mind: "Changed my mind",
  ordered_by_mistake: "Ordered by mistake",
  delivery_too_slow: "Delivery too slow",
  found_better_price: "Found a better price",
  other: "Other",
};

type Props = {
  initialOrders: SerializedOrder[];
};

export default function ProfileOrdersClient({ initialOrders }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SerializedOrder | null>(
    null,
  );
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0]);
  const [note, setNote] = useState("");

  async function refreshOrderList() {
    router.refresh();
  }

  function orderAgain(order: SerializedOrder) {
    const cartItems: CartItem[] = order.items.map((item) => ({
      _id: item.productId,
      title: item.title,
      slug: item.slug,
      price: item.price,
      qty: item.qty,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      image: { url: item.imageUrl ?? "", alt: item.title },
    }));

    if (cartItems.length === 0) {
      toast.error("No items to reorder");
      return;
    }

    dispatch(setCartItems(cartItems));
    saveCartToStorage(cartItems);
    toast.success("Cart ready — delivery details will autofill at checkout");
    router.push("/checkout");
  }

  async function submitCancel() {
    if (!cancelTarget) return;
    setBusyId(cancelTarget.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${cancelTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note: note || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message ?? "Could not cancel");
      }
      const mode = data.mode as string;
      setMessage(
        mode === "requested"
          ? "Cancellation requested — we will email you when reviewed."
          : "Order cancelled successfully.",
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelTarget.id
            ? {
                ...o,
                orderStatus:
                  mode === "requested"
                    ? "cancellation_requested"
                    : "cancelled",
                status:
                  mode === "requested"
                    ? "cancellation_requested"
                    : "cancelled",
                statusHistory: [
                  ...(o.statusHistory ?? []),
                  {
                    status:
                      mode === "requested"
                        ? "cancellation_requested"
                        : "cancelled",
                    changedAt: new Date().toISOString(),
                  },
                ],
              }
            : o,
        ),
      );
      setCancelTarget(null);
      void refreshOrderList();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {message ? <p className="orders-flash">{message}</p> : null}

      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-card-head">
              <div>
                <p className="order-number">{order.orderNumber}</p>
                <p className="order-date">
                  Placed {formatOrderDateTime(order.createdAt)}
                </p>
              </div>
              <p className="order-head-total">{formatInr(order.total)}</p>
            </div>

            <OrderStatusTracker
              orderStatus={order.orderStatus}
              paymentStatus={order.paymentStatus}
              paymentMethod={order.paymentMethod}
              createdAt={order.createdAt}
              statusHistory={order.statusHistory}
            />

            <ul className="order-items">
              {order.items.map((item, index) => (
                <li key={`${order.orderNumber}-${index}`} className="order-item">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="order-item-img"
                    />
                  ) : (
                    <div className="order-item-img placeholder" aria-hidden />
                  )}
                  <div className="order-item-body">
                    <Link
                      href={`/collection/${encodeURIComponent(item.slug)}`}
                      className="order-item-title"
                    >
                      {item.title}
                    </Link>
                    <p className="order-item-meta">
                      Qty {item.qty}
                      {item.selectedSize ? ` · ${item.selectedSize}` : ""}
                      {item.selectedColor ? ` · ${item.selectedColor}` : ""}
                    </p>
                    <p className="order-item-price">
                      {formatInr(item.price * item.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {order.shipping ? (
              <p className="order-ship-to">
                Deliver to {order.shipping.fullName} · {order.shipping.city},{" "}
                {order.shipping.pincode}
              </p>
            ) : null}

            <div className="order-card-foot">
              <div className="order-actions-row">
                <button
                  type="button"
                  className="order-link-btn"
                  onClick={() => orderAgain(order)}
                >
                  Order again
                </button>
                <a
                  href={`/api/orders/${order.id}/invoice`}
                  className="order-link-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Invoice PDF
                </a>
                {![
                  "cancelled",
                  "delivered",
                  "failed",
                  "cancellation_requested",
                  "pending_payment",
                ].includes(order.orderStatus) ? (
                  <button
                    type="button"
                    className="order-link-btn danger"
                    disabled={busyId === order.id}
                    onClick={() => {
                      setCancelTarget(order);
                      setReason(CANCEL_REASONS[0]);
                      setNote("");
                    }}
                  >
                    Cancel order
                  </button>
                ) : null}
              </div>
              <div className="order-totals-block">
                <div className="order-totals">
                  <span>Subtotal {formatInr(order.subtotal)}</span>
                  {order.codFee > 0 ? (
                    <span>COD fee {formatInr(order.codFee)}</span>
                  ) : null}
                </div>
                <p className="order-total">Total {formatInr(order.total)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {cancelTarget ? (
        <div className="cancel-overlay" role="dialog" aria-modal="true">
          <div className="cancel-modal">
            <h3>Cancel {cancelTarget.orderNumber}</h3>
            <p className="cancel-hint">
              Within 30 minutes of placing, cancellation is instant. After that,
              we review your request.
            </p>
            <label className="cancel-label">
              Reason
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="cancel-select"
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {REASON_LABELS[r] ?? r}
                  </option>
                ))}
              </select>
            </label>
            <label className="cancel-label">
              Note (optional)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="cancel-textarea"
                rows={3}
              />
            </label>
            <div className="cancel-actions">
              <button
                type="button"
                className="profile-btn ghost"
                onClick={() => setCancelTarget(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="profile-btn"
                disabled={busyId === cancelTarget.id}
                onClick={() => void submitCancel()}
              >
                Confirm cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .orders-flash {
          margin: 0 0 14px;
          padding: 12px 14px;
          background: rgba(125, 168, 199, 0.12);
          border: 1px solid rgba(125, 168, 199, 0.35);
          font-size: 14px;
          color: #0f172a;
        }
        .order-head-total {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }
        .order-ship-to {
          margin: 0 0 12px;
          font-size: 12px;
          color: #64748b;
        }
        .order-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .order-link-btn {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
          color: #7da8c7;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        .order-link-btn.danger { color: #b91c1c; }
        .order-link-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .order-totals-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .cancel-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .cancel-modal {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 22px;
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.15);
        }
        .cancel-modal h3 {
          margin: 0 0 8px;
          font-family: var(--heading-font-family);
          font-size: 22px;
          color: #0f172a;
        }
        .cancel-hint {
          margin: 0 0 16px;
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
        }
        .cancel-label {
          display: block;
          margin-bottom: 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          font-weight: 600;
        }
        .cancel-select, .cancel-textarea {
          display: block;
          width: 100%;
          margin-top: 6px;
          border: 1px solid #e2e8f0;
          padding: 10px;
          font-size: 14px;
          color: #0f172a;
          background: #f8fafc;
        }
        .cancel-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 16px;
        }
      `}</style>
    </>
  );
}
