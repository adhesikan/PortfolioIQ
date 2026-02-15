import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PortfolioIQ",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: February 15, 2026</p>

      <div className="prose prose-slate prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Introduction</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            PortfolioIQ (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Information We Collect</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Account Information</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                When you create an account, we collect your email address and a hashed version of your password. We never store your password in plain text.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Trade Data</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                When you upload trade history (screenshots or CSV files), we process this data to generate your Leak Report. Uploaded files are processed by our AI and the extracted trade data is stored in our database associated with your account.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Usage Information</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                We collect information about how you use our Service, including report generation counts, session data, and feature usage patterns to improve our product.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Security and Abuse Prevention</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                For abuse prevention purposes, we collect hashed (anonymized) IP addresses, device identifiers, and user agent information. IP addresses are hashed using SHA-256 with a salt and cannot be reversed to identify your actual IP address.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Payment Information</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Payment processing is handled by Stripe. We do not store your credit card numbers, bank account details, or other payment credentials on our servers. Stripe&apos;s privacy policy governs the handling of your payment information.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">How We Use Your Information</h2>
          <ul className="text-sm text-slate-700 leading-relaxed list-disc pl-5 space-y-1">
            <li>To provide and maintain our Service, including generating Leak Reports</li>
            <li>To process your transactions and manage your subscription</li>
            <li>To send transactional emails (account confirmation, password resets, report notifications)</li>
            <li>To detect, prevent, and address abuse, fraud, and technical issues</li>
            <li>To improve and optimize our Service</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Data Sharing</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            We do not sell, rent, or trade your personal information to third parties. We may share data with:
          </p>
          <ul className="text-sm text-slate-700 leading-relaxed list-disc pl-5 space-y-1 mt-2">
            <li><strong>OpenAI:</strong> Trade data is sent to OpenAI&apos;s API for AI-powered analysis. OpenAI processes this data according to their API data usage policy.</li>
            <li><strong>Stripe:</strong> Payment-related information is shared with Stripe for subscription processing.</li>
            <li><strong>SendGrid:</strong> Your email address is shared with SendGrid for transactional email delivery.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required by law, subpoena, or legal process.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Data Security</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information, including encrypted sessions (httpOnly cookies), hashed passwords (bcrypt), and hashed IP addresses (SHA-256). However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Data Retention</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            We retain your account information and generated reports for as long as your account is active. You may request deletion of your account and associated data by contacting us. Abuse prevention logs are retained for security purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Cookies</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            We use essential cookies for authentication (session cookies) and abuse prevention (device identifier cookies). We do not use third-party advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Your Rights</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data. To exercise these rights, contact us at the email below. We will respond to your request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Children&apos;s Privacy</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Changes to This Policy</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated effective date. Your continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-200 text-sm text-slate-500">
          <p>If you have questions about this policy, contact us at <span className="text-brand-accent">support@portfolioiq.pro</span>.</p>
          <p className="mt-2">See also: <Link href="/disclaimer" className="text-brand-accent hover:underline">Disclaimer</Link> · <Link href="/terms" className="text-brand-accent hover:underline">Terms of Service</Link></p>
        </div>
      </div>
    </div>
  );
}
