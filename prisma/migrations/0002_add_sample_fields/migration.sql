-- AlterTable
ALTER TABLE "User" ADD COLUMN "sampleDisclaimerAcceptedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN "inputType" TEXT NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "Upload" ADD COLUMN "sampleType" TEXT;
ALTER TABLE "Upload" ADD COLUMN "isSample" BOOLEAN NOT NULL DEFAULT false;
