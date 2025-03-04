-- AlterTable
ALTER TABLE "ConferenceSettings" ADD COLUMN     "address" VARCHAR(1024) NOT NULL DEFAULT '',
ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '';
