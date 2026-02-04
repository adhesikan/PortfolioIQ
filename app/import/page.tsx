import dynamic from "next/dynamic";

const ImportWizard = dynamic(() => import("@/components/ImportWizard"), {
  ssr: false,
  loading: () => (
    <div className="card animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
  )
});

export default function ImportPage() {
  return (
    <div className="container-page space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Import Portfolio</h1>
        <p className="text-sm text-slate-600">
          Manual entry, CSV uploads, and image-based imports are available. Always confirm before
          saving.
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
