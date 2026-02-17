# PortfolioIQ — Trading Performance Intelligence

## Overview

PortfolioIQ is a full-stack SaaS application positioned as "Trading Performance Intelligence." The hero feature is the **Trader Leak Report**, which analyzes trade history to identify behavioral patterns and suggests structured review steps.

**Domain:** portfolioiq.pro  
**Status:** Active development  
**Last Updated:** 2026-02-17

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Custom email/password with httpOnly session cookies
- **AI:** OpenAI GPT-4o-mini (trade extraction + report generation)
- **Payments:** Stripe (subscription model)
- **Email:** SendGrid (transactional)
- **Charts:** Recharts (progress tracking)
- **Icons:** Lucide React

## Product Modules

1. **Leak Report** (Primary) — Upload trade history, AI extracts trades, generates behavioral analysis
2. **Portfolio Performance** (Secondary) — Legacy portfolio analytics (scoring, stress tests, rebalancing)
3. **Risk & Capital Insights** (Future)

## Project Structure

```
app/
  api/
    auth/           # Login, signup, logout, me endpoints
    dashboard/      # Dashboard summary API (latest report, trend, leaks)
    extract-trades/ # AI trade extraction from screenshots/CSV
    generate-report/# Leak Report generation
    reports/        # Report CRUD
    stripe/         # Checkout, webhook, portal
    admin/          # Users, abuse-logs, email broadcast, support tickets
    support/        # Support ticket submission (POST)
    portfolios/     # Legacy portfolio API
  admin/            # Admin panel (RBAC, support tickets tab)
  support/          # Contact support form page
  dashboard/        # User dashboard with usage tracking
  login/            # Login page
  signup/           # Signup page
  upload/           # Upload flow (screenshot/CSV/sample → confirm → generate)
  reports/          # Report list and detail view
  pricing/          # Pricing page (Free vs Pro)
  disclaimer/       # Legal disclaimer page
  privacy/          # Privacy policy page
  terms/            # Terms of service page
  page.tsx          # Homepage with hero, sample report, 3-step flow

components/
  Navigation.tsx    # Responsive nav with auth state
  Providers.tsx     # Auth context provider wrapper
  Tooltip.tsx       # Reusable tooltip component
  SampleDisclaimer.tsx # Compliance disclaimer for sample data

contexts/
  AuthContext.tsx    # Auth state management (login, signup, logout)

lib/
  auth.ts           # Session management, password hashing, IP hashing
  sampleTrades.ts   # 5 sample trader archetype datasets
  usage.ts          # Free report limit tracking
  abuse.ts          # Abuse prevention logging
  db.ts             # Prisma client singleton
  analytics/        # Portfolio metrics (legacy)
  scoring/          # Portfolio scoring (legacy)
  stress/           # Stress test scenarios (legacy)
  rebalance/        # Rebalancing recommendations (legacy)

prisma/
  schema.prisma     # Full schema with auth, reports, trades, subscriptions
  seed.ts           # Seeds admin user
```

## Key Features

### Authentication
- Email/password signup and login
- Secure httpOnly session cookies
- Role-based access: USER, ADMIN, SUPPORT
- Account disable/enable by admin

### Leak Report Flow
1. User uploads screenshot or CSV of trade history, OR selects a sample dataset
2. For uploads: GPT-4o-mini extracts structured trade data
3. For uploads: User reviews and confirms trades in editable table
   - Free users with >10 trades must select 10 to analyze (trade selector UI with checkboxes)
   - Pro users analyze all trades (up to 500)
