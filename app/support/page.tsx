"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { MessageSquare, Send, CheckCircle, AlertCircle, Shield, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "feature", label: "Feature Request" },
  { value: "report_question", label: "Report Clarification" },
  { value: "other", label: "Other" },
];

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  billing: "Billing",
  feature: "Feature Request",
  report_question: "Report",
  other: "Other",
};

interface Ticket {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  adminResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [disclaimerAck, setDisclaimerAck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch("/api/support/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch {}
    setTicketsLoading(false);
  };

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  if (authLoading || !user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!category) { setError("Please select a category."); return; }
    if (subject.trim().length < 3) { setError("Subject must be at least 3 characters."); return; }
    if (message.trim().length < 10) { setError("Message must be at least 10 characters."); return; }
    if (!disclaimerAck) { setError("Please acknowledge the disclaimer to continue."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
          disclaimerAck,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit ticket.");
        return;
      }
      setSuccessTicketId(data.ticketId);
      fetchTickets();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const referenceId = successTicketId ? `TCK-${successTicketId.slice(0, 8).toUpperCase()}` : "";

  const handleCloseSuccess = () => {
    setSuccessTicketId(null);
    setCategory("");
    setSubject("");
    setMessage("");
    setDisclaimerAck(false);
  };

  const statusBadge = (status: string) => {
    const cls =
      status === "open" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" :
      status === "pending" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
      "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
        {status === "open" && <Clock className="h-3 w-3" />}
        {status === "closed" && <CheckCircle className="h-3 w-3" />}
        {status}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-6 w-6 text-brand-accent" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Contact Support</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Have a question or need help? Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Support is for product, billing, and technical questions only. PortfolioIQ does not provide investment advice or trade recommendations.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="card mb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label mb-1.5">Category <span className="text-red-500">*</span></label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label mb-1.5">Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your question"
              maxLength={120}
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subject.length}/120 characters</p>
          </div>

          <div>
            <label className="label mb-1.5">Message <span className="text-red-500">*</span></label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Please do not include account numbers, passwords, or brokerage credentials. For security, remove personal identifiers.
            </p>
            <textarea
              className="input min-h-[140px] resize-y"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              maxLength={3000}
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{message.length}/3000 characters</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAck}
                onChange={(e) => setDisclaimerAck(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                I understand PortfolioIQ does not provide investment advice. I will not submit brokerage credentials or sensitive personal identifiers.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading || !disclaimerAck}
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Send Message
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">My Tickets</h2>

        {ticketsLoading ? (
          <div className="card text-center py-8">
            <Loader2 className="h-6 w-6 text-brand-accent mx-auto animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">No tickets yet. Submit a message above and it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const isExpanded = expandedTicket === t.id;
              const hasResponse = !!t.adminResponse;
              return (
                <div key={t.id} className="card !p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedTicket(isExpanded ? null : t.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(t.status)}
                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{CATEGORY_LABELS[t.category] || t.category}</span>
                        {hasResponse && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                            Replied
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{t.subject}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 px-5 py-4 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Your message</p>
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{t.message}</p>
                        </div>
                      </div>

                      {hasResponse ? (
                        <div>
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Support Response
                            {t.respondedAt && (
                              <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                                — {new Date(t.respondedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                            )}
                          </p>
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{t.adminResponse}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Awaiting response from our team
                          </p>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Ref: TCK-{t.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
        For billing or subscription changes, you can also visit your{" "}
        <Link href="/settings" className="text-brand-accent hover:underline">Settings</Link> page.
      </p>

      {successTicketId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Message Received</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Thanks — we received your message. Our support team will respond as soon as possible.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Reference: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{referenceId}</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              PortfolioIQ does not provide investment advice or trade recommendations.
            </p>
            <button
              onClick={handleCloseSuccess}
              className="btn-primary w-full py-3"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
