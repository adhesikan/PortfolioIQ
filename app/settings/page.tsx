"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Loader2, User, Lock, CreditCard, Shield, Calendar,
  CheckCircle, AlertCircle, ExternalLink, Crown, MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, loading: authLoading, refresh, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    setName(user.name || "");
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const isPro = user.subscription?.status === "active" || user.subscription?.status === "trialing";
  const periodEnd = user.subscription?.currentPeriodEnd
    ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: "success", text: "Profile updated successfully" });
        await refresh();
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Something went wrong" });
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: "success", text: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Something went wrong" });
    }
    setSavingPassword(false);
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {}
    setPortalLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your profile, password, and subscription</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-accent" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Enter your name"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>
          {profileMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${profileMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {profileMsg.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {profileMsg.text}
            </div>
          )}
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="btn-primary text-sm"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-brand-accent" />
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>
          {passwordMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${passwordMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {passwordMsg.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {passwordMsg.text}
            </div>
          )}
          <button
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword}
            className="btn-primary text-sm"
          >
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-accent" />
          Subscription
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isPro ? "bg-brand-accent text-white" : "bg-slate-200 text-slate-500"}`}>
              {isPro ? <Crown className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{isPro ? "Pro Plan" : "Free Plan"}</p>
              {isPro && periodEnd && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {user.subscription?.status === "trialing" ? "Trial ends" : "Renews"} {periodEnd}
                </p>
              )}
              {!isPro && user.usage && (
                <p className="text-xs text-slate-500">
                  {user.usage.freeReportsUsed} of 3 free reports used
                </p>
              )}
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isPro ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
              {isPro ? "Active" : "Free"}
            </span>
          </div>

          {isPro ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Manage your subscription, update payment method, view invoices, or cancel your plan through the Stripe billing portal.
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Manage Subscription
                    <ExternalLink className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400">
                You can cancel anytime. Your subscription will remain active until the end of your billing period.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Upgrade to Pro for unlimited Leak Reports (up to 500 trades each), progress tracking, and more.
              </p>
              <Link href="/pricing" className="btn-primary text-sm inline-flex items-center gap-2">
                Upgrade to Pro
                <Crown className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-accent" />
          Account Info
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Account ID</span>
            <span className="text-sm text-slate-900 font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Role</span>
            <span className="text-sm text-slate-900 capitalize">{user.role.toLowerCase()}</span>
          </div>
          {user.usage && (
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Total Reports Generated</span>
              <span className="text-sm text-slate-900">{user.usage.totalReports}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-accent" />
          Support
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Have a question, issue, or feature request? Our team is here to help with product and technical questions.
        </p>
        <Link href="/support" className="btn-secondary text-sm inline-flex items-center gap-2">
          Contact Support
          <MessageSquare className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="card border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Sign Out</h2>
        <p className="text-sm text-red-700 mb-4">Sign out of your account on this device.</p>
        <button
          onClick={async () => { await logout(); router.push("/"); }}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-700 hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
