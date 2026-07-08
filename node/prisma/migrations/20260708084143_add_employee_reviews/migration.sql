-- CreateTable
CREATE TABLE "EmployeeReview" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "pros" TEXT NOT NULL,
    "cons" TEXT NOT NULL,
    "role" TEXT,
    "isCurrentEmployee" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'sample',
    "sourceUrl" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeReview_companyId_rating_idx" ON "EmployeeReview"("companyId", "rating");

-- AddForeignKey
ALTER TABLE "EmployeeReview" ADD CONSTRAINT "EmployeeReview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
