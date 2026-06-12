-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'CONNECTED';
