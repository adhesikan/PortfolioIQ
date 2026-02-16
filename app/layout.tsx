import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import CookieConsent from "@/components/CookieConsent";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PortfolioIQ — Trading Performance Intelligence",
  description: "Turn your trade history into a clear performance review. PortfolioIQ highlights recurring patterns and process gaps — for informational purposes only.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/favicon.png",
  }
};

const themeScript = `(function(){try{var t=localStorage.getItem('piq_theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
            <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 flex items-center justify-between py-3">
                <Link href="/" className="flex items-center">
                  <img src="/logo-clean.png" alt="PortfolioIQ — Trading Performance Intelligence" className="h-28 w-auto dark:brightness-200 dark:contrast-75" />
                </Link>
                <Navigation />
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 text-slate-400">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="mb-2">
                      <img src="/logo-clean.png" alt="PortfolioIQ" className="h-8 w-auto brightness-200 contrast-75" />
                    </div>
                    <p className="text-xs">Trading Performance Intelligence. Review and refine your trading process.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-2">Product</p>
                    <div className="space-y-1 text-xs">
                      <p><Link href="/upload" className="hover:text-white transition-colors">Leak Report</Link></p>
                      <p><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-2">Legal</p>
                    <div className="space-y-1 text-xs mb-3">
                      <p><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></p>
                      <p><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></p>
                      <p><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></p>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">For informational and educational purposes only. Not financial advice. No outcomes are guaranteed or implied.</p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-center">
                  <p>&copy; {new Date().getFullYear()} PortfolioIQ. All rights reserved.</p>
                  <p className="mt-1 text-slate-500">
                    <Link href="/disclaimer" className="hover:text-slate-300 transition-colors">Disclaimer</Link>
                    {" · "}
                    <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
                    {" · "}
                    <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
                  </p>
                </div>
              </div>
            </footer>
          </div>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
