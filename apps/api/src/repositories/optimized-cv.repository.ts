import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
import type { OptimizedCv } from "../types/optimized-cv.js";

function toData(input: OptimizedCv) {
  return {
    ...input,
    experience: input.experience as unknown as Prisma.InputJsonValue,
    education: input.education as unknown as Prisma.InputJsonValue,
    skills: input.skills,
    languages: input.languages as unknown as Prisma.InputJsonValue,
    certifications: input.certifications as unknown as Prisma.InputJsonValue,
  };
}

export function findOptimizedCvByApplicationId(applicationId: string) {
  return prisma.optimizedCv.findUnique({ where: { applicationId } });
}

export function upsertOptimizedCv(applicationId: string, input: OptimizedCv) {
  const data = toData(input);
  return prisma.optimizedCv.upsert({
    where: { applicationId },
    create: {
      ...data,
      applicationId,
    },
    update: data,
  });
}
