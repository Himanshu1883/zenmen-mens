import { getAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Link from "next/link";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import RecentlyViewedSection from "./RecentlyViewedSection";

type ProfileUser = {
  _id?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type OrderItem = {
  title: string;
  slug: string;
  price: number;
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
  imageUrl?: string;
};

type ProfileOrder = {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  codFee?: number;
  total: number;
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "cancelled";
  createdAt?: Date | string;
};

function formatDate(value?: Date | string) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value?: Date | string) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function labelize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function orderStatusClass(status: ProfileOrder["status"]) {
  if (status === "confirmed") return "status-confirmed";
  if (status === "cancelled") return "status-cancelled";
  return "status-pending";
}

function paymentStatusClass(status: ProfileOrder["paymentStatus"]) {
  if (status === "paid") return "pay-paid";
  if (status === "failed") return "pay-failed";
  return "pay-pending";
}

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  const role = (session.user as { role?: string }).role ?? "user";
  if (role === "admin") {
    redirect("/admin");
  }

  await connectDB();
  const user = (await User.findOne({ email: session.user.email })
    .select("name email role createdAt updatedAt")
    .lean()) as ProfileUser | null;

  const sessionUserId = session.user.id;
  const userObjectId =
    user?._id ??
    (sessionUserId && mongoose.Types.ObjectId.isValid(sessionUserId)
      ? new mongoose.Types.ObjectId(sessionUserId)
      : null);

  const orderFilter: Record<string, unknown> = userObjectId
    ? {
        $or: [{ userId: userObjectId }, { userEmail: session.user.email }],
      }
    : { userEmail: session.user.email };

  const orders = (await Order.find(orderFilter)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()) as ProfileOrder[];

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-shell">
          <h1 className="profile-title">Profile Unavailable</h1>
          <p className="profile-sub">
            We could not find your account in our records.
          </p>
          <Link href="/" className="profile-btn">
            Return Home
          </Link>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-head">
          <p className="profile-eyebrow">Account</p>
          <h1 className="profile-title">Your Profile</h1>
          <p className="profile-sub">
            Personal details linked to your ZENmen membership.
          </p>
        </div>

        <div className="profile-grid">
          <article className="profile-card">
            <h2 className="card-title">Member Details</h2>
            <dl className="profile-list">
              <div className="profile-row">
                <dt>Full Name</dt>
                <dd>{user.name || "N/A"}</dd>
              </div>
              <div className="profile-row">
                <dt>Email</dt>
                <dd>{user.email || "N/A"}</dd>
              </div>
              <div className="profile-row">
                <dt>Role</dt>
                <dd className="role-chip">Member</dd>
              </div>
            </dl>
          </article>

          <article className="profile-card">
            <h2 className="card-title">Account Timeline</h2>
            <dl className="profile-list">
              <div className="profile-row">
                <dt>Joined On</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
              <div className="profile-row">
                <dt>Last Updated</dt>
                <dd>{formatDate(user.updatedAt)}</dd>
              </div>
              <div className="profile-row">
                <dt>Status</dt>
                <dd>Active</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="profile-actions">
          <Link href="/collection" className="profile-btn">
            View Collection
          </Link>
          <Link href="#recently-viewed" className="profile-btn ghost">
            Recently Viewed
          </Link>
          <Link href="/appointment" className="profile-btn ghost">
            Book Appointment
          </Link>
        </div>

        <section className="profile-orders">
          <div className="orders-head">
            <div>
              <p className="profile-eyebrow">Purchases</p>
              <h2 className="orders-title">My Orders</h2>
              <p className="orders-sub">
                {orders.length === 0
                  ? "You have not placed any orders yet."
                  : `${orders.length} order${orders.length === 1 ? "" : "s"} on your account.`}
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="orders-empty">
              <p>When you checkout from the collection, your orders will appear here.</p>
              <Link href="/collection" className="profile-btn">
                Shop Collection
              </Link>
            </div>
          ) : (
            <ul className="orders-list">
              {orders.map((order) => (
                <li key={String(order._id)} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <p className="order-number">{order.orderNumber}</p>
                      <p className="order-date">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="order-badges">
                      <span
                        className={`order-badge ${orderStatusClass(order.status)}`}
                      >
                        {labelize(order.status)}
                      </span>
                      <span
                        className={`order-badge ${paymentStatusClass(order.paymentStatus)}`}
                      >
                        {labelize(order.paymentStatus)}
                      </span>
                      <span className="order-badge method">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online"}
                      </span>
                    </div>
                  </div>

                  <ul className="order-items">
                    {order.items.map((item, index) => (
                      <li key={`${order.orderNumber}-${index}`} className="order-item">
                        {item.imageUrl ? (
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
                            {item.selectedSize
                              ? ` · Size ${item.selectedSize}`
                              : ""}
                            {item.selectedColor
                              ? ` · ${item.selectedColor}`
                              : ""}
                          </p>
                          <p className="order-item-price">
                            {formatInr(item.price * item.qty)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="order-card-foot">
                    <div className="order-totals">
                      <span>Subtotal {formatInr(order.subtotal)}</span>
                      {(order.codFee ?? 0) > 0 ? (
                        <span>COD fee {formatInr(order.codFee ?? 0)}</span>
                      ) : null}
                    </div>
                    <p className="order-total">Total {formatInr(order.total)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-story">
          <h3 className="story-title">Your Bespoke Journey</h3>
          <p className="story-copy">
            Your profile unlocks a smoother tailoring experience at ZENmen.
            Keep your account updated so fittings, style notes, and order
            communication stay perfectly aligned with your preferences.
          </p>
          <div className="story-grid">
            <article className="story-card">
              <p className="story-num">01</p>
              <h4>Consultation First</h4>
              <p>
                Start with a style consultation to shape your wardrobe around
                your lifestyle, not just occasions.
              </p>
            </article>
            <article className="story-card">
              <p className="story-num">02</p>
              <h4>Measured Precision</h4>
              <p>
                Every pattern is cut to your profile and posture to ensure
                comfort with a refined silhouette.
              </p>
            </article>
            <article className="story-card">
              <p className="story-num">03</p>
              <h4>Final Refinement</h4>
              <p>
                Finishing and fit review ensure the final garment feels truly
                personal and complete.
              </p>
            </article>
          </div>
        </section>
      </div>

      <RecentlyViewedSection />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .profile-page {
    min-height: 100dvh;
    padding: 110px 18px 48px;
    background:
      radial-gradient(circle at 88% 0%, rgba(125,168,199,0.14), transparent 42%),
      linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    color: #0f172a;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .profile-shell,
  .profile-recent-shell {
    max-width: 1040px;
    margin: 0 auto;
    width: 100%;
  }

  .profile-shell {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
    padding: clamp(22px, 4vw, 46px);
  }

  .profile-head { margin-bottom: 28px; }

  .profile-eyebrow {
    margin: 0 0 10px;
    font-size: 11px;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: #7da8c7;
    font-family: "Cormorant Garamond", serif;
    font-weight: 600;
  }

  .profile-title {
    margin: 0;
    font-family: "Playfair Display", serif;
    font-size: clamp(34px, 5vw, 54px);
    font-weight: 600;
    color: #0f172a;
    line-height: 1.05;
  }

  .profile-sub {
    margin: 12px 0 0;
    color: #64748b;
    font-size: 15px;
    line-height: 1.7;
    max-width: 560px;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .profile-card {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 18px;
  }

  .card-title {
    margin: 0 0 14px;
    font-family: "Playfair Display", serif;
    font-size: 24px;
    font-weight: 600;
    color: #0f172a;
  }

  .profile-list {
    margin: 0;
    display: grid;
    gap: 10px;
  }

  .profile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-top: 1px solid #e2e8f0;
    padding-top: 10px;
  }

  .profile-row:first-child {
    border-top: none;
    padding-top: 0;
  }

  .profile-row dt {
    color: #94a3b8;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 600;
  }

  .profile-row dd {
    margin: 0;
    color: #0f172a;
    font-size: 14px;
    font-weight: 600;
    text-align: right;
  }

  .role-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(125, 168, 199, 0.45);
    background: rgba(125, 168, 199, 0.12);
    padding: 4px 10px;
    color: #0f172a;
    font-size: 11px !important;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .profile-actions {
    display: flex;
    gap: 10px;
    margin-top: 22px;
    flex-wrap: wrap;
  }

  .profile-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    border: 1px solid #7da8c7;
    background: #7da8c7;
    color: #0f172a;
    padding: 10px 16px;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 700;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .profile-btn:hover {
    background: #0f172a;
    border-color: #0f172a;
    color: #f8fafc;
  }

  .profile-btn.ghost {
    background: transparent;
    color: #0f172a;
    border-color: #e2e8f0;
  }

  .profile-btn.ghost:hover {
    background: #f8fafc;
    border-color: #7da8c7;
    color: #0f172a;
  }

  .profile-orders {
    margin-top: 30px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    padding: clamp(16px, 3vw, 28px);
  }

  .orders-head { margin-bottom: 18px; }

  .orders-title {
    margin: 0;
    font-family: "Playfair Display", serif;
    font-size: clamp(24px, 3vw, 34px);
    color: #0f172a;
    font-weight: 600;
  }

  .orders-sub {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
  }

  .orders-empty {
    border: 1px dashed #cbd5e1;
    background: #f8fafc;
    padding: 22px;
    display: grid;
    gap: 14px;
    justify-items: start;
  }

  .orders-empty p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
  }

  .orders-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 14px;
  }

  .order-card {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 16px;
  }

  .order-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  .order-number {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.04em;
  }

  .order-date {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
  }

  .order-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  .order-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #475569;
  }

  .order-badge.status-confirmed {
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.1);
    color: #15803d;
  }

  .order-badge.status-pending {
    border-color: rgba(234, 179, 8, 0.35);
    background: rgba(234, 179, 8, 0.1);
    color: #a16207;
  }

  .order-badge.status-cancelled {
    border-color: rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
  }

  .order-badge.pay-paid {
    border-color: rgba(125, 168, 199, 0.45);
    background: rgba(125, 168, 199, 0.15);
    color: #0f172a;
  }

  .order-badge.pay-pending {
    border-color: rgba(234, 179, 8, 0.35);
    background: rgba(234, 179, 8, 0.08);
    color: #a16207;
  }

  .order-badge.pay-failed {
    border-color: rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.08);
    color: #b91c1c;
  }

  .order-badge.method {
    border-color: #e2e8f0;
    background: #fff;
    color: #64748b;
  }

  .order-items {
    list-style: none;
    margin: 0;
    padding: 12px 0 0;
    display: grid;
    gap: 10px;
  }

  .order-item {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 12px;
    align-items: center;
  }

  .order-item-img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border: 1px solid #e2e8f0;
    background: #fff;
  }

  .order-item-img.placeholder {
    background: #e2e8f0;
  }

  .order-item-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    text-decoration: none;
    line-height: 1.4;
  }

  .order-item-title:hover {
    color: #7da8c7;
  }

  .order-item-meta {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
  }

  .order-item-price {
    margin: 4px 0 0;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
  }

  .order-card-foot {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .order-totals {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
    color: #94a3b8;
  }

  .order-total {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }

  .profile-recent-shell {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
    padding: clamp(22px, 4vw, 46px);
    scroll-margin-top: 120px;
  }

  .recent-head { margin-bottom: 22px; }

  .recent-title {
    margin: 0;
    font-family: "Playfair Display", serif;
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 600;
    color: #0f172a;
    line-height: 1.1;
  }

  .recent-sub {
    margin: 10px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
    max-width: 560px;
  }

  .recent-loading {
    margin: 0;
    color: #94a3b8;
    font-size: 14px;
  }

  .recent-empty {
    border: 1px dashed #cbd5e1;
    background: #f8fafc;
    padding: 22px;
    display: grid;
    gap: 14px;
    justify-items: start;
  }

  .recent-empty p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
  }

  .recent-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
  }

  .recent-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .recent-card:hover {
    border-color: #7da8c7;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  }

  .recent-img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
  }

  .recent-img.placeholder { background: #e2e8f0; }

  .recent-body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .recent-cat {
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7da8c7;
    font-weight: 600;
  }

  .recent-name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recent-price {
    margin: 4px 0 0;
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
  }

  .profile-story {
    margin-top: 30px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    padding: clamp(16px, 3vw, 28px);
  }

  .story-title {
    margin: 0;
    font-family: "Playfair Display", serif;
    font-size: clamp(24px, 3vw, 34px);
    color: #0f172a;
    font-weight: 600;
  }

  .story-copy {
    margin: 10px 0 0;
    color: #64748b;
    line-height: 1.8;
    font-size: 14px;
    max-width: 740px;
  }

  .story-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .story-card {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 14px;
  }

  .story-num {
    margin: 0 0 8px;
    font-family: "Cormorant Garamond", serif;
    font-size: 22px;
    color: #7da8c7;
  }

  .story-card h4 {
    margin: 0 0 8px;
    font-family: "Playfair Display", serif;
    font-size: 18px;
    color: #0f172a;
    font-weight: 600;
  }

  .story-card p {
    margin: 0;
    color: #64748b;
    line-height: 1.7;
    font-size: 13px;
  }

  @media (max-width: 800px) {
    .profile-grid { grid-template-columns: 1fr; }
    .story-grid { grid-template-columns: 1fr; }
    .order-card-head { flex-direction: column; }
    .order-badges { justify-content: flex-start; }
    .recent-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;
