import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
import type { ProfileComparisonResult } from "../types/profile-comparison.js";

function toData(input: ProfileComparisonResult) {
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
  input: ProfileComparisonResult,
) {
  const data = toData(input);
  return prisma.profileMatch.upsert({
    where: { applicationId },
    create: {
      ...data,
      applicationId,
    },
    update: data,
  });
}
