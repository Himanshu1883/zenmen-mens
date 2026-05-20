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
          <Link href="/appointment" className="profile-btn ghost">
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
      radial-gradient(circle at 88% 0%, rgba(125,168,199,0.14), transparent 42%),
      linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    color: #0f172a;
  }

  .profile-shell {
    max-width: 1040px;
    margin: 0 auto;
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
  }
`;
