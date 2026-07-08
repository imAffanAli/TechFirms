-- CreateEnum
CREATE TYPE "Role" AS ENUM ('visitor', 'business_owner', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('unclaimed', 'claimed', 'verified');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('native', 'imported');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('New', 'Forwarded', 'Contacted', 'Closed');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('work_email_domain', 'dns_txt');

-- CreateEnum
CREATE TYPE "Quadrant" AS ENUM ('Leaders', 'Challengers', 'Rising_Stars', 'Niche_Players');

-- CreateEnum
CREATE TYPE "ScoreTier" AS ENUM ('Unrated', 'Rated');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('ai_development', 'custom_software', 'web_development', 'mobile_app_development', 'cloud', 'devops', 'data_engineering', 'cybersecurity', 'it_staff_augmentation', 'ui_ux_design');

-- CreateEnum
CREATE TYPE "SponsorshipTier" AS ENUM ('featured', 'sponsored', 'verified_plus');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'visitor',
    "supabaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "priceMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "website" TEXT,
    "domain" TEXT,
    "foundedYear" INTEGER,
    "employeeRangeMin" INTEGER,
    "employeeRangeMax" INTEGER,
    "hourlyRateMin" INTEGER,
    "hourlyRateMax" INTEGER,
    "rateCurrency" TEXT NOT NULL DEFAULT 'USD',
    "minProjectSize" INTEGER,
    "listingStatus" "ListingStatus" NOT NULL DEFAULT 'unclaimed',
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "hqCountryId" TEXT,
    "hqCityId" TEXT,
    "source" TEXT,
    "sourceId" TEXT,
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyService" (
    "companyId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "focusPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyService_pkey" PRIMARY KEY ("companyId","serviceId")
);

