"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) { window.location.href = "/signup"; return; }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
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
            {["3 Leak Reports (lifetime)", "Screenshot & CSV upload", "AI trade extraction", "Behavior pattern analysis", "7-day fix plans"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {f}
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
              "Unlimited Leak Reports",
              "Everything in Free",
              "Priority AI analysis",
              "Advanced behavior insights",
              "Historical report comparison",
              "Email report delivery",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button onClick={handleSubscribe} disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Loading..." : "Upgrade to Pro"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-slate-500">
          Cancel anytime. No long-term contracts. For educational purposes only.
        </p>
      </div>
    </div>
  );
}
