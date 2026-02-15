"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, CheckCircle, FileText, TrendingDown, AlertTriangle, Target, ArrowRight, Brain, Sparkles, Zap, ScanSearch, BarChart3, ShieldCheck, XCircle } from "lucide-react";
import Tooltip from "@/components/Tooltip";
import SampleDisclaimer from "@/components/SampleDisclaimer";

const sampleLeaks = [
  {
    title: "Cutting Winners Too Early",
    score: 82,
    evidence: "67% of winning trades closed within 2 days. Average winner held 1.8 days vs 4.2 days for losers.",
    meaning: "You're letting fear drive exits on winning positions while holding losers hoping they recover.",
    fix: "Consider testing a minimum hold time of 3 days for winners. Some traders use trailing stops instead of fixed targets.",
    drivingTrades: [
      { symbol: "AAPL", open: "Jan 8", close: "Jan 9", pnl: 120, hold: "1d", notes: "Closed at +2.1% despite strong uptrend continuing to +6.8%." },
      { symbol: "TSLA", open: "Jan 15", close: "Jan 16", pnl: 85, hold: "1d", notes: "Exited after first green candle. Stock ran another +4.2% over 3 days." },
      { symbol: "NVDA", open: "Jan 22", close: "Jan 23", pnl: 210, hold: "1d", notes: "Took profit at +1.8%. Position would have gained +5.1% by week end." },
    ],
    fixPlan: [
      { rule: "3-Day Minimum Hold Rule (to test)", howToApply: "Consider not closing winning trades before 3 full trading days unless your stop-loss is hit. Test in a demo account first.", whyItHelps: "May help capture larger moves by reducing premature exits driven by short-term volatility." },
      { rule: "Trailing Stop Strategy (to test)", howToApply: "Consider replacing fixed targets with a trailing stop approach. Backtest different trailing distances before applying to live trades.", whyItHelps: "Can help lock in gains while allowing room for continuation, though results vary by market conditions." },
    ],
  },
  {
    title: "Oversizing on Momentum Plays",
    score: 74,
    evidence: "Position sizes on breakout trades average 3.2x your normal size. These trades have a 38% win rate.",
    meaning: "Excitement about momentum setups leads to larger positions that amplify losses.",
    fix: "One common risk practice is limiting position sizing (e.g., a % cap). Test what fits your risk plan.",
    drivingTrades: [
      { symbol: "AMD", open: "Jan 10", close: "Jan 12", pnl: -480, hold: "2d", notes: "3.5x normal size on breakout. Failed breakout led to oversized loss." },
      { symbol: "MARA", open: "Jan 18", close: "Jan 19", pnl: -320, hold: "1d", notes: "4x position size on momentum setup. Gap down the next morning." },
    ],
    fixPlan: [
      { rule: "Position Size Review (to test)", howToApply: "Before entering any trade, consider reviewing whether your position size aligns with your overall risk tolerance. Define a max loss threshold that fits your plan.", whyItHelps: "May help prevent any single trade from causing outsized impact on your account balance." },
    ],
  },
  {
    title: "Revenge Trading After Losses",
    score: 68,
    evidence: "After a losing trade, 71% of next trades happen within 15 minutes. These have a 28% win rate.",
    meaning: "Emotional response to losses causes impulsive trades with poor risk/reward.",
    fix: "Some traders use cooldown rules after losses; consider testing a cooldown window. Logging your emotional state before each trade may also help.",
    drivingTrades: [
      { symbol: "SPY", open: "Jan 11", close: "Jan 11", pnl: -195, hold: "<1d", notes: "Entered 8 minutes after previous -$310 loss. No setup, pure impulse." },
      { symbol: "QQQ", open: "Jan 20", close: "Jan 20", pnl: -240, hold: "<1d", notes: "Revenge entry 12 minutes after loss. Doubled down when it went against." },
    ],
    fixPlan: [
      { rule: "Cooldown Period (to test)", howToApply: "After any losing trade, consider setting a timer for 60 minutes. Some traders find this helps them reset before the next trade.", whyItHelps: "May help break the emotional cycle and give time for objective reassessment." },
      { rule: "Pre-Trade Emotion Check (to test)", howToApply: "Before every trade, consider rating your emotional state 1-5. If elevated, review whether the setup still meets your criteria.", whyItHelps: "Can build self-awareness about emotional trading and support more deliberate decision-making." },
    ],
  },
];

