-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'active', 'rejected', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('manual_invoice', 'stripe', 'admin_grant');

-- AlterTable
ALTER TABLE "Sponsorship" ADD COLUMN     "planId" TEXT;

-- CreateTable
CREATE TABLE "SponsorshipPlan" (
    "id" TEXT NOT NULL,
    "tier" "SponsorshipTier" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "priceAmount" INTEGER NOT NULL,
    "priceCurrency" TEXT NOT NULL DEFAULT 'USD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorshipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorshipOrder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "tier" "SponsorshipTier" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "countryId" TEXT,
    "serviceCategory" "ServiceCategory",
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "paymentMethod" "PaymentMethod",
    "sponsorshipId" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorshipOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SponsorshipPlan_tier_durationDays_key" ON "SponsorshipPlan"("tier", "durationDays");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorshipOrder_sponsorshipId_key" ON "SponsorshipOrder"("sponsorshipId");

-- CreateIndex
CREATE INDEX "SponsorshipOrder_companyId_idx" ON "SponsorshipOrder"("companyId");

-- CreateIndex
CREATE INDEX "SponsorshipOrder_status_idx" ON "SponsorshipOrder"("status");

-- AddForeignKey
ALTER TABLE "SponsorshipOrder" ADD CONSTRAINT "SponsorshipOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorshipOrder" ADD CONSTRAINT "SponsorshipOrder_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SponsorshipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorshipOrder" ADD CONSTRAINT "SponsorshipOrder_sponsorshipId_fkey" FOREIGN KEY ("sponsorshipId") REFERENCES "Sponsorship"("id") ON DELETE SET NULL ON UPDATE CASCADE;
