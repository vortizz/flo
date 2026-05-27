/*
  Warnings:

  - A unique constraint covering the columns `[basiqId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "basiqId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_basiqId_key" ON "Transaction"("basiqId");
