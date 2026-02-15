"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Check, ArrowRight, AlertCircle, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Tooltip from "@/components/Tooltip";

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecks, setConsentChecks] = useState({
    disclaimer: false,
    privacy: false,
    recurring: false,
  });
  const [consentError, setConsentError] = useState("");

  const allChecked = consentChecks.disclaimer && consentChecks.privacy && consentChecks.recurring;

  const handleUpgradeClick = () => {
    if (!user) { window.location.href = "/signup"; return; }
    setConsentChecks({ disclaimer: false, privacy: false, recurring: false });
    setConsentError("");
    setShowConsent(true);
  };

  const handleConfirmSubscribe = async () => {
    if (!allChecked) {
      setConsentError("Please accept all items before continuing.");
      return;
    }
    setLoading(true);
    setConsentError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disclaimerAccepted: consentChecks.disclaimer,
          privacyPolicyAccepted: consentChecks.privacy,
          recurringPaymentAccepted: consentChecks.recurring,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setConsentError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-slate-600">Start free. Upgrade when you need more.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Free</h3>
          <p className="text-sm text-slate-500 mb-4">Get started with trading analysis</p>
          <p className="text-4xl font-bold text-slate-900 mb-6">$0 <span className="text-base font-normal text-slate-500">/forever</span></p>
          <ul className="space-y-3 mb-8">
            {[
              { text: "3 Leak Reports (lifetime)", tip: "You can generate up to 3 Leak Reports for free, ever. This is a lifetime limit, not monthly." },
              { text: "Screenshot & CSV upload", tip: "Upload screenshots from any brokerage or export your trade history as a CSV file." },
              { text: "AI trade extraction", tip: "Our AI automatically reads your screenshots and structures your trade data — no manual entry." },
              { text: "Behavior pattern analysis", tip: "AI identifies recurring patterns like revenge trading, early exits, and position sizing mistakes." },
              { text: "7-day fix plans", tip: "Each report includes a personalized daily action plan to help fix your biggest trading leaks." },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <Tooltip content={f.tip}>
                  <span>{f.text}</span>
                </Tooltip>
              </li>
            ))}
          </ul>
          {user ? (
            <Link href="/upload" className="btn-secondary w-full py-3">Current Plan</Link>
          ) : (
            <Link href="/signup" className="btn-secondary w-full py-3">Get Started</Link>
          )}
        </div>

        <div className="card border-brand-accent border-2 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Pro</h3>
          <p className="text-sm text-slate-500 mb-4">Unlimited trading intelligence</p>
          <p className="text-4xl font-bold text-slate-900 mb-6">$29 <span className="text-base font-normal text-slate-500">/month</span></p>
          <ul className="space-y-3 mb-8">
            {[
              { text: "Unlimited Leak Reports", tip: "Generate as many Leak Reports as you want, every month. No caps or limits." },
              { text: "Everything in Free", tip: "All Free plan features included: screenshot upload, AI extraction, pattern analysis, and fix plans." },
              { text: "Priority AI analysis", tip: "Your reports are processed with priority, giving you faster results." },
              { text: "Advanced behavior insights", tip: "Deeper analysis of your trading psychology including emotional patterns, time-of-day trends, and more." },
              { text: "Historical report comparison", tip: "Track your progress over time by comparing Leak Scores and patterns across multiple reports." },
              { text: "Email report delivery", tip: "Get your Leak Reports delivered straight to your inbox for easy reference." },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <Tooltip content={f.tip}>
                  <span>{f.text}</span>
                </Tooltip>
              </li>
            ))}
          </ul>
          <button onClick={handleUpgradeClick} className="btn-primary w-full py-3">
            Upgrade to Pro
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-slate-500">
          Cancel anytime. No long-term contracts. For educational purposes only.
        </p>
      </div>

      {showConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 relative animate-fade-in">
            <button
              onClick={() => { setShowConsent(false); setLoading(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <ShieldCheck className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Confirm Your Subscription</h2>
                <p className="text-xs text-slate-500">Please review and accept before continuing</p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">PortfolioIQ Pro Plan</span>
                <span className="text-sm font-bold text-slate-900">$29/month</span>
              </div>
              <p className="text-xs text-slate-500">Billed monthly. Cancel anytime from your account settings.</p>
            </div>

            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consentChecks.disclaimer}
                  onChange={(e) => setConsentChecks((p) => ({ ...p, disclaimer: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                  I understand that PortfolioIQ provides <strong>educational and informational content only</strong>. 
                  It does not provide financial advice, investment recommendations, or trading signals. 
                  Past performance is not indicative of future results.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consentChecks.privacy}
                  onChange={(e) => setConsentChecks((p) => ({ ...p, privacy: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                  I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. 
                  I understand my trade data is processed securely and used solely for generating my reports.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consentChecks.recurring}
                  onChange={(e) => setConsentChecks((p) => ({ ...p, recurring: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                  I authorize a <strong>recurring monthly charge of $29.00</strong> to my payment method. 
                  I can cancel anytime and my subscription will remain active until the end of the billing period.
                </span>
              </label>
            </div>

            {consentError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {consentError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmSubscribe}
                disabled={!allChecked || loading}
                className={`btn-primary w-full py-3 ${!allChecked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Processing..." : "Continue to Payment"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
              <button
                onClick={() => { setShowConsent(false); setLoading(false); }}
                className="text-sm text-slate-500 hover:text-slate-700 text-center"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Secure payment processed by Stripe. Your consent is logged for compliance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
