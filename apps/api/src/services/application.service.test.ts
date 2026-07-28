import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/application.repository.js", () => ({
  createApplication: vi.fn(),
  deleteApplicationByIdForUser: vi.fn(),
  findApplicationByIdForUser: vi.fn(),
  findApplicationsByUserId: vi.fn(),
}));

import {
  deleteApplicationByIdForUser,
  findApplicationsByUserId,
} from "../repositories/application.repository.js";
import {
  ApplicationError,
  listApplications,
  removeApplication,
} from "./application.service.js";

const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("persisted application dashboard operations", () => {
  it("lists only applications selected for the authenticated user", async () => {
    const applications = [{ id: applicationId }];
    vi.mocked(findApplicationsByUserId).mockResolvedValue(
      applications as never,
    );

    await expect(listApplications(userId)).resolves.toBe(applications);
    expect(findApplicationsByUserId).toHaveBeenCalledWith(userId);
  });

  it("deletes through an ownership-scoped repository operation", async () => {
    vi.mocked(deleteApplicationByIdForUser).mockResolvedValue({ count: 1 });

    await expect(
      removeApplication(applicationId, userId),
    ).resolves.toBeUndefined();
    expect(deleteApplicationByIdForUser).toHaveBeenCalledWith(
      applicationId,
      userId,
    );
  });

  it("does not reveal or delete another user's application", async () => {
    vi.mocked(deleteApplicationByIdForUser).mockResolvedValue({ count: 0 });

    await expect(removeApplication(applicationId, userId)).rejects.toEqual(
      new ApplicationError("Application not found.", 404),
    );
  });
});
