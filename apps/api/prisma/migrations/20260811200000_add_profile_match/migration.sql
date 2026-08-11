-- CreateTable
CREATE TABLE "ProfileMatch" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "matchingSkills" JSONB NOT NULL,
    "missingSkills" JSONB NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "alignmentScore" INTEGER NOT NULL,
    "alignmentReasoning" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileMatch_applicationId_key" ON "ProfileMatch"("applicationId");

-- CreateIndex
CREATE INDEX "ProfileMatch_applicationId_idx" ON "ProfileMatch"("applicationId");

-- AddForeignKey
ALTER TABLE "ProfileMatch" ADD CONSTRAINT "ProfileMatch_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
