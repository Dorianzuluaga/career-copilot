import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    optimizedCv: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/prisma.js";
import {
  findOptimizedCvByApplicationId,
  upsertOptimizedCv,
} from "./optimized-cv.repository.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const input = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  website: null,
  professionalSummary: "Software engineer",
  experience: [],
  education: [],
  skills: ["TypeScript"],
  languages: [],
  certifications: [],
  personalProjects: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("optimized CV repository", () => {
  it("reads a row by application id", async () => {
    vi.mocked(prisma.optimizedCv.findUnique).mockResolvedValue({
      applicationId,
      workingLanguage: null,
    } as never);

    await expect(
      findOptimizedCvByApplicationId(applicationId),
    ).resolves.toEqual({
      applicationId,
      workingLanguage: null,
    });
    expect(prisma.optimizedCv.findUnique).toHaveBeenCalledWith({
      where: { applicationId },
    });
  });

  it.each(["es", "en", "fr"] as const)(
    "round-trips Working Language %s on create and update",
    async (workingLanguage) => {
      vi.mocked(prisma.optimizedCv.upsert).mockResolvedValue({
        applicationId,
        workingLanguage,
      } as never);

      await expect(
        upsertOptimizedCv(
          applicationId,
          input,
          null,
          null,
          null,
          workingLanguage,
        ),
      ).resolves.toEqual({
        applicationId,
        workingLanguage,
      });
      expect(prisma.optimizedCv.upsert).toHaveBeenCalledWith({
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
    vi.mocked(prisma.optimizedCv.upsert).mockResolvedValue({
      applicationId,
      workingLanguage: null,
    } as never);

    await expect(
      upsertOptimizedCv(applicationId, input, null, null, null, null),
    ).resolves.toEqual({
      applicationId,
      workingLanguage: null,
    });
    expect(prisma.optimizedCv.upsert).toHaveBeenCalledWith({
      where: { applicationId },
      create: expect.objectContaining({
        workingLanguage: null,
      }),
      update: expect.objectContaining({
        workingLanguage: null,
      }),
    });
  });

  it("persists grouped skills in the existing Json column", async () => {
    vi.mocked(prisma.optimizedCv.upsert).mockResolvedValue({
      applicationId,
      skills: {
        groups: [{ category: "Front-End", skills: ["TypeScript"] }],
        additionalSkills: ["Excel"],
      },
    } as never);

    await upsertOptimizedCv(
      applicationId,
      {
        ...input,
        skills: ["TypeScript", "Excel"],
        skillGroups: [{ category: "Front-End", skills: ["TypeScript"] }],
      },
      null,
      null,
      null,
      "en",
    );

    expect(prisma.optimizedCv.upsert).toHaveBeenCalledWith({
      where: { applicationId },
      create: expect.objectContaining({
        applicationId,
        skills: {
          groups: [{ category: "Front-End", skills: ["TypeScript"] }],
          additionalSkills: ["Excel"],
        },
      }),
      update: expect.objectContaining({
        skills: {
          groups: [{ category: "Front-End", skills: ["TypeScript"] }],
          additionalSkills: ["Excel"],
        },
      }),
    });
  });

  it("persists legacy skills as a string array", async () => {
    vi.mocked(prisma.optimizedCv.upsert).mockResolvedValue({
      applicationId,
      skills: ["TypeScript"],
    } as never);

    await upsertOptimizedCv(applicationId, input, null, null, null, "en");

    expect(prisma.optimizedCv.upsert).toHaveBeenCalledWith({
      where: { applicationId },
      create: expect.objectContaining({
        skills: ["TypeScript"],
      }),
      update: expect.objectContaining({
        skills: ["TypeScript"],
      }),
    });
  });
});
