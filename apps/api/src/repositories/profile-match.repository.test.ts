import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    profileMatch: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/prisma.js";
import {
  findProfileMatchByApplicationId,
  upsertProfileMatch,
} from "./profile-match.repository.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const comparison = {
  matchingSkills: ["TypeScript"],
  missingSkills: ["Docker"],
  strengths: [
    "TypeScript experience directly supports the role's core requirement.",
  ],
  weaknesses: [
    "Docker is required by the role but is not demonstrated in the Master CV.",
  ],
  alignmentScore: 72,
  alignmentReasoning:
    "Relevant backend experience supports the role, but Docker is missing.",
  recommendation: "Good opportunity. Improve your CV before applying.",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("profile match repository", () => {
  it("reads a row by application id without substituting workingLanguage", async () => {
    vi.mocked(prisma.profileMatch.findUnique).mockResolvedValue({
      applicationId,
      workingLanguage: null,
    } as never);

    await expect(
      findProfileMatchByApplicationId(applicationId),
    ).resolves.toEqual({
      applicationId,
      workingLanguage: null,
    });
    expect(prisma.profileMatch.findUnique).toHaveBeenCalledWith({
      where: { applicationId },
    });
  });

  it.each(["es", "en", "fr"] as const)(
    "stores workingLanguage %s on create only",
    async (workingLanguage) => {
      vi.mocked(prisma.profileMatch.upsert).mockResolvedValue({
        applicationId,
        workingLanguage,
      } as never);

      await expect(
        upsertProfileMatch(applicationId, comparison, workingLanguage),
      ).resolves.toEqual({
        applicationId,
        workingLanguage,
      });
      expect(prisma.profileMatch.upsert).toHaveBeenCalledWith({
        where: { applicationId },
        create: expect.objectContaining({
          applicationId,
          workingLanguage,
          alignmentScore: 72,
          recommendation: comparison.recommendation,
        }),
        update: expect.not.objectContaining({
          workingLanguage,
        }),
      });
      expect(
        vi.mocked(prisma.profileMatch.upsert).mock.calls[0][0].update,
      ).not.toHaveProperty("workingLanguage");
    },
  );
});
