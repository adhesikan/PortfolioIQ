#!/bin/bash
echo "=== Production Startup ==="
echo "Syncing database schema..."
npx prisma db push --accept-data-loss
echo "Database sync complete!"
echo "Starting Next.js..."
npm run start
