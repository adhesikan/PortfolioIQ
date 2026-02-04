# PortfolioIQ

## Overview
PortfolioIQ is an educational portfolio analytics application built with Next.js 14, TypeScript, Prisma, and Tailwind CSS. It helps users understand diversification, risk, and rebalancing options for their investment portfolios.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Payment**: Stripe integration
- **UI Components**: Radix UI, Lucide icons, Recharts

## Project Structure
```
app/           - Next.js App Router pages and API routes
components/    - React components
lib/           - Utility functions and shared logic
prisma/        - Prisma schema and migrations
tests/         - Vitest test files
```

## Running the Project
- **Development**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Production**: `npm run start`
- **Tests**: `npm test`

## Environment Variables
Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `NEXTAUTH_SECRET` - Secret for NextAuth.js sessions
- `NEXTAUTH_URL` - Base URL for NextAuth.js
- `STRIPE_SECRET_KEY` - Stripe API key (optional)
- `PRICE_PROVIDER_MODE` - Set to "mock" for development
- `BLOB_STORE_MODE` - Set to "mock" for development

## Database
Uses Replit's built-in PostgreSQL database. Schema managed via Prisma.

To update database schema:
```bash
npx prisma db push
```

## Deployment
Configured for Replit autoscale deployment:
- Build: `npm run build`
- Start: `npm run start`
