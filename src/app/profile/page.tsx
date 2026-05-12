import { getAuthSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { redirect } from "next/navigation";

type ProfileUser = {
  name?: string;
  email?: string;
  role?: "user" | "admin";
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
          <Link href="/contact" className="profile-btn ghost">
            Book Appointment
          </Link>
        </div>

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
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .profile-page {
    min-height: 100dvh;
    padding: 110px 18px 48px;
    background:
      radial-gradient(circle at 85% 0%, rgba(200,169,110,0.18), transparent 45%),
      linear-gradient(180deg, #0d1422 0%, #121b2d 100%);
    color: #e8edf6;
  }

  .profile-shell {
    max-width: 1040px;
    margin: 0 auto;
    border: 1px solid rgba(200,169,110,0.32);
    background: rgba(19,29,47,0.9);
    backdrop-filter: blur(8px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    padding: clamp(22px, 4vw, 46px);
  }

  .profile-head { margin-bottom: 28px; }

  .profile-eyebrow {
    margin: 0 0 10px;
    font-size: 11px;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: #c8a96e;
    font-family: "Cormorant Garamond", serif;
    font-weight: 600;
  }

  .profile-title {
    margin: 0;
    font-family: "Playfair Display", serif;
    font-size: clamp(34px, 5vw, 54px);
    font-weight: 400;
    color: #f0f4fb;
    line-height: 1.05;
  }

  .profile-sub {
    margin: 12px 0 0;
    color: rgba(232,237,246,0.75);
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
    border: 1px solid rgba(200,169,110,0.26);
    background: rgba(14,22,36,0.74);
    padding: 18px;
  }

  .card-title {
    margin: 0 0 14px;
    font-family: "Playfair Display", serif;
    font-size: 24px;
    font-weight: 400;
    color: #f0f4fb;
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
    border-top: 1px solid rgba(200,169,110,0.16);
    padding-top: 10px;
  }

  .profile-row:first-child {
    border-top: none;
    padding-top: 0;
  }

  .profile-row dt {
    color: rgba(232,237,246,0.66);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 600;
  }

  .profile-row dd {
    margin: 0;
    color: #f0f4fb;
    font-size: 14px;
    font-weight: 600;
    text-align: right;
  }

  .role-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(200,169,110,0.5);
    background: rgba(200,169,110,0.12);
    padding: 4px 10px;
    color: #f5e5c4;
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
    border: 1px solid #c8a96e;
    background: #c8a96e;
    color: #10192c;
    padding: 10px 16px;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .profile-btn.ghost {
    background: transparent;
    color: #e7cf9f;
  }

  .profile-story {
    margin-top: 30px;
    border: 1px solid rgba(200,169,110,0.22);
    background: rgba(13,21,34,0.72);
    padding: clamp(16px, 3vw, 28px);
  }

  .story-title {
    margin: 0;
    font-family: "Playfair Display", serif;
    font-size: clamp(24px, 3vw, 34px);
    color: #f0f4fb;
    font-weight: 400;
  }

  .story-copy {
    margin: 10px 0 0;
    color: rgba(232,237,246,0.74);
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
    border: 1px solid rgba(200,169,110,0.2);
    background: rgba(8,14,25,0.7);
    padding: 14px;
  }

  .story-num {
    margin: 0 0 8px;
    font-family: "Cormorant Garamond", serif;
    font-size: 22px;
    color: #c8a96e;
  }

  .story-card h4 {
    margin: 0 0 8px;
    font-family: "Playfair Display", serif;
    font-size: 18px;
    color: #f0f4fb;
    font-weight: 400;
  }

  .story-card p {
    margin: 0;
    color: rgba(232,237,246,0.72);
    line-height: 1.7;
    font-size: 13px;
  }

  @media (max-width: 800px) {
    .profile-grid { grid-template-columns: 1fr; }
    .story-grid { grid-template-columns: 1fr; }
  }
`;
