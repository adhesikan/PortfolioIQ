export default function BillingPage() {
  return (
    <div className="container-page space-y-4">
      <h1 className="text-3xl font-semibold text-slate-900">Billing</h1>
      <p className="text-sm text-slate-600">
        Manage subscriptions, plan limits, and Stripe billing details.
      </p>
      <div className="card text-sm text-slate-500">
        Stripe integration placeholders. Configure STRIPE_SECRET_KEY to enable.
      </div>
    </div>
  );
}
