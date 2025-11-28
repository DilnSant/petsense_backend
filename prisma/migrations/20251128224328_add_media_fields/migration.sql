/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Pet` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Provider_type_idx";

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "updatedAt";
