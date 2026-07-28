import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";
import type { JobAnalysisData } from "../types/job-analysis.js";

function toJson(values: string[]): Prisma.InputJsonValue {
  return values;
}

export function findJobAnalysisByApplicationId(applicationId: string) {
  return prisma.jobAnalysis.findUnique({ where: { applicationId } });
}

export function createJobAnalysis(
  applicationId: string,
  analysis: JobAnalysisData,
) {
  return prisma
    .$transaction([
      prisma.jobAnalysis.create({
        data: {
          ...analysis,
          applicationId,
          languages: toJson(analysis.languages),
          requiredSkills: toJson(analysis.requiredSkills),
          responsibilities: toJson(analysis.responsibilities),
          atsKeywords: toJson(analysis.atsKeywords),
          analysisVersion: 1,
        },
      }),
      prisma.jobOffer.update({
        where: { applicationId },
        data: {
          title: analysis.title,
          company: analysis.company,
        },
      }),
    ])
    .then(([jobAnalysis]) => jobAnalysis);
}
