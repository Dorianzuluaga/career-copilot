-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW');

-- CreateTable
CREATE TABLE "Application" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOffer" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "originalDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAnalysis" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "employmentType" TEXT,
    "location" TEXT,
    "experienceLevel" TEXT,
    "education" TEXT,
    "languages" JSONB NOT NULL,
    "summary" TEXT,
    "requiredSkills" JSONB NOT NULL,
    "responsibilities" JSONB NOT NULL,
    "atsKeywords" JSONB NOT NULL,
    "analysisVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobOffer_applicationId_key" ON "JobOffer"("applicationId");

-- CreateIndex
CREATE INDEX "JobOffer_applicationId_idx" ON "JobOffer"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "JobAnalysis_applicationId_key" ON "JobAnalysis"("applicationId");

-- CreateIndex
CREATE INDEX "JobAnalysis_applicationId_idx" ON "JobAnalysis"("applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAnalysis" ADD CONSTRAINT "JobAnalysis_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