4. For samples: Report is served from cache (generated once via AI, then reused). No editing allowed.
5. AI generates Leak Report with:
   - Leak Score (0-100) — **deterministic**, calculated from trade metrics via `lib/leakScoring.ts`
     - 7 scoring dimensions: Win Rate (20), Risk-to-Reward (20), Profit Factor (15), Hold Discipline (15), Loss Streak Control (10), Revenge Trading (10), Position Sizing (10)
     - Score breakdown shown as progress bars on report detail page
   - Top 3 Leaks with evidence, meaning, and quick fix
   - Leak-Driving Trades: specific trades that contributed to each leak (2-5 per leak)
   - Per-Leak Fix Plan: rule, how to apply, why it helps
   - Key stats (win rate, R:R, profit factor, etc.)
   - Behavior patterns
   - 7-Day Fix Plan
   - Risk Control Checklist

### Free Tier + Paywall
- 3 free Leak Reports per user (lifetime), max 10 trades per report
- Pro users: unlimited reports, up to 500 trades per report
- Usage tracked in UsageCounter table with transactional enforcement
- Usage only increments on successful report generation (not extraction)
- Free users with >10 trades see trade selector UI (checkboxes, default: most recent 10)
- After 3 reports → HTTP 402 paywall with modal + redirect to pricing page
- >10 trades on free plan → HTTP 409 with trade selection prompt
- Sample reports do NOT count toward free limit (separate 5/day rate limit)
- Stripe subscription for unlimited (Pro plan)
- Constants in `lib/usage.ts`: `FREE_REPORTS_LIFETIME_LIMIT = 3`, `FREE_MAX_TRADES_PER_REPORT = 10`, `PRO_MAX_TRADES_PER_REPORT = 500`

### Progress Tracker (/progress) — Pro Only
- Recharts-powered interactive area chart showing metrics over time
- Switchable metrics: Leak Score, Win Rate, Profit Factor, Avg R:R
- Summary stats: total reports, score change, best score, average
- Recurring leaks tracker (leaks appearing in 2+ reports)
- Side-by-side report comparison table with delta highlighting
- All Reports Timeline table

### Admin Panel (/admin)
- User management (view, disable, reset reports, change role)
- Payment/subscription status
- Email broadcast (all, free tier, paid tier)
- User Sessions (renamed from Abuse Logs) with risk scoring
- Site Analytics tab: total views, unique visitors, pages/visitor, daily views chart, top pages, recent visits

### Support Ticket System
- Contact form at /support with category, subject, message, disclaimer acknowledgment
- Categories: Technical, Billing, Feature Request, Report Clarification, Other
- Rate limited: 5 tickets/hour per user
- Admin Support tab in /admin with list view, filters (status/category/search), pagination
- Admin ticket detail view with user info sidebar, status management, response textarea
- Compliance reminders throughout (no investment advice)
- Support link in Navigation dropdown and Settings page

### Abuse Prevention
- Hashed IP logging (SHA-256 + salt)
- Device ID tracking via cookies
- User agent logging
- Risk score calculation

## Database Models

User, Session, Subscription, Upload, Trade, LeakReport, UsageCounter, AbuseLog, AdminAuditLog, MarketingContent, ConsentLog, Portfolio, Holding, ImportJob, PortfolioLot, Snapshot, RuleSet, Recommendation, StressTestResult, Report, SupportTicket, PageView

## Environment Variables Required

- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` — For AI trade extraction and report generation
- `STRIPE_SECRET_KEY` — Stripe API secret
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRO_PRICE_ID` — Stripe price ID for Pro plan
- `SENDGRID_API_KEY` — SendGrid for emails
- `SENDGRID_FROM_EMAIL` — Sender email address
- `APP_BASE_URL` — Public URL (e.g., https://portfolioiq.pro)
- `IP_HASH_SALT` — Salt for IP hashing

## Admin Credentials (Development)

- Email: admin@portfolioiq.pro
- Password: admin123456

## Scripts

- `npm run dev` — Development server (port 5000)
- `npm run build` — Production build
- `npm run start` — Production server (port 8080)
- `npm run db:push` — Push schema to database
- `npm run db:seed` — Seed admin user
- `npm run db:migrate` — Apply migrations

## Compliance

- All content is educational/informational only
- No financial advice or trading recommendations
- Disclaimers on homepage, reports, and footer
- No guarantees of trading results
