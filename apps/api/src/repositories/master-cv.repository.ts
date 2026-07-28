import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
import type { MasterCvInput } from "../types/master-cv.js";

function toData(input: MasterCvInput) {
  return {
    ...input,
    experience: input.experience as unknown as Prisma.InputJsonValue,
    education: input.education as unknown as Prisma.InputJsonValue,
    skills: input.skills,
    languages: input.languages as unknown as Prisma.InputJsonValue,
    certifications: input.certifications as unknown as Prisma.InputJsonValue,
  };
}

export function findMasterCvByUserId(userId: string) {
  return prisma.masterCv.findUnique({ where: { userId } });
}

export function createMasterCv(userId: string, input: MasterCvInput) {
  return prisma.masterCv.create({
    data: {
      ...toData(input),
      userId,
    },
  });
}

export function updateMasterCv(userId: string, input: MasterCvInput) {
  return prisma.masterCv.update({
    where: { userId },
    data: toData(input),
  });
}
