-- CreateTable
CREATE TABLE "OptimizedCv" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "professionalSummary" TEXT NOT NULL,
    "experience" JSONB NOT NULL,
    "education" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "languages" JSONB NOT NULL,
    "certifications" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizedCv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OptimizedCv_applicationId_key" ON "OptimizedCv"("applicationId");

-- CreateIndex
CREATE INDEX "OptimizedCv_applicationId_idx" ON "OptimizedCv"("applicationId");

-- AddForeignKey
ALTER TABLE "OptimizedCv" ADD CONSTRAINT "OptimizedCv_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
