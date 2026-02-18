"use client";

import { useState, useEffect } from "react";
import { Upload, BarChart3, Lightbulb, ArrowRight, X, Sparkles, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

const ONBOARDING_KEY = "piq_onboarding_completed";

const steps = [
  {
    icon: Sparkles,
    iconBg: "bg-brand-accent/10",
    iconColor: "text-brand-accent",
    title: "Welcome to PortfolioIQ",
    subtitle: "Your Trading Performance Intelligence",
    description: "We help you find hidden leaks in your trading — the patterns and habits that silently drain your performance. No guesswork, just data-driven insights.",
  },
  {
    icon: Upload,
    iconBg: "bg-blue-50 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Upload Your Trades",
    subtitle: "Step 1 of 3",
    description: "Take a screenshot of your trade history or upload a CSV file. Our AI extracts the trade data automatically — no manual entry needed.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-violet-50 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
    title: "Get Your Leak Report",
    subtitle: "Step 2 of 3",
    description: "Our AI analyzes your trades and generates a Leak Report — complete with a Leak Score, your top behavioral leaks, and the specific trades driving them.",
  },
  {
    icon: Target,
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Fix & Track Progress",
    subtitle: "Step 3 of 3",
    description: "Each report includes a personalized fix plan with clear rules and checklists. Generate new reports over time to track your improvement.",
  },
];

interface OnboardingModalProps {
  isNewUser: boolean;
}

export default function OnboardingModal({ isNewUser }: OnboardingModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isNewUser) return;
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isNewUser]);

  const complete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      complete();
    }
  };

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={complete} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <button
          onClick={complete}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-8 pb-2">
          <div className="flex justify-center mb-6">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${current.iconBg}`}>
              <Icon className={`h-8 w-8 ${current.iconColor}`} />
            </div>
          </div>

          <div className="text-center">
            {step > 0 && (
              <p className="text-xs font-semibold text-brand-accent uppercase tracking-wider mb-1">{current.subtitle}</p>
            )}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{current.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{current.description}</p>
          </div>

          {step === 0 && (
            <div className="mt-5 p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2.5">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                  <span className="font-semibold">Your first report is fully unlocked</span> — all uploaded trades will be analyzed, no limits. Try a sample dataset if you want to see how it works first.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-brand-accent" : "w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Back
                </button>
              )}
              {isLast ? (
                <Link
                  href="/upload"
                  onClick={complete}
                  className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-accent/25"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-accent/25"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {step === 0 && (
            <button
              onClick={complete}
              className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Skip intro — I know what I'm doing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
