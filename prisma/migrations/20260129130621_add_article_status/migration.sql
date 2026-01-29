/*
  Warnings:

  - You are about to drop the column `published` on the `Article` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "published",
ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT';
