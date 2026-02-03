# PortfolioIQ

PortfolioIQ is a production-ready SaaS starter for educational portfolio analytics. It provides diversification metrics, stress tests, and hypothetical rebalancing plans with clear compliance guardrails. It does **not** provide personalized investment advice.

## Features
- Manual, CSV, and screenshot/image portfolio import flows.
- AI Vision extraction with OCR fallback and confidence gating.
- Portfolio scoring (0-100) with transparent rubric.
- Scenario-based stress testing and rebalancing suggestions.
- Stripe-ready billing tiers and report exports.

## Tech Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL
- NextAuth (email/credentials)
- OpenAI Responses API (vision)
- React-PDF for server-side report generation

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Seed demo data:
   ```bash
   npx prisma db seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Environment Variables
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_TEAM=
PRICE_PROVIDER_MODE=mock
ALPHAVANTAGE_API_KEY=
OPENAI_API_KEY=
BLOB_STORE_MODE=vercelblob
BLOB_STORE_URL=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
IMPORT_IMAGE_TTL_MINUTES=60
```

## How to Demo
1. Run the seed script to create the demo portfolio.
2. Visit `/dashboard` to see the Portfolio Score, stress tests, and sample rebalancing plan.
3. Visit `/import` to test the image import wizard UI and review flow.

## Compliance
- Educational only. Not investment advice.
- Stress tests and scores are hypothetical, simplified, and not predictive.
- Always confirm and verify holdings extracted from images or uploads.

## Notes
- Image uploads should be stored with short-lived URLs and have EXIF data stripped before use.
- The image import service is designed to fall back to OCR if vision confidence is low.
