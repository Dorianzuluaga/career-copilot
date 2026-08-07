import { prisma } from "../lib/prisma.js";
import type { CoverLetter } from "../types/cover-letter.js";

function toData(input: CoverLetter) {
  return {
    candidateName: input.candidateName,
    email: input.email,
    phone: input.phone,
    date: input.date,
    companyName: input.companyName,
    greeting: input.greeting,
    introduction: input.introduction,
    professionalValue: input.professionalValue,
    motivation: input.motivation,
    closing: input.closing,
    signature: input.signature,
  };
}

export function findCoverLetterByApplicationId(applicationId: string) {
  return prisma.coverLetter.findUnique({ where: { applicationId } });
}

export function upsertCoverLetter(applicationId: string, input: CoverLetter) {
  const data = toData(input);
  return prisma.coverLetter.upsert({
    where: { applicationId },
    create: {
      ...data,
      applicationId,
    },
    update: data,
  });
}
