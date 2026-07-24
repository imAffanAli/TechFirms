-- CreateTable
CREATE TABLE "ExternalRating" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" TEXT,
    "sourceUrl" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalRating_companyId_idx" ON "ExternalRating"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalRating_companyId_source_key" ON "ExternalRating"("companyId", "source");

-- AddForeignKey
ALTER TABLE "ExternalRating" ADD CONSTRAINT "ExternalRating_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
