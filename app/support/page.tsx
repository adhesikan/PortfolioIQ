"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { MessageSquare, Send, CheckCircle, AlertCircle, Shield } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "feature", label: "Feature Request" },
  { value: "report_question", label: "Report Clarification" },
  { value: "other", label: "Other" },
];

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

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

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

      <div className="card">
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
