import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
import type { MasterCvInput } from "../types/master-cv.js";

function toData(
  input: MasterCvInput,
  profilePhotoObjectKey?: string | null,
  profilePhotoPositionX?: number | null,
  profilePhotoPositionY?: number | null,
) {
  return {
    ...input,
    experience: input.experience as unknown as Prisma.InputJsonValue,
    education: input.education as unknown as Prisma.InputJsonValue,
    skills: input.skills,
    languages: input.languages as unknown as Prisma.InputJsonValue,
    certifications: input.certifications as unknown as Prisma.InputJsonValue,
    personalProjects: (input.personalProjects ??
      []) as unknown as Prisma.InputJsonValue,
    ...(profilePhotoObjectKey === undefined ? {} : { profilePhotoObjectKey }),
    ...(profilePhotoPositionX === undefined ? {} : { profilePhotoPositionX }),
    ...(profilePhotoPositionY === undefined ? {} : { profilePhotoPositionY }),
  };
}

export function findOptimizedCvByApplicationId(applicationId: string) {
  return prisma.optimizedCv.findUnique({ where: { applicationId } });
}

export function upsertOptimizedCv(
  applicationId: string,
  input: MasterCvInput,
  profilePhotoObjectKey: string | null,
  profilePhotoPositionX: number | null,
  profilePhotoPositionY: number | null,
) {
  const data = toData(
    input,
    profilePhotoObjectKey,
    profilePhotoPositionX,
    profilePhotoPositionY,
  );
  return prisma.optimizedCv.upsert({
    where: { applicationId },
    create: {
      ...data,
      applicationId,
    },
    update: data,
  });
}