const sampleBehaviorPatterns = [
  "Tendency to increase position sizes after a string of small wins, leading to outsized losses when the streak ends.",
  "Consistently shorter hold times on winning trades (avg 1.8 days) vs losing trades (avg 4.2 days).",
  "Higher trading frequency on Mondays and Fridays, with significantly lower win rates on those days.",
  "Pattern of entering trades in the first 15 minutes of market open with 31% win rate vs 52% during mid-day.",
];

const sampleFixPlan = [
  { day: 1, task: "Write down your top 3 trading rules. Print them and place next to your screen. Review before every session." },
  { day: 2, task: "Set up a position size calculator. Before every trade, calculate max size so risk is 2% of account." },
  { day: 3, task: "Implement the 60-minute cooldown rule after losses. Set a phone timer after every losing trade." },
  { day: 4, task: "Review your last 10 winning trades. Note how many you closed too early. Calculate the missed profit." },
  { day: 5, task: "Practice the trailing stop technique on paper. Set 1.5 ATR trailing stops on 3 hypothetical trades." },
  { day: 6, task: "Start a pre-trade checklist: setup quality, emotional state, position size, stop-loss, target." },
  { day: 7, task: "Journal review: read all entries from the week. Identify which rules you followed and which you broke." },
];

const sampleRiskChecklist = [
  { item: "Stop-loss set on every trade", status: "fail" },
  { item: "Position size within 2% risk limit", status: "fail" },
  { item: "No more than 3 correlated positions open", status: "pass" },
  { item: "Daily loss limit defined and enforced", status: "warning" },
  { item: "Trading journal maintained consistently", status: "warning" },
  { item: "Pre-trade checklist completed before entry", status: "fail" },
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
              Turn your trade history into a clear <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">performance review</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              <span className="block">PortfolioIQ highlights recurring patterns and process gaps you may be missing —</span>
              <span className="block mt-1">and suggests practical review steps to test in your own plan.</span>
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
            <p className="text-xs text-slate-500 mt-4">3 Free Reports &bull; No Credit Card Required</p>
            <p className="text-xs text-slate-500 mt-2">For informational purposes only — not investment advice. Verify all data before acting.</p>
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
              { icon: Sparkles, step: "3", title: "Get Your AI Leak Report", desc: "AI analyzes your behavioral patterns, highlights recurring process gaps, and suggests a structured 7-day review plan to test." },
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
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Advanced machine learning analyzes your trading data to surface patterns and process gaps worth reviewing</p>
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
                title: "Structured Review Plans",
                desc: "Based on detected patterns, AI suggests a 7-day review plan with daily practice tasks to help you evaluate and refine your process.",
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
          <div className="max-w-4xl mx-auto mb-8">
            <SampleDisclaimer compact />
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
                      <Tooltip content="Your Leak Score rates your trading from 0-100. Higher is better. Below 40 means significant behavioral leaks to address.">
                        <span className="text-xs text-slate-500">Leak Score</span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Leak Score: 42 / 100</h3>
                    <p className="text-slate-600 mb-4">This example shows several behavioral patterns that may be worth reviewing. Many of these patterns can be addressed with structured practice and self-awareness.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Win Rate", value: "41%", tip: "Percentage of trades that were profitable." },
                      { label: "Avg R:R", value: "0.8:1", tip: "Average Risk-to-Reward ratio. Compares average win size to average loss." },
                      { label: "Trades Analyzed", value: "47", tip: "Total number of trades the AI analyzed." },
                      { label: "Leaks Found", value: "3", tip: "Number of significant behavioral leaks identified." },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-3 rounded-lg bg-slate-50">
                        <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                        <Tooltip content={stat.tip}>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <Tooltip content="These are the biggest behavioral patterns detected in the data. Each leak includes evidence, what it may mean, and practical next steps to consider.">
                <span>Top Leaks Found</span>
              </Tooltip>
            </h3>
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
                    <Tooltip content="How significant this pattern appears in the data. Higher severity suggests a larger potential impact on performance.">
                      <span className="text-sm font-medium text-red-600">Severity: {leak.score}/100</span>
                    </Tooltip>
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
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Practical Next Steps (to consider)</p>
                      <p className="text-sm text-slate-700 font-medium">{leak.fix}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Tooltip content="These specific trades from your history contributed most to this leak pattern.">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Trades Driving This Leak</p>
                      </Tooltip>
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-3 py-2 text-left font-medium text-slate-500">Symbol</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-500">Open</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-500">Close</th>
                              <th className="px-3 py-2 text-right font-medium text-slate-500">P&L</th>
                              <th className="px-3 py-2 text-right font-medium text-slate-500">Hold</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-500">Why It Matters</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leak.drivingTrades.map((dt, j) => (
                              <tr key={j} className="border-b border-slate-100 last:border-0">
                                <td className="px-3 py-2 font-medium text-slate-900">{dt.symbol}</td>
                                <td className="px-3 py-2 text-slate-600">{dt.open}</td>
                                <td className="px-3 py-2 text-slate-600">{dt.close}</td>
                                <td className={`px-3 py-2 text-right font-medium ${dt.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  ${dt.pnl >= 0 ? "+" : ""}{dt.pnl.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right text-slate-600">{dt.hold}</td>
                                <td className="px-3 py-2 text-slate-600 max-w-xs">{dt.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Tooltip content="Specific practices to consider testing in your trading process.">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Review Plan for This Leak</p>
                      </Tooltip>
                      <div className="space-y-3">
                        {leak.fixPlan.map((fp, j) => (
                          <div key={j} className="p-3 rounded-lg bg-green-50 border border-green-100">
                            <p className="text-sm font-semibold text-green-900">{fp.rule}</p>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] font-medium text-green-700 uppercase tracking-wide">How to Apply</p>
                                <p className="text-xs text-green-800 mt-0.5">{fp.howToApply}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-green-700 uppercase tracking-wide">Why It Helps</p>
                                <p className="text-xs text-green-800 mt-0.5">{fp.whyItHelps}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card mt-6 mb-6">
              <Tooltip content="Recurring tendencies our AI detected in your trading behavior. These patterns shape your overall performance.">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Behavior Patterns</h3>
              </Tooltip>
              <ul className="space-y-2">
                {sampleBehaviorPatterns.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card mb-6">
              <Tooltip content="A structured daily review plan with practice tasks to help you evaluate and refine your process over one week.">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">7-Day Review &amp; Practice Plan</h3>
              </Tooltip>
              <div className="space-y-3">
                {sampleFixPlan.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-white text-xs font-bold shrink-0">
                      D{item.day}
                    </div>
                    <p className="text-sm text-slate-700 pt-0.5">{item.task}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card mb-6">
              <Tooltip content="A checklist of risk management practices. Green means you're doing well, red means there's an issue, and yellow means caution.">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Control Checklist</h3>
              </Tooltip>
              <div className="space-y-2">
                {sampleRiskChecklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    {item.status === "pass" && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
                    {item.status === "fail" && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                    {item.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />}
                    <span className="text-sm text-slate-700">{item.item}</span>
                  </div>
                ))}
              </div>
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
            Get clarity on your trading process.
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Many traders repeat the same process gaps without realizing it. Our AI highlights patterns worth reviewing — in minutes, not months.
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
              PortfolioIQ is a software analysis tool that provides informational and educational content only. It does not
              provide financial advice, investment recommendations, or trading signals. All analysis is based on
              user-submitted data and AI-generated pattern detection. Past performance is not indicative of future results.
              No outcomes, profits, or loss prevention are guaranteed or implied. Consult a qualified
              financial professional before making any investment decisions.
            </p>
            <p className="text-sm text-amber-600 mt-3">
              Read our full{" "}
              <Link href="/disclaimer" className="underline hover:text-amber-800">Disclaimer</Link>
              {", "}
              <Link href="/privacy" className="underline hover:text-amber-800">Privacy Policy</Link>
              {", and "}
              <Link href="/terms" className="underline hover:text-amber-800">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
