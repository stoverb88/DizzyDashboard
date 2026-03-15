/*
  Warnings:

  - You are about to drop the column `biometricEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `WebAuthnCredential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."WebAuthnCredential" DROP CONSTRAINT "WebAuthnCredential_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "biometricEnabled",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."WebAuthnCredential";

-- CreateTable
CREATE TABLE "ExerciseSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseType" TEXT NOT NULL,
    "targetSymbol" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "cadence" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "audioType" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualDuration" INTEGER,
    "beatCount" INTEGER,
    "dizzyRating" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "surfaceType" TEXT,
    "footPosition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseSession_userId_idx" ON "ExerciseSession"("userId");

-- CreateIndex
CREATE INDEX "ExerciseSession_userId_completedAt_idx" ON "ExerciseSession"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "ExerciseSession_exerciseType_idx" ON "ExerciseSession"("exerciseType");

-- AddForeignKey
ALTER TABLE "ExerciseSession" ADD CONSTRAINT "ExerciseSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
