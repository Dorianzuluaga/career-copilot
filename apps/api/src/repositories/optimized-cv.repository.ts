import type { Prisma } from "../../generated/prisma/index.js";
import { encodePersistedOptimizedCvSkills } from "../lib/optimized-cv-skills.js";
import { prisma } from "../lib/prisma.js";
import type { OptimizedCvText } from "../types/optimized-cv.js";
import type { SupportedLocale } from "../types/supported-locale.js";

function toData(
  input: OptimizedCvText,
  profilePhotoObjectKey?: string | null,
  profilePhotoPositionX?: number | null,
  profilePhotoPositionY?: number | null,
  workingLanguage?: SupportedLocale | null,
) {
  const { skillGroups, ...text } = input;
  return {
    ...text,
    experience: text.experience as unknown as Prisma.InputJsonValue,
    education: text.education as unknown as Prisma.InputJsonValue,
    skills: encodePersistedOptimizedCvSkills(
      text.skills,
      skillGroups,
    ) as unknown as Prisma.InputJsonValue,
    languages: text.languages as unknown as Prisma.InputJsonValue,
    certifications: text.certifications as unknown as Prisma.InputJsonValue,
    personalProjects: (text.personalProjects ??
      []) as unknown as Prisma.InputJsonValue,
    ...(profilePhotoObjectKey === undefined ? {} : { profilePhotoObjectKey }),
    ...(profilePhotoPositionX === undefined ? {} : { profilePhotoPositionX }),
    ...(profilePhotoPositionY === undefined ? {} : { profilePhotoPositionY }),
    ...(workingLanguage === undefined ? {} : { workingLanguage }),
  };
}

export function findOptimizedCvByApplicationId(applicationId: string) {
  return prisma.optimizedCv.findUnique({ where: { applicationId } });
}

export function upsertOptimizedCv(
  applicationId: string,
  input: OptimizedCvText,
  profilePhotoObjectKey: string | null,
  profilePhotoPositionX: number | null,
  profilePhotoPositionY: number | null,
  workingLanguage: SupportedLocale | null,
) {
  const data = toData(
    input,
    profilePhotoObjectKey,
    profilePhotoPositionX,
    profilePhotoPositionY,
    workingLanguage,
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
