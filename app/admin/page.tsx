"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Users, CreditCard, Mail, Shield, Loader2, Search, AlertTriangle, MessageSquare, ArrowLeft, Clock, CheckCircle, XCircle, BarChart3, Globe, Eye, TrendingUp } from "lucide-react";

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
  accountStatus: string;
}

interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string | null;
  category: string;
  subject: string;
  message: string;
  status: string;
  adminResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    subscription: { status: string } | null;
    _count?: { reports: number };
  };
}

interface AbuseLogEntry {
  id: string;
  hashedIp: string;
  action: string;
  riskScore: number;
  createdAt: string;
  userEmail: string | null;
}

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number; unique_visitors: number }>;
  recentViews: Array<{
    id: string;
    path: string;
    hashedIp: string;
    userAgent: string | null;
    referrer: string | null;
    userId: string | null;
    userEmail: string | null;
    deviceId: string | null;
    createdAt: string;
  }>;
  dailyViews: Array<{ date: string; views: number }>;
}

type Tab = "users" | "payments" | "email" | "abuse" | "support" | "analytics";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
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
  const [abuseFilter, setAbuseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState("all");
  const [ticketSearch, setTicketSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [savingTicket, setSavingTicket] = useState(false);
  const [ticketSaveMsg, setTicketSaveMsg] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") { router.push("/dashboard"); return; }
    fetchData();
  }, [user, authLoading, router]);

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

  const fetchTickets = async (page = 1) => {
    setTicketLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (ticketStatusFilter !== "all") params.set("status", ticketStatusFilter);
      if (ticketCategoryFilter !== "all") params.set("category", ticketCategoryFilter);
      if (ticketSearch.trim()) params.set("q", ticketSearch.trim());
      const res = await fetch(`/api/admin/support/tickets?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
        setTicketsTotal(data.total);
        setTicketsPage(data.page);
      }
    } catch {}
    setTicketLoading(false);
  };

  const openTicketDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setAdminResponse(data.ticket.adminResponse || "");
        setTicketStatus(data.ticket.status);
        setTicketSaveMsg("");
      }
    } catch {}
  };

  const saveTicketResponse = async () => {
    if (!selectedTicket) return;
    setSavingTicket(true);
    setTicketSaveMsg("");
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: ticketStatus, adminResponse: adminResponse.trim() || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setTicketSaveMsg("Saved successfully");
        fetchTickets(ticketsPage);
      } else {
        setTicketSaveMsg("Failed to save");
      }
    } catch {
      setTicketSaveMsg("Failed to save");
    }
    setSavingTicket(false);
  };

  const fetchAnalytics = async (range: string) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (res.ok) setAnalytics(await res.json());
    } catch {}
    setAnalyticsLoading(false);
  };

  useEffect(() => {
    if (tab === "support" && user?.role === "ADMIN") fetchTickets(1);
  }, [tab, ticketStatusFilter, ticketCategoryFilter]);

  useEffect(() => {
    if (tab === "analytics" && user?.role === "ADMIN") fetchAnalytics(analyticsRange);
  }, [tab, analyticsRange]);

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

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: "users" as Tab, label: "Users", icon: Users },
    { id: "payments" as Tab, label: "Payments", icon: CreditCard },
    { id: "email" as Tab, label: "Email", icon: Mail },
    { id: "abuse" as Tab, label: "User Sessions", icon: Shield },
    { id: "support" as Tab, label: "Support", icon: MessageSquare },
    { id: "analytics" as Tab, label: "Site Analytics", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Admin Panel</h1>

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
                <select
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="free_exhausted">Free (Limit Reached)</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                  <option value="disabled">Disabled</option>
                </select>
                <span className="text-sm text-slate-500 whitespace-nowrap">{filteredUsers.length} of {users.length}</span>
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
                          <span className="text-slate-500"> ({u.freeReportsUsed}/3 free)</span>
                        </td>
                        <td className="py-3">
                          <span className={`tag ${
                            u.accountStatus === "pro" ? "bg-blue-100 text-blue-700" :
                            u.accountStatus === "disabled" ? "bg-red-100 text-red-700" :
                            u.accountStatus === "past_due" ? "bg-amber-100 text-amber-700" :
                            u.accountStatus === "canceled" ? "bg-orange-100 text-orange-700" :
                            u.accountStatus === "free_exhausted" ? "bg-slate-200 text-slate-600" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {u.accountStatus === "pro" ? "Pro" :
                             u.accountStatus === "disabled" ? "Disabled" :
                             u.accountStatus === "past_due" ? "Past Due" :
                             u.accountStatus === "canceled" ? "Canceled" :
                             u.accountStatus === "free_exhausted" ? "Free (Limit Reached)" :
                             "Free"}
                          </span>
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

          {tab === "support" && (
            selectedTicket ? (
              <div className="card">
                <button
                  onClick={() => { setSelectedTicket(null); setTicketSaveMsg(""); }}
                  className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to list
                </button>

                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Reminder: Provide product/billing/technical assistance only. Do not provide investment advice.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          selectedTicket.status === "open" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" :
                          selectedTicket.status === "pending" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                          "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}>
                          {selectedTicket.status === "open" && <Clock className="h-3 w-3" />}
                          {selectedTicket.status === "pending" && <Clock className="h-3 w-3" />}
                          {selectedTicket.status === "closed" && <CheckCircle className="h-3 w-3" />}
                          {selectedTicket.status}
                        </span>
                        <span>{selectedTicket.category}</span>
                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="label whitespace-nowrap">Status</label>
                        <select
                          className="input w-40"
                          value={ticketStatus}
                          onChange={(e) => setTicketStatus(e.target.value)}
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="label mb-1.5">Admin Response</label>
                        <textarea
                          className="input min-h-[120px] resize-y"
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Type your response to the user..."
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={saveTicketResponse} disabled={savingTicket} className="btn-primary">
                          {savingTicket ? "Saving..." : "Save Response"}
                        </button>
                        {ticketSaveMsg && (
                          <span className={`text-sm ${ticketSaveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                            {ticketSaveMsg}
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedTicket.respondedAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Last responded: {new Date(selectedTicket.respondedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">User Info</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Email</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedTicket.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Name</span>
                          <span className="text-slate-800 dark:text-slate-200">{selectedTicket.userName || "—"}</span>
                        </div>
                        {selectedTicket.user && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Role</span>
                              <span className="text-slate-800 dark:text-slate-200">{selectedTicket.user.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Plan</span>
                              <span className="text-slate-800 dark:text-slate-200">{selectedTicket.user.subscription?.status === "active" ? "Pro" : "Free"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Reports</span>
                              <span className="text-slate-800 dark:text-slate-200">{selectedTicket.user._count?.reports ?? "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Joined</span>
                              <span className="text-slate-800 dark:text-slate-200">{new Date(selectedTicket.user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Reference</h3>
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400">TCK-{selectedTicket.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Reminder: Provide product/billing/technical assistance only. Do not provide investment advice.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      className="input pl-9"
                      placeholder="Search by email or subject..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchTickets(1)}
                    />
                  </div>
                  <select
                    className="input w-auto"
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    className="input w-auto"
                    value={ticketCategoryFilter}
                    onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="feature">Feature</option>
                    <option value="report_question">Report</option>
                    <option value="other">Other</option>
                  </select>
                  <button onClick={() => fetchTickets(1)} className="btn-secondary text-sm">Search</button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{ticketsTotal} tickets</span>
                </div>

                {ticketLoading ? (
                  <div className="text-center py-8"><Loader2 className="h-6 w-6 text-brand-accent mx-auto animate-spin" /></div>
                ) : tickets.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No support tickets found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Created</th>
                          <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Status</th>
                          <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Category</th>
                          <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">User</th>
                          <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Subject</th>
                          <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((t) => (
                          <tr
                            key={t.id}
                            onClick={() => openTicketDetail(t.id)}
                            className="border-b border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                t.status === "open" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" :
                                t.status === "pending" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                                "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-slate-700 dark:text-slate-300 capitalize">{t.category.replace("_", " ")}</td>
                            <td className="py-3 text-xs text-slate-800 dark:text-slate-200">{t.userEmail}</td>
                            <td className="py-3 text-sm text-slate-900 dark:text-slate-100 max-w-[300px] truncate">{t.subject}</td>
                            <td className="py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {new Date(t.updatedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {ticketsTotal > 20 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => fetchTickets(ticketsPage - 1)}
                      disabled={ticketsPage <= 1}
                      className="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Page {ticketsPage} of {Math.ceil(ticketsTotal / 20)}
                    </span>
                    <button
                      onClick={() => fetchTickets(ticketsPage + 1)}
                      disabled={ticketsPage >= Math.ceil(ticketsTotal / 20)}
                      className="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {tab === "analytics" && (
            analyticsLoading ? (
              <div className="card text-center py-12">
                <Loader2 className="h-8 w-8 text-brand-accent mx-auto animate-spin" />
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Site Analytics</h2>
                  <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                    {[
                      { value: "24h", label: "24h" },
                      { value: "7d", label: "7 days" },
                      { value: "30d", label: "30 days" },
                    ].map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setAnalyticsRange(r.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          analyticsRange === r.value
                            ? "bg-brand-accent text-white"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.totalViews.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Total Page Views</p>
                    </div>
                  </div>
                  <div className="card flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.uniqueVisitors.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Unique Visitors</p>
                    </div>
                  </div>
                  <div className="card flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {analytics.uniqueVisitors > 0 ? (analytics.totalViews / analytics.uniqueVisitors).toFixed(1) : "0"}
                      </p>
                      <p className="text-xs text-slate-500">Pages / Visitor</p>
                    </div>
                  </div>
                </div>

                {analytics.dailyViews.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Daily Views</h3>
                    <div className="flex items-end gap-1 h-32">
                      {(() => {
                        const maxViews = Math.max(...analytics.dailyViews.map((d) => d.views), 1);
                        return analytics.dailyViews.map((d, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute -top-8 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                              {new Date(d.date).toLocaleDateString()} — {d.views} views
                            </div>
                            <div
                              className="w-full bg-brand-accent/80 rounded-t hover:bg-brand-accent transition-colors min-h-[2px]"
                              style={{ height: `${(d.views / maxViews) * 100}%` }}
                            />
                          </div>
                        ));
                      })()}
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                      {analytics.dailyViews.length > 0 && (
                        <>
                          <span>{new Date(analytics.dailyViews[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                          <span>{new Date(analytics.dailyViews[analytics.dailyViews.length - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Top Pages</h3>
                  {analytics.topPages.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">No page views yet</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.topPages.map((p, i) => {
                        const maxV = analytics.topPages[0]?.views || 1;
                        return (
                          <div key={i} className="relative">
                            <div
                              className="absolute inset-y-0 left-0 bg-brand-accent/10 dark:bg-brand-accent/20 rounded"
                              style={{ width: `${(p.views / maxV) * 100}%` }}
                            />
                            <div className="relative flex items-center justify-between px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.path}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>{p.views} views</span>
                                <span>{p.unique_visitors} unique</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Recent Visits</h3>
                  {analytics.recentViews.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">No visits recorded yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="pb-3 text-left font-medium text-slate-500">Time</th>
                            <th className="pb-3 text-left font-medium text-slate-500">Page</th>
                            <th className="pb-3 text-left font-medium text-slate-500">Visitor</th>
                            <th className="pb-3 text-left font-medium text-slate-500">Referrer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recentViews.map((v) => (
                            <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                              <td className="py-2.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{new Date(v.createdAt).toLocaleString()}</td>
                              <td className="py-2.5 text-slate-900 dark:text-slate-100 font-medium">{v.path}</td>
                              <td className="py-2.5">
                                {v.userEmail ? (
                                  <span className="text-xs text-brand-accent">{v.userEmail}</span>
                                ) : (
                                  <span className="text-xs text-slate-400 font-mono">{v.hashedIp.substring(0, 10)}...</span>
                                )}
                              </td>
                              <td className="py-2.5 text-xs text-slate-500 max-w-[200px] truncate">{v.referrer || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-sm text-slate-500">No analytics data available</p>
              </div>
            )
          )}

          {tab === "abuse" && (() => {
            const actionTypes = Array.from(new Set(abuseLogs.map((l) => l.action)));
            const filteredLogs = abuseFilter === "all" ? abuseLogs : abuseLogs.filter((l) => l.action === abuseFilter);
            return (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">User Sessions</h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Filter:</label>
                  <select
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                    value={abuseFilter}
                    onChange={(e) => setAbuseFilter(e.target.value)}
                  >
                    <option value="all">All Actions</option>
                    {actionTypes.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-500">{filteredLogs.length} entries</span>
                </div>
              </div>
              {filteredLogs.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">No session logs recorded</p>
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
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 text-xs text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-3 text-slate-900">{log.userEmail || "Anonymous"}</td>
                          <td className="py-3">
                            <span className={`tag ${
                              log.action === "SAMPLE_REPORT_GENERATED" ? "bg-blue-100 text-blue-700" :
                              log.action === "FREE_LIMIT_REACHED" ? "bg-amber-100 text-amber-700" :
                              log.action === "SAMPLE_RATE_LIMIT_HIT" ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-600"
                            }`}>{log.action}</span>
                          </td>
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
            );
          })()}
        </>
      )}
    </div>
  );
}
