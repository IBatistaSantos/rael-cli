/*
  Warnings:

  - A unique constraint covering the columns `[provider_id]` on the table `repositories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider_id` to the `repositories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "repositories" ADD COLUMN     "provider_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "repositories_provider_id_key" ON "repositories"("provider_id");