-- CreateTable
CREATE TABLE "OfficeLocation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "cityId" TEXT,
    "addressLine" TEXT,
    "isHeadquarters" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerReview" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "invitationId" TEXT,
    "reviewerName" TEXT,
    "reviewerTitle" TEXT,
    "reviewerCompany" TEXT,
    "projectBudget" INTEGER,
    "projectCurrency" TEXT NOT NULL DEFAULT 'USD',
    "projectDurationMonths" INTEGER,
    "ratingQuality" INTEGER,
    "ratingSchedule" INTEGER,
    "ratingCost" INTEGER,
    "ratingWillingToRefer" INTEGER,
    "ratingOverall" INTEGER NOT NULL,
    "body" TEXT,
    "source" "ReviewSource" NOT NULL DEFAULT 'native',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "sourceName" TEXT,
    "sourceId" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSentiment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "overallRating" DECIMAL(3,2) NOT NULL,
    "culture" DECIMAL(3,2),
    "compensation" DECIMAL(3,2),
    "workLifeBalance" DECIMAL(3,2),
    "leadership" DECIMAL(3,2),
    "recommendPct" INTEGER,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceId" TEXT,
    "asOf" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSentiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustSignal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "domainAgeYears" DECIMAL(5,2),
    "sslValid" BOOLEAN,
    "githubOrgActivity" INTEGER,
    "linkedinFollowers" INTEGER,
    "certifications" JSONB,
    "awards" JSONB,
    "fundingRaised" INTEGER,
    "fundingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "crunchbaseUrl" TEXT,
    "asOf" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceScore" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cis" INTEGER NOT NULL,
    "reviewsScore" INTEGER NOT NULL,
    "sentimentScore" INTEGER,
    "trustScore" INTEGER,
    "marketScore" INTEGER,
    "marketPresence" INTEGER NOT NULL,
    "clientSatisfaction" INTEGER NOT NULL,
    "quadrant" "Quadrant",
    "tier" "ScoreTier" NOT NULL DEFAULT 'Unrated',
    "justification" TEXT,
    "formulaVersion" TEXT NOT NULL DEFAULT 'cis-v1',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelligenceScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "cis" INTEGER NOT NULL,
    "reviewsScore" INTEGER NOT NULL,
    "sentimentScore" INTEGER,
    "trustScore" INTEGER,
    "marketScore" INTEGER,
    "marketPresence" INTEGER NOT NULL,
    "clientSatisfaction" INTEGER NOT NULL,
    "quadrant" "Quadrant",
    "formulaVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Query" (
    "id" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "serviceCategory" "ServiceCategory",
    "countryId" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "budgetCurrency" TEXT NOT NULL DEFAULT 'USD',
    "timeline" TEXT,
    "description" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "status" "QueryStatus" NOT NULL DEFAULT 'New',
    "directCompanyId" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryMatch" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "matchScore" DECIMAL(5,2),
    "forwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueryMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "verificationMethod" "VerificationMethod" NOT NULL,
    "verificationEvidence" JSONB,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewInvitation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientName" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "serviceId" TEXT,
    "title" TEXT NOT NULL,
    "answerBlock" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "rankings" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsorship" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tier" "SponsorshipTier" NOT NULL,
    "countryId" TEXT,
    "serviceCategory" "ServiceCategory",
    "slotRank" INTEGER,
    "badges" JSONB,
    "priceAmount" INTEGER,
    "priceCurrency" TEXT NOT NULL DEFAULT 'USD',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "robotsTxt" TEXT,
    "crawlDelayMs" INTEGER NOT NULL DEFAULT 2000,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "targetUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "workerId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawScrapeRecord" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "jobId" TEXT,
    "sourceRecordId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "payload" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "companyId" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawScrapeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_isoCode_key" ON "Country"("isoCode");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "City"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "City_countryId_slug_key" ON "City"("countryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_hqCountryId_idx" ON "Company"("hqCountryId");

-- CreateIndex
CREATE INDEX "Company_listingStatus_idx" ON "Company"("listingStatus");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_source_sourceId_key" ON "Company"("source", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_category_key" ON "Service"("category");

-- CreateIndex
CREATE INDEX "CompanyService_serviceId_idx" ON "CompanyService"("serviceId");

-- CreateIndex
CREATE INDEX "OfficeLocation_companyId_idx" ON "OfficeLocation"("companyId");

-- CreateIndex
CREATE INDEX "OfficeLocation_countryId_idx" ON "OfficeLocation"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReview_invitationId_key" ON "CustomerReview"("invitationId");

-- CreateIndex
CREATE INDEX "CustomerReview_companyId_verified_idx" ON "CustomerReview"("companyId", "verified");

-- CreateIndex
CREATE INDEX "CustomerReview_companyId_reviewedAt_idx" ON "CustomerReview"("companyId", "reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReview_sourceName_sourceId_key" ON "CustomerReview"("sourceName", "sourceId");

-- CreateIndex
CREATE INDEX "EmployeeSentiment_companyId_idx" ON "EmployeeSentiment"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSentiment_companyId_sourceName_asOf_key" ON "EmployeeSentiment"("companyId", "sourceName", "asOf");

-- CreateIndex
CREATE INDEX "TrustSignal_companyId_idx" ON "TrustSignal"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustSignal_companyId_asOf_key" ON "TrustSignal"("companyId", "asOf");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceScore_companyId_key" ON "IntelligenceScore"("companyId");

-- CreateIndex
CREATE INDEX "IntelligenceScore_cis_idx" ON "IntelligenceScore"("cis");

-- CreateIndex
CREATE INDEX "IntelligenceScore_quadrant_idx" ON "IntelligenceScore"("quadrant");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_companyId_idx" ON "ScoreSnapshot"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreSnapshot_companyId_periodYear_periodMonth_key" ON "ScoreSnapshot"("companyId", "periodYear", "periodMonth");

-- CreateIndex
CREATE INDEX "Query_status_idx" ON "Query"("status");

-- CreateIndex
CREATE INDEX "Query_directCompanyId_idx" ON "Query"("directCompanyId");

-- CreateIndex
CREATE INDEX "QueryMatch_companyId_idx" ON "QueryMatch"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "QueryMatch_queryId_companyId_key" ON "QueryMatch"("queryId", "companyId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_companyId_idx" ON "Claim"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewInvitation_token_key" ON "ReviewInvitation"("token");

-- CreateIndex
CREATE INDEX "ReviewInvitation_companyId_idx" ON "ReviewInvitation"("companyId");

-- CreateIndex
CREATE INDEX "Leaderboard_countryId_idx" ON "Leaderboard"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_countryId_serviceId_key" ON "Leaderboard"("countryId", "serviceId");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_leaderboardId_idx" ON "LeaderboardSnapshot"("leaderboardId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardSnapshot_leaderboardId_periodYear_periodMonth_key" ON "LeaderboardSnapshot"("leaderboardId", "periodYear", "periodMonth");

-- CreateIndex
CREATE INDEX "Sponsorship_companyId_idx" ON "Sponsorship"("companyId");

-- CreateIndex
CREATE INDEX "Sponsorship_active_endsAt_idx" ON "Sponsorship"("active", "endsAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeSource_name_key" ON "ScrapeSource"("name");

-- CreateIndex
CREATE INDEX "ScrapeJob_status_idx" ON "ScrapeJob"("status");

-- CreateIndex
CREATE INDEX "ScrapeJob_sourceId_idx" ON "ScrapeJob"("sourceId");

-- CreateIndex
CREATE INDEX "RawScrapeRecord_companyId_idx" ON "RawScrapeRecord"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "RawScrapeRecord_sourceId_sourceRecordId_key" ON "RawScrapeRecord"("sourceId", "sourceRecordId");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_hqCountryId_fkey" FOREIGN KEY ("hqCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_hqCityId_fkey" FOREIGN KEY ("hqCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeLocation" ADD CONSTRAINT "OfficeLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeLocation" ADD CONSTRAINT "OfficeLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeLocation" ADD CONSTRAINT "OfficeLocation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "ReviewInvitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSentiment" ADD CONSTRAINT "EmployeeSentiment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustSignal" ADD CONSTRAINT "TrustSignal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceScore" ADD CONSTRAINT "IntelligenceScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_directCompanyId_fkey" FOREIGN KEY ("directCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryMatch" ADD CONSTRAINT "QueryMatch_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryMatch" ADD CONSTRAINT "QueryMatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewInvitation" ADD CONSTRAINT "ReviewInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsorship" ADD CONSTRAINT "Sponsorship_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeJob" ADD CONSTRAINT "ScrapeJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ScrapeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawScrapeRecord" ADD CONSTRAINT "RawScrapeRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ScrapeSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawScrapeRecord" ADD CONSTRAINT "RawScrapeRecord_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScrapeJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawScrapeRecord" ADD CONSTRAINT "RawScrapeRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
