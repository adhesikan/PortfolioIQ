import Link from "next/link";

const pricing = [
  {
    name: "Free",
    price: "$0",
    perks: [
      "1 portfolio",
      "3 image imports/month",
      "Basic stress tests",
      "No PDF exports"
    ]
  },
  {
    name: "Pro",
    price: "$29/mo",
    perks: [
      "Unlimited portfolios",
      "30 image imports/month",
      "Advanced stress tests",
      "PDF exports"
    ]
  },
  {
    name: "Team",
    price: "$99/mo",
    perks: [
      "Multi-client workspace",
      "200 image imports/month",
      "Admin controls",
      "Priority support"
    ]
  }
];

export default function HomePage() {
  return (
    <div className="container-page space-y-16">
      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="tag">Educational analytics only</span>
          <h1 className="text-4xl font-semibold text-brand-primary md:text-5xl">
            PortfolioIQ helps you understand diversification, risk, and rebalancing options.
          </h1>
          <p className="text-lg text-slate-600">
            Upload holdings manually, via CSV, or by screenshot. Get transparent scoring, stress
            tests, and a hypothetical trade plan you can review with a professional.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/import" className="rounded-full bg-brand-accent px-5 py-3 text-sm font-semibold text-white">
              Start importing
            </Link>
            <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
              View demo dashboard
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            PortfolioIQ is strictly educational. No personalized investment advice.
          </p>
        </div>
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">What you get</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>• Portfolio Score (0-100) with rubric and improvement tips</li>
            <li>• Concentration + diversification metrics</li>
            <li>• Scenario-based stress tests and hypothetical outcomes</li>
            <li>• Rebalancing trade plan with guardrails and warnings</li>
          </ul>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            Screenshot placeholders for marketing mode (add product visuals here).
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Pricing</h2>
          <p className="text-xs text-slate-500">
            All plans include compliance guardrails and educational-only outputs.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pricing.map((plan) => (
            <div key={plan.name} className="card space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{plan.name}</p>
                <p className="text-3xl font-semibold text-slate-900">{plan.price}</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {plan.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              <button className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Compliance & FAQs</h2>
        <p className="text-sm text-slate-600">
          PortfolioIQ provides hypothetical analytics only. It does not assess your financial
          situation, goals, or risk tolerance. Any examples or trade plans are purely educational.
        </p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• We never connect to brokerage accounts or place trades.</li>
          <li>• Image uploads are processed with short-lived storage and optional save control.</li>
          <li>• Stress tests and scores are simplified and are not predictive of future results.</li>
        </ul>
      </section>
    </div>
  );
}
