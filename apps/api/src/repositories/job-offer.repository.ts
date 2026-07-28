import { prisma } from "../lib/prisma.js";

export function findJobOfferByApplicationId(applicationId: string) {
  return prisma.jobOffer.findUnique({ where: { applicationId } });
}

export function createJobOffer(
  applicationId: string,
  originalDescription: string,
) {
  return prisma.jobOffer.create({
    data: {
      applicationId,
      originalDescription,
    },
  });
}
