import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Portfolio Scoring",
    description: "Get a transparent 0-100 score with specific improvement tips based on diversification and concentration."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Stress Testing",
    description: "See how your portfolio might perform under various market scenarios like rate shocks or recessions."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Rebalancing Ideas",
    description: "Get educational suggestions for portfolio adjustments based on your chosen investment strategy."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: "Easy Import",
    description: "Add holdings manually or import via CSV. Simple, fast, and secure with no brokerage connection required."
  }
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 items-center py-12">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                Educational analytics only
              </span>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight md:text-5xl lg:text-6xl">
                Understand your portfolio like never before
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Get transparent scoring, stress tests, and rebalancing suggestions. 
                PortfolioIQ helps you learn about diversification and risk without the complexity.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/import" className="btn-primary text-base px-6 py-3">
                  Get Started Free
                </Link>
                <Link href="/dashboard" className="btn-secondary text-base px-6 py-3">
                  View Demo
                </Link>
              </div>
              <p className="text-xs text-slate-500 pt-2">
                No credit card required. Educational purposes only.
              </p>
            </div>
            <div className="card bg-gradient-to-br from-slate-50 to-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Portfolio Score</span>
                  <span className="text-3xl font-bold text-green-600">78</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-slate-100">
                    <p className="text-xl font-bold text-slate-900">5</p>
                    <p className="text-xs text-slate-500">Holdings</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-100">
                    <p className="text-xl font-bold text-slate-900">32%</p>
                    <p className="text-xs text-slate-500">Top Weight</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-100">
                    <p className="text-xl font-bold text-slate-900">3</p>
                    <p className="text-xs text-slate-500">Asset Classes</p>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Good diversification across asset classes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    Consider reducing single stock concentration
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to understand your investments
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple, transparent tools for portfolio analysis without the jargon or complexity.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div key={i} className="card-hover text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-brand-accent">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to analyze your portfolio?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Start with manual entry or CSV import. Get insights in minutes, not hours.
          </p>
          <Link href="/import" className="btn-primary text-base px-8 py-3 bg-white text-slate-900 hover:bg-slate-100">
            Get Started Now
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <div className="card bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Educational Disclaimer</h3>
            <p className="text-sm text-amber-800">
              PortfolioIQ provides hypothetical analytics only. It does not assess your financial
              situation, goals, or risk tolerance. Any examples or suggestions are purely educational.
              We never connect to brokerage accounts or place trades. Please consult a qualified
              financial advisor for personalized investment advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
