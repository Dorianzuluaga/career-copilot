import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
import type { ProfileComparisonGenerated } from "../types/profile-comparison.js";
import type { SupportedLocale } from "../types/supported-locale.js";

function toData(input: ProfileComparisonGenerated) {
  return {
    matchingSkills: input.matchingSkills as unknown as Prisma.InputJsonValue,
    missingSkills: input.missingSkills as unknown as Prisma.InputJsonValue,
    strengths: input.strengths as unknown as Prisma.InputJsonValue,
    weaknesses: input.weaknesses as unknown as Prisma.InputJsonValue,
    alignmentScore: input.alignmentScore,
    alignmentReasoning: input.alignmentReasoning,
    recommendation: input.recommendation,
  };
}

export function findProfileMatchByApplicationId(applicationId: string) {
  return prisma.profileMatch.findUnique({ where: { applicationId } });
}

export function upsertProfileMatch(
  applicationId: string,
  input: ProfileComparisonGenerated,
  workingLanguage: SupportedLocale,
) {
  const data = toData(input);
  return prisma.profileMatch.upsert({
    where: { applicationId },
    create: {
      ...data,
      applicationId,
      workingLanguage,
    },
    update: data,
  });
}
