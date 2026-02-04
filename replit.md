# PortfolioIQ

Educational portfolio analytics application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Overview

PortfolioIQ helps users understand their investment portfolios through:
- Portfolio scoring (0-100) with transparent rubrics
- Concentration and diversification metrics
- Scenario-based stress testing
- Rebalancing suggestions based on investment strategies

**Important:** This is for educational purposes only. No personalized investment advice is provided.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **State Management:** React Context API

## Project Structure

```
app/
  api/portfolios/     # REST API for portfolio CRUD operations
  dashboard/          # Main analytics dashboard
  import/             # Portfolio import wizard
  portfolio/          # Portfolio management
  report/             # Report generation with print support
components/
  ImportWizard.tsx    # Multi-method import (manual, CSV)
  Navigation.tsx      # App navigation
  Providers.tsx       # Context providers wrapper
contexts/
  PortfolioContext.tsx  # Portfolio state management
lib/
  analytics/          # Portfolio metrics calculation
  scoring/            # Portfolio scoring logic
  stress/             # Stress test scenarios
  rebalance/          # Rebalancing recommendations
  db.ts               # Prisma client singleton
  types.ts            # TypeScript type definitions
```

## Key Features

1. **Import Methods:**
   - Manual entry with asset class selection
   - CSV upload with robust parsing (handles quoted fields)

2. **Analytics:**
   - HHI concentration index
   - Top holding weights
   - Effective holdings count

3. **Stress Testing:**
   - 2022 Rate Shock scenario
   - Single Stock Shock scenario
   - Global Recession scenario

4. **Rebalancing Presets:**
   - Balanced Growth
   - Growth + Income
   - Conservative Income
   - Aggressive Growth

## Development

The app runs on port 5000 with `npm run dev`.

### Database

Uses PostgreSQL via Prisma. Schema includes:
- User (demo user for now)
- Portfolio
- Holding
- Additional models for future features

### API Routes

- `GET /api/portfolios` - List all portfolios
- `POST /api/portfolios` - Create portfolio with holdings
- `GET /api/portfolios/[id]` - Get single portfolio
- `PUT /api/portfolios/[id]` - Update portfolio
- `DELETE /api/portfolios/[id]` - Delete portfolio

## Notes

- Values shown are based on cost basis (average cost), not live market prices
- All analytics are simplified for educational purposes
- Currently uses a demo user model; authentication can be added via NextAuth
