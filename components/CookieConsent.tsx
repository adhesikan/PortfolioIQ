"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split("; ").find((c) => c.startsWith("piq_cookie_consent="));
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = async (accepted: boolean) => {
    setVisible(false);
    try {
      await fetch("/api/consent/cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted }),
      });
    } catch {}
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom">
      <div className="mx-auto max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl p-5">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 mb-1">We use cookies</p>
            <p className="text-xs text-slate-500 mb-3">
              We use essential cookies to keep the site running and optional analytics cookies to improve your experience.
              See our <Link href="/privacy" className="underline hover:text-slate-700">Privacy Policy</Link> for details.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleConsent(true)}
                className="px-4 py-1.5 text-xs font-medium bg-brand-accent text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => handleConsent(false)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
          <button onClick={() => handleConsent(false)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
