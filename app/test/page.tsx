export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p className="mt-4">If you can see this, basic page rendering works.</p>
      <p className="mt-2 text-sm text-slate-500">
        Timestamp: {new Date().toISOString()}
      </p>
    </div>
  );
}
