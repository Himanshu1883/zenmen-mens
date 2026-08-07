"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

export type ProfileEditable = {
  name: string;
  email: string | null;
  phone: string | null;
  phoneDisplay: string | null;
  hasPassword: boolean;
  joinedOn: string;
  updatedOn: string;
};

type Props = {
  initial: ProfileEditable;
};

export default function ProfileMemberCard({ initial }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState(initial);

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function resetForm() {
    setName(profile.name);
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
    setCurrentPassword("");
    setNewPassword("");
  }

  function startEdit() {
    resetForm();
    setEditing(true);
  }

  function cancelEdit() {
    resetForm();
    setEditing(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body: Record<string, string> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      if (newPassword) {
        body.newPassword = newPassword;
        if (currentPassword) body.currentPassword = currentPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        profile?: {
          name: string;
          email: string | null;
          phone: string | null;
          phoneDisplay: string | null;
          hasPassword: boolean;
          updatedAt: string | null;
          loginEmailChanged?: boolean;
          sessionMayNeedRefresh?: boolean;
        };
      };

      if (!res.ok || !data.success || !data.profile) {
        toast.error(data.message ?? "Could not update profile");
        return;
      }

      if (data.profile.sessionMayNeedRefresh) {
        toast.success("Profile updated — please sign in again");
        await signOut({ callbackUrl: "/" });
        return;
      }

      setProfile({
        ...profile,
        name: data.profile.name,
        email: data.profile.email,
        phone: data.profile.phone,
        phoneDisplay: data.profile.phoneDisplay,
        hasPassword: data.profile.hasPassword,
        updatedOn: data.profile.updatedAt
          ? new Date(data.profile.updatedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : profile.updatedOn,
      });
      setEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <article className="profile-card">
        <div className="card-title-row">
          <h2 className="card-title">Member Details</h2>
          {!editing ? (
            <button type="button" className="edit-btn" onClick={startEdit}>
              <Pencil className="edit-ico" strokeWidth={2} />
              Edit
            </button>
          ) : (
            <button type="button" className="edit-btn ghost" onClick={cancelEdit}>
              <X className="edit-ico" strokeWidth={2} />
              Cancel
            </button>
          )}
        </div>

        {!editing ? (
          <dl className="profile-list">
            <div className="profile-row">
              <dt>Full Name</dt>
              <dd>{profile.name || "N/A"}</dd>
            </div>
            {profile.email ? (
              <div className="profile-row">
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
            ) : null}
            {profile.phoneDisplay || profile.phone ? (
              <div className="profile-row">
                <dt>Mobile</dt>
                <dd>{profile.phoneDisplay ?? profile.phone}</dd>
              </div>
            ) : null}
            {!profile.email && !profile.phone ? (
              <div className="profile-row">
                <dt>Contact</dt>
                <dd>N/A</dd>
              </div>
            ) : null}
            <div className="profile-row">
              <dt>Role</dt>
              <dd className="role-chip">Member</dd>
            </div>
          </dl>
        ) : (
          <form className="profile-edit-form" onSubmit={(e) => void save(e)}>
            <label className="pe-label">
              Full name
              <input
                className="pe-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                maxLength={80}
                disabled={busy}
              />
            </label>
            <label className="pe-label">
              Email
              <input
                className="pe-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                disabled={busy}
              />
            </label>
            <label className="pe-label">
              Mobile
              <input
                className="pe-input"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="10-digit mobile"
                maxLength={15}
                disabled={busy}
              />
            </label>

            <div className="pe-divider">
              <span>Password (optional)</span>
            </div>

            {profile.hasPassword ? (
              <label className="pe-label">
                Current password
                <input
                  className="pe-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={busy}
                />
              </label>
            ) : (
              <p className="pe-hint">
                No password yet (Google sign-in). Set one below to also sign in
                with email/mobile.
              </p>
            )}
            <label className="pe-label">
              New password
              <input
                className="pe-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                disabled={busy}
                placeholder="Leave blank to keep current"
              />
            </label>

            <button type="submit" className="profile-btn pe-save" disabled={busy}>
              {busy ? <Loader2 className="spin" strokeWidth={2} /> : null}
              Save changes
            </button>
          </form>
        )}
      </article>

      <article className="profile-card">
        <h2 className="card-title">Account Timeline</h2>
        <dl className="profile-list">
          <div className="profile-row">
            <dt>Joined On</dt>
            <dd>{profile.joinedOn}</dd>
          </div>
          <div className="profile-row">
            <dt>Last Updated</dt>
            <dd>{profile.updatedOn}</dd>
          </div>
          <div className="profile-row">
            <dt>Status</dt>
            <dd>Active</dd>
          </div>
        </dl>
      </article>
    </>
  );
}
