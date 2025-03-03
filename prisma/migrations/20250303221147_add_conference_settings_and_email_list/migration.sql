-- CreateTable
CREATE TABLE "ConferenceSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "ConferenceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailList" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "EmailList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailList_email_key" ON "EmailList"("email");

-- CreateIndex
CREATE INDEX "EmailList_email_idx" ON "EmailList"("email");
