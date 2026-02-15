"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, CheckCircle, FileText, TrendingDown, AlertTriangle, Target, ArrowRight, Brain, Sparkles, Zap, ScanSearch, BarChart3, ShieldCheck } from "lucide-react";

const sampleLeaks = [
  {
    title: "Cutting Winners Too Early",
    score: 82,
    evidence: "67% of winning trades closed within 2 days. Average winner held 1.8 days vs 4.2 days for losers.",
    meaning: "You're letting fear drive exits on winning positions while holding losers hoping they recover.",
    fix: "Set a minimum hold time of 3 days for winners. Use trailing stops instead of fixed targets.",
  },
  {
    title: "Oversizing on Momentum Plays",
    score: 74,
    evidence: "Position sizes on breakout trades average 3.2x your normal size. These trades have a 38% win rate.",
    meaning: "Excitement about momentum setups leads to larger positions that amplify losses.",
    fix: "Cap all position sizes at 2% of account. No exceptions for any setup type.",
  },
  {
    title: "Revenge Trading After Losses",
    score: 68,
    evidence: "After a losing trade, 71% of next trades happen within 15 minutes. These have a 28% win rate.",
    meaning: "Emotional response to losses causes impulsive trades with poor risk/reward.",
    fix: "Implement a 1-hour cooldown rule after any loss. Log your emotional state before each trade.",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-sm font-medium text-blue-400 mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Trading Intelligence
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find what&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">leaking</span> in your trading.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              Upload your trade history. Our AI analyzes your patterns and gives you a clear breakdown of what&apos;s holding you back — in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={user ? "/upload" : "/signup"}
                className="btn-primary text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-600/25"
              >
                Get My Free Leak Report
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#sample-report"
                className="btn-secondary text-base px-8 py-4 rounded-xl border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                See Sample Report
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-4">3 free reports lifetime. No credit card required.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Three simple steps — powered by AI from start to finish</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { icon: Upload, step: "1", title: "Upload Screenshot", desc: "Take a screenshot of your trade history from any brokerage. Or upload a CSV for more accuracy." },
              { icon: Brain, step: "2", title: "AI Extracts Your Trades", desc: "Our AI reads your screenshot, extracts every trade automatically, and lets you review the data before analysis." },
              { icon: Sparkles, step: "3", title: "Get Your AI Leak Report", desc: "AI analyzes your behavioral patterns, identifies leaks costing you money, and builds a personalized 7-day fix plan." },
            ].map((item, i) => (
              <div key={i} className="relative text-center p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <item.icon className="h-7 w-7 text-brand-accent" />
                </div>
                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand-accent text-white text-xs font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 mb-4">
              <Brain className="h-3.5 w-3.5" />
              Powered by AI
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our AI Does For You</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Advanced machine learning analyzes your trading data to surface insights you&apos;d never find on your own</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                icon: ScanSearch,
                title: "Smart Trade Extraction",
                desc: "Upload a screenshot from any brokerage — our AI vision model reads and structures your trade data automatically. No manual entry needed.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: BarChart3,
                title: "Behavioral Pattern Analysis",
                desc: "AI detects hidden patterns in your trading: revenge trades, premature exits, position sizing mistakes, and timing leaks across your history.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Zap,
                title: "Personalized Fix Plans",
                desc: "Based on your specific leaks, AI generates a custom 7-day action plan with daily tasks designed to break your losing patterns.",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((item, i) => (
              <div key={i} className="card group hover:shadow-lg transition-shadow">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} mb-4`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Your data is analyzed securely and never shared with third parties
            </div>
          </div>
        </div>
      </section>

      <section id="sample-report" className="py-16 md:py-20 bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 mb-4">
              Example Report — For Demonstration Only
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Sample AI Leak Report</h2>
            <p className="text-lg text-slate-600">Here&apos;s what an AI-generated Leak Report looks like</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="relative h-40 w-40">
                    <svg className="h-40 w-40 transform -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#ef4444" strokeWidth="12"
                        strokeDasharray={`${(42 / 100) * 440} 440`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-red-600">42</span>
                      <span className="text-xs text-slate-500">Leak Score</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Leak Score: 42 / 100</h3>
                  <p className="text-slate-600 mb-4">Your trading has significant behavioral leaks that are costing you money. The good news: these are fixable with discipline and awareness.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Win Rate", value: "41%" },
                      { label: "Avg R:R", value: "0.8:1" },
                      { label: "Trades Analyzed", value: "47" },
                      { label: "Leaks Found", value: "3" },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-3 rounded-lg bg-slate-50">
                        <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {sampleLeaks.map((leak, i) => (
                <div key={i} className="card border-l-4 border-l-red-400">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">
                        {i + 1}
                      </div>
                      <h4 className="font-semibold text-slate-900">{leak.title}</h4>
                    </div>
                    <span className="text-sm font-medium text-red-600">Severity: {leak.score}/100</span>
                  </div>
                  <div className="space-y-3 ml-11">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Evidence</p>
                      <p className="text-sm text-slate-700">{leak.evidence}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">What It Means</p>
                      <p className="text-sm text-slate-700">{leak.meaning}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Quick Fix</p>
                      <p className="text-sm text-slate-700 font-medium">{leak.fix}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href={user ? "/upload" : "/signup"}
                className="btn-primary text-base px-8 py-4 rounded-xl"
              >
                Get Your Own Leak Report
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-slate-900">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-sm font-medium text-blue-400 mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Analysis
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop guessing. Let AI find the fix.
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Most traders lose money because of repeatable behavioral mistakes. Our AI finds yours in minutes — not months.
          </p>
          <Link
            href={user ? "/upload" : "/signup"}
            className="btn-primary text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-600/25"
          >
            Get My Free Leak Report
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="card bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Educational Disclaimer</h3>
            <p className="text-sm text-amber-800">
              PortfolioIQ provides informational and educational content only. It does not provide personalized
              financial advice, investment recommendations, or trading signals. All analysis is based on
              user-submitted data and AI-generated insights. Past performance is not indicative of future results.
              No guarantees of trading profits or loss prevention are made or implied. Consult a qualified
              financial professional before making any investment decisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
