"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Globe, Loader2, Shield, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminInstagramReelsSettings from "./AdminInstagramReelsSettings";
import { GlassCard } from "../dashboard/GlassCard";

type ProfileState = {
  name: string;
  email: string;
  phone: string;
  hasPassword: boolean;
};

type SettingsMeta = {
  email: {
    adminOrderEmail: string;
    mailReplyTo: string;
    mailFrom: string;
    configured: boolean;
  };
  counts: {
    products: number;
    users: number;
    categories: number;
    orders: number;
    reels: number;
  };
};

export default function Settings() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileState>({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: session?.user?.phone ?? "",
    hasPassword: false,
  });
  const [meta, setMeta] = useState<SettingsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        fetch("/api/profile", { cache: "no-store", credentials: "same-origin" }),
        fetch("/api/admin/settings", { cache: "no-store", credentials: "same-origin" }),
      ]);
      const profileJson = await profileRes.json();
      const settingsJson = await settingsRes.json();

      if (profileRes.ok && profileJson.success && profileJson.profile) {
        setProfile({
          name: profileJson.profile.name ?? "",
          email: profileJson.profile.email ?? "",
          phone: profileJson.profile.phone ?? "",
          hasPassword: Boolean(profileJson.profile.hasPassword),
        });
      }
      if (settingsRes.ok && settingsJson.success) {
        setMeta({
          email: settingsJson.email,
          counts: settingsJson.counts,
        });
      }
    } catch {
      toast.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message ?? "Could not save profile");
        return;
      }
      if (data.profile?.sessionMayNeedRefresh) {
        toast.success("Profile updated — please sign in again");
        await signOut({ callbackUrl: "/" });
        return;
      }
      setProfile((p) => ({
        ...p,
        name: data.profile.name ?? p.name,
        email: data.profile.email ?? p.email,
        phone: data.profile.phone ?? p.phone,
        hasPassword: Boolean(data.profile.hasPassword),
      }));
      toast.success("Profile saved");
    } catch {
      toast.error("Network error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const body: Record<string, string> = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        newPassword,
      };
      if (profile.hasPassword) body.currentPassword = currentPassword;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message ?? "Could not update password");
        return;
      }
      toast.success("Password updated — please sign in again");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Network error");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-16 flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7da8c7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Settings</h1>
        <p className="text-[#64748b]">
          Your admin account, store snapshot, and Instagram reels
        </p>
      </div>

      <GlassCard className="p-6">
        <form onSubmit={saveProfile}>
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[#7da8c7]" />
            <h2 className="text-xl font-semibold text-[#0f172a]">Profile Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-[#64748b] mb-2">Full Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                required
              />
            </div>
            <div>
              <Label className="text-[#64748b] mb-2">Email Address</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
              />
            </div>
            <div>
              <Label className="text-[#64748b] mb-2">Phone Number</Label>
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                placeholder="10-digit mobile"
              />
            </div>
            <div>
              <Label className="text-[#64748b] mb-2">Role</Label>
              <Input
                value="Administrator"
                disabled
                className="bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
            >
              {savingProfile ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-[#7da8c7]" />
          <h2 className="text-xl font-semibold text-[#0f172a]">Order email</h2>
        </div>
        <p className="text-sm text-[#64748b] mb-4">
          New-order alerts go to the address configured on the server. This is
          not a per-admin toggle.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#f8fafc]">
            <p className="text-xs text-[#64748b]">Admin order inbox</p>
            <p className="text-sm font-medium text-[#0f172a] mt-1">
              {meta?.email.adminOrderEmail ?? "—"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#f8fafc]">
            <p className="text-xs text-[#64748b]">Reply-to</p>
            <p className="text-sm font-medium text-[#0f172a] mt-1">
              {meta?.email.mailReplyTo ?? "—"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#f8fafc] md:col-span-2">
            <p className="text-xs text-[#64748b]">From</p>
            <p className="text-sm font-medium text-[#0f172a] mt-1">
              {meta?.email.mailFrom ?? "—"}
            </p>
            <p className="text-xs text-[#94a3b8] mt-2">
              {meta?.email.configured
                ? "Resend is configured — confirmation emails can send."
                : "RESEND_API_KEY is not set — emails will not send."}
            </p>
          </div>
        </div>
      </GlassCard>

      <AdminInstagramReelsSettings />

      <GlassCard className="p-6">
        <form onSubmit={savePassword}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#7da8c7]" />
            <h2 className="text-xl font-semibold text-[#0f172a]">Security</h2>
          </div>

          <div className="space-y-6">
            {profile.hasPassword ? (
              <div>
                <Label className="text-[#64748b] mb-2">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  required
                />
              </div>
            ) : (
              <p className="text-sm text-[#64748b]">
                This account has no password yet (Google sign-in). Set one below
                to also allow email login.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-[#64748b] mb-2">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  required
                />
              </div>
              <div>
                <Label className="text-[#64748b] mb-2">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  required
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            <Button
              type="submit"
              disabled={savingPassword}
              className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
            >
              {savingPassword ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-[#7da8c7]" />
          <h2 className="text-xl font-semibold text-[#0f172a]">Store snapshot</h2>
        </div>
        <p className="text-sm text-[#64748b] mb-4">
          Live counts from MongoDB. Catalog collections use the existing Categories
          admin — not a separate website CMS.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            ["Products", meta?.counts.products ?? 0],
            ["Collections", meta?.counts.categories ?? 0],
            ["Customers", meta?.counts.users ?? 0],
            ["Orders", meta?.counts.orders ?? 0],
            ["Reels", meta?.counts.reels ?? 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="p-4 rounded-xl bg-[#f8fafc]">
              <p className="text-xs text-[#64748b]">{label}</p>
              <p className="text-2xl font-bold text-[#0f172a] mt-1">{value}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
