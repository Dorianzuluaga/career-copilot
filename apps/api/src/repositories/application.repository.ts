import { prisma } from "../lib/prisma.js";

export function createApplication(userId: string) {
  return prisma.application.create({
    data: { userId },
  });
}

export function findApplicationsByUserId(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      jobOffer: true,
      jobAnalysis: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findApplicationByIdForUser(
  applicationId: string,
  userId: string,
) {
  return prisma.application.findFirst({
    where: { id: applicationId, userId },
    include: {
      jobOffer: true,
      jobAnalysis: true,
    },
  });
}

export function deleteApplicationByIdForUser(
  applicationId: string,
  userId: string,
) {
  return prisma.application.deleteMany({
    where: { id: applicationId, userId },
  });
}
