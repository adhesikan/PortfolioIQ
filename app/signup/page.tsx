"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";

export default function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  if (authLoading) return null;
  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!consent) {
      setError("You must agree to the Terms and Privacy Policy to continue.");
      setLoading(false);
      return;
    }
    const result = await signup(email, password, name || undefined, consent);
    setLoading(false);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create your account</h1>
          <p className="text-slate-600 dark:text-slate-400">Get 3 free Leak Reports to start</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="label mb-1.5">Name (optional)</label>
              <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="label mb-1.5">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="label mb-1.5">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters" />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-xs text-slate-500">
                I agree to the{" "}
                <Link href="/terms" className="underline hover:text-slate-700" target="_blank">Terms of Service</Link>
                {" and "}
                <Link href="/privacy" className="underline hover:text-slate-700" target="_blank">Privacy Policy</Link>.
                I understand PortfolioIQ is for informational purposes only and does not provide financial advice.
              </span>
            </label>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading || !consent}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
            Already have an account? <Link href="/login" className="text-brand-accent font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
