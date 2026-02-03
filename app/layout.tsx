import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PortfolioIQ",
  description: "Educational portfolio analytics and rebalancing insights.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-white">
            <div className="container-page flex items-center justify-between py-6">
              <div>
                <p className="text-sm font-semibold text-brand-accent">PortfolioIQ</p>
                <p className="text-xs text-slate-500">
                  Educational portfolio analytics only. Not investment advice.
                </p>
              </div>
              <nav className="flex items-center gap-4 text-sm text-slate-600">
                <a href="/dashboard" className="hover:text-slate-900">Dashboard</a>
                <a href="/import" className="hover:text-slate-900">Import</a>
                <a href="/report" className="hover:text-slate-900">Reports</a>
                <a href="/billing" className="hover:text-slate-900">Billing</a>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="container-page flex flex-col gap-2 text-xs text-slate-500">
              <span>PortfolioIQ is for education only and does not provide personalized investment advice.</span>
              <span>All analytics are hypothetical, simplified, and should be verified independently.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
