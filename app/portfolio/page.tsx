export default function PortfolioPage() {
  return (
    <div className="container-page space-y-4">
      <h1 className="text-3xl font-semibold text-slate-900">Portfolios</h1>
      <p className="text-sm text-slate-600">
        Create multiple portfolios (Taxable, IRA, Growth) and assign objectives.
      </p>
      <div className="card text-sm text-slate-500">
        No portfolios yet. Import holdings to create your first portfolio.
      </div>
    </div>
  );
}
