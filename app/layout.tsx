import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import Link from "next/link";

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
        <Providers>
          <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
              <div className="container-page flex items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent text-lg font-bold text-white">
                    P
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">PortfolioIQ</p>
                    <p className="text-xs text-slate-500">Educational analytics</p>
                  </div>
                </Link>
                <Navigation />
              </div>
            </header>
            <main className="pb-20">{children}</main>
            <footer className="border-t border-slate-200 bg-white">
              <div className="container-page flex flex-col gap-2 py-6 text-xs text-slate-500">
                <span>PortfolioIQ is for education only and does not provide personalized investment advice.</span>
                <span>All analytics are hypothetical, simplified, and should be verified independently.</span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
