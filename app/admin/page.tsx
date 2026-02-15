"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Users, CreditCard, Mail, Shield, Loader2, Search, AlertTriangle } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isDisabled: boolean;
  createdAt: string;
  freeReportsUsed: number;
  totalReports: number;
  subscriptionStatus: string | null;
}

interface AbuseLogEntry {
  id: string;
  hashedIp: string;
  action: string;
  riskScore: number;
  createdAt: string;
  userEmail: string | null;
}

type Tab = "users" | "payments" | "email" | "abuse";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [abuseLogs, setAbuseLogs] = useState<AbuseLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [emailTo, setEmailTo] = useState("all");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { router.push("/dashboard"); return; }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, abuseRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/abuse-logs"),
      ]);
      if (usersRes.ok) setUsers((await usersRes.json()).users);
      if (abuseRes.ok) setAbuseLogs((await abuseRes.json()).logs);
    } catch {}
    setLoading(false);
  };

  const toggleUser = async (userId: string, action: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    fetchData();
  };

  const sendEmail = async () => {
    setEmailSending(true);
    setEmailResult("");
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody }),
      });
      const data = await res.json();
      setEmailResult(data.success ? `Sent to ${data.count} users` : data.error);
    } catch (err: any) {
      setEmailResult(err.message);
    }
    setEmailSending(false);
  };

  if (!user || user.role !== "ADMIN") return null;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: "users" as Tab, label: "Users", icon: Users },
    { id: "payments" as Tab, label: "Payments", icon: CreditCard },
    { id: "email" as Tab, label: "Email", icon: Mail },
    { id: "abuse" as Tab, label: "Abuse Logs", icon: Shield },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              tab === t.id ? "bg-brand-accent text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="h-8 w-8 text-brand-accent mx-auto animate-spin" />
        </div>
      ) : (
        <>
          {tab === "users" && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input className="input pl-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <span className="text-sm text-slate-500">{users.length} users</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left font-medium text-slate-500">Email</th>
                      <th className="pb-3 text-left font-medium text-slate-500">Role</th>
                      <th className="pb-3 text-right font-medium text-slate-500">Reports</th>
                      <th className="pb-3 text-left font-medium text-slate-500">Status</th>
                      <th className="pb-3 text-right font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3">
                          <p className="font-medium text-slate-900">{u.email}</p>
                          <p className="text-xs text-slate-500">{u.name || "No name"} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3">
                          <span className={`tag ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : ""}`}>{u.role}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-slate-900">{u.totalReports}</span>
                          <span className="text-slate-500"> ({u.freeReportsUsed} free)</span>
                        </td>
                        <td className="py-3">
                          {u.isDisabled ? (
                            <span className="tag bg-red-100 text-red-700">Disabled</span>
                          ) : (
                            <span className="tag bg-green-100 text-green-700">Active</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => toggleUser(u.id, u.isDisabled ? "enable" : "disable")}
                              className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">
                              {u.isDisabled ? "Enable" : "Disable"}
                            </button>
                            <button onClick={() => toggleUser(u.id, "resetReports")}
                              className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "payments" && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Subscription Status</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left font-medium text-slate-500">User</th>
                      <th className="pb-3 text-left font-medium text-slate-500">Plan</th>
                      <th className="pb-3 text-left font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter((u) => u.subscriptionStatus).map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 text-slate-900">{u.email}</td>
                        <td className="py-3 text-slate-600">Pro</td>
                        <td className="py-3">
                          <span className={`tag ${u.subscriptionStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {u.subscriptionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {users.filter((u) => u.subscriptionStatus).length === 0 && (
                      <tr><td colSpan={3} className="py-8 text-center text-slate-500">No subscriptions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "email" && (
            <div className="card max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Send Email</h2>
              <div className="space-y-4">
                <div>
                  <label className="label mb-1.5">Recipients</label>
                  <select className="select" value={emailTo} onChange={(e) => setEmailTo(e.target.value)}>
                    <option value="all">All Users</option>
                    <option value="free">Free Tier Only</option>
                    <option value="paid">Paid Users Only</option>
                  </select>
                </div>
                <div>
                  <label className="label mb-1.5">Subject</label>
                  <input className="input" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject" />
                </div>
                <div>
                  <label className="label mb-1.5">Body</label>
                  <textarea className="input min-h-[120px]" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Email body..." />
                </div>
                {emailResult && <p className="text-sm text-green-700 bg-green-50 p-2 rounded">{emailResult}</p>}
                <button onClick={sendEmail} disabled={emailSending || !emailSubject || !emailBody} className="btn-primary">
                  {emailSending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          )}

          {tab === "abuse" && (
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Abuse Logs</h2>
              {abuseLogs.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">No abuse logs recorded</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-3 text-left font-medium text-slate-500">Time</th>
                        <th className="pb-3 text-left font-medium text-slate-500">User</th>
                        <th className="pb-3 text-left font-medium text-slate-500">Action</th>
                        <th className="pb-3 text-left font-medium text-slate-500">IP Hash</th>
                        <th className="pb-3 text-right font-medium text-slate-500">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abuseLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 text-xs text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-3 text-slate-900">{log.userEmail || "Anonymous"}</td>
                          <td className="py-3 text-slate-600">{log.action}</td>
                          <td className="py-3 text-xs text-slate-500 font-mono">{log.hashedIp.substring(0, 12)}...</td>
                          <td className="py-3 text-right">
                            <span className={`tag ${log.riskScore > 5 ? "bg-red-100 text-red-700" : "bg-slate-100"}`}>{log.riskScore}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
