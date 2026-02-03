export default function ReportPage() {
  return (
    <div className="container-page space-y-4">
      <h1 className="text-3xl font-semibold text-slate-900">Reports</h1>
      <p className="text-sm text-slate-600">
        Generate PDF reports with disclaimers on every page and share read-only links.
      </p>
      <div className="card text-sm text-slate-500">
        PDF generation is configured to run server-side with React-PDF.
      </div>
    </div>
  );
}
