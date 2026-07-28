-- CreateTable
CREATE TABLE "MasterCv" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
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

    CONSTRAINT "MasterCv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterCv_userId_key" ON "MasterCv"("userId");

-- CreateIndex
CREATE INDEX "MasterCv_userId_idx" ON "MasterCv"("userId");

-- AddForeignKey
ALTER TABLE "MasterCv" ADD CONSTRAINT "MasterCv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
