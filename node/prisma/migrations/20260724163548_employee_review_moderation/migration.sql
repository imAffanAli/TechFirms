-- AlterTable
ALTER TABLE "EmployeeReview" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
