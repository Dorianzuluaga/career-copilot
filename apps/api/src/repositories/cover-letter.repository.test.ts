import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    coverLetter: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/prisma.js";
import {
  findCoverLetterByApplicationId,
  upsertCoverLetter,
} from "./cover-letter.repository.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const coverLetter = {
  candidateName: "Taylor Smith",
  email: "taylor@example.com",
  phone: null,
  date: "August 7, 2026",
  companyName: "Acme",
  greeting: "Dear Hiring Manager,",
  introduction: "I am writing to apply.",
  professionalValue: "I build APIs.",
  motivation: "I want to join the team.",
  closing: "Thank you.",
  signature: "Taylor Smith",
  workingLanguage: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("cover letter repository", () => {
  it("reads a legacy row with null Working Language", async () => {
    vi.mocked(prisma.coverLetter.findUnique).mockResolvedValue({
      applicationId,
      ...coverLetter,
    } as never);

    await expect(
      findCoverLetterByApplicationId(applicationId),
    ).resolves.toEqual({
      applicationId,
      ...coverLetter,
    });
    expect(prisma.coverLetter.findUnique).toHaveBeenCalledWith({
      where: { applicationId },
    });
  });

  it.each(["es", "en", "fr"] as const)(
    "round-trips Working Language %s on create and update",
    async (workingLanguage) => {
      const input = { ...coverLetter, workingLanguage };
      vi.mocked(prisma.coverLetter.upsert).mockResolvedValue({
        applicationId,
        ...input,
      } as never);

      await expect(upsertCoverLetter(applicationId, input)).resolves.toEqual({
        applicationId,
        ...input,
      });
      expect(prisma.coverLetter.upsert).toHaveBeenCalledWith({
        where: { applicationId },
        create: expect.objectContaining({
          applicationId,
          workingLanguage,
        }),
        update: expect.objectContaining({
          workingLanguage,
        }),
      });
    },
  );

  it("round-trips a legacy null Working Language without substituting a locale", async () => {
    vi.mocked(prisma.coverLetter.upsert).mockResolvedValue({
      applicationId,
      ...coverLetter,
    } as never);

    await expect(
      upsertCoverLetter(applicationId, coverLetter),
    ).resolves.toEqual({
      applicationId,
      ...coverLetter,
    });
    expect(prisma.coverLetter.upsert).toHaveBeenCalledWith({
      where: { applicationId },
      create: expect.objectContaining({
        workingLanguage: null,
      }),
      update: expect.objectContaining({
        workingLanguage: null,
      }),
    });
  });
});
