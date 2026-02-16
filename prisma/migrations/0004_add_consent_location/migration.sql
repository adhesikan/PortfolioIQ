-- AlterTable
ALTER TABLE "ConsentLog" ADD COLUMN IF NOT EXISTS "location" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "piiDisclaimerDismissedAt" TIMESTAMP(3);
