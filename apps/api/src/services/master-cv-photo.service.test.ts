import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/master-cv.repository.js", () => ({
  findMasterCvByUserId: vi.fn(),
  updateMasterCvProfilePhoto: vi.fn(),
  updateMasterCvProfilePhotoPosition: vi.fn(),
}));

vi.mock("../repositories/optimized-cv.repository.js", () => ({
  findOptimizedCvByApplicationId: vi.fn(),
}));

vi.mock("./profile-photo-storage.service.js", () => ({
  writeProfilePhotoObject: vi.fn(),
  readProfilePhotoObject: vi.fn(),
  copyProfilePhotoObject: vi.fn(),
  deleteProfilePhotoObjectBestEffort: vi.fn(),
  deleteUnreferencedProfilePhotoObjects: vi.fn(),
  profilePhotoObjectExists: vi.fn(),
}));

import {
  findMasterCvByUserId,
  updateMasterCvProfilePhoto,
  updateMasterCvProfilePhotoPosition,
} from "../repositories/master-cv.repository.js";
import { findOptimizedCvByApplicationId } from "../repositories/optimized-cv.repository.js";
import {
  deleteApplicationProfilePhotos,
  getMasterCvPhoto,
  ProfilePhotoError,
  removeMasterCvPhoto,
  replaceMasterCvPhoto,
  snapshotMasterCvPhoto,
  updateMasterCvPhotoPosition,
} from "./master-cv-photo.service.js";
import {
  copyProfilePhotoObject,
  deleteProfilePhotoObjectBestEffort,
  deleteUnreferencedProfilePhotoObjects,
  writeProfilePhotoObject,
} from "./profile-photo-storage.service.js";

const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";
const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(findMasterCvByUserId).mockResolvedValue({
    userId,
    profilePhotoObjectKey: null,
  } as never);
  vi.mocked(updateMasterCvProfilePhoto).mockResolvedValue({} as never);
  vi.mocked(updateMasterCvProfilePhotoPosition).mockResolvedValue({} as never);
  vi.mocked(writeProfilePhotoObject).mockResolvedValue();
  vi.mocked(deleteProfilePhotoObjectBestEffort).mockResolvedValue();
  vi.mocked(deleteUnreferencedProfilePhotoObjects).mockResolvedValue();
  vi.mocked(copyProfilePhotoObject).mockResolvedValue();
  vi.mocked(findOptimizedCvByApplicationId).mockResolvedValue(null);
});

describe("replaceMasterCvPhoto", () => {
  it("stores an object key and does not copy User.avatar", async () => {
    const result = await replaceMasterCvPhoto(userId, "image/jpeg", jpeg);

    expect(result.profilePhotoAssetId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(writeProfilePhotoObject).toHaveBeenCalledWith(
      `users/${userId}/master-cv/profile-photo/${result.profilePhotoAssetId}`,
      jpeg,
      "image/jpeg",
    );
    expect(updateMasterCvProfilePhoto).toHaveBeenCalledWith(
      userId,
      `users/${userId}/master-cv/profile-photo/${result.profilePhotoAssetId}`,
      50,
      50,
    );
    expect(JSON.stringify(result)).not.toContain("https://");
    expect(JSON.stringify(result)).not.toContain("avatar");
  });

  it("deletes the previous Master CV object after replace", async () => {
    const previousKey = `users/${userId}/master-cv/profile-photo/11111111-1111-4111-8111-111111111111`;
    vi.mocked(findMasterCvByUserId).mockResolvedValue({
      userId,
      profilePhotoObjectKey: previousKey,
    } as never);

    await replaceMasterCvPhoto(userId, "image/jpeg", jpeg);

    expect(deleteProfilePhotoObjectBestEffort).toHaveBeenCalledWith(previousKey);
  });

  it("stores the selected position with the original image", async () => {
    const result = await replaceMasterCvPhoto(
      userId,
      "image/jpeg",
      jpeg,
      "25",
      "75",
    );

    expect(result).toMatchObject({
      profilePhotoPositionX: 25,
      profilePhotoPositionY: 75,
    });
    expect(updateMasterCvProfilePhoto).toHaveBeenCalledWith(
      userId,
      expect.any(String),
      25,
      75,
    );
  });

  it("rejects partial and out-of-range upload positions before writing", async () => {
    await expect(
      replaceMasterCvPhoto(userId, "image/jpeg", jpeg, 25, undefined),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      replaceMasterCvPhoto(userId, "image/jpeg", jpeg, 25, 101),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(writeProfilePhotoObject).not.toHaveBeenCalled();
  });

  it("deletes the newly written object if the database write fails", async () => {
    vi.mocked(updateMasterCvProfilePhoto).mockRejectedValue(
      new Error("database write failed"),
    );

    await expect(
      replaceMasterCvPhoto(userId, "image/jpeg", jpeg),
    ).rejects.toBeInstanceOf(ProfilePhotoError);
    expect(deleteProfilePhotoObjectBestEffort).toHaveBeenCalled();
  });
});

describe("updateMasterCvPhotoPosition", () => {
  it("updates metadata without rewriting the bucket object", async () => {
    const assetId = "11111111-1111-4111-8111-111111111111";
    vi.mocked(findMasterCvByUserId).mockResolvedValue({
      userId,
      profilePhotoObjectKey: `users/${userId}/master-cv/profile-photo/${assetId}`,
    } as never);

    await expect(
      updateMasterCvPhotoPosition(userId, 20, 80),
    ).resolves.toEqual({
      profilePhotoAssetId: assetId,
      profilePhotoPositionX: 20,
      profilePhotoPositionY: 80,
    });
    expect(updateMasterCvProfilePhotoPosition).toHaveBeenCalledWith(
      userId,
      20,
      80,
    );
    expect(writeProfilePhotoObject).not.toHaveBeenCalled();
  });

  it("rejects updates when the Master CV has no photo", async () => {
    await expect(
      updateMasterCvPhotoPosition(userId, 20, 80),
    ).rejects.toEqual(new ProfilePhotoError("Profile photo not found.", 404));
    expect(updateMasterCvProfilePhotoPosition).not.toHaveBeenCalled();
  });
});

describe("removeMasterCvPhoto", () => {
  it("persists null and deletes the Master CV object", async () => {
    const previousKey = `users/${userId}/master-cv/profile-photo/11111111-1111-4111-8111-111111111111`;
    vi.mocked(findMasterCvByUserId).mockResolvedValue({
      userId,
      profilePhotoObjectKey: previousKey,
    } as never);

    await removeMasterCvPhoto(userId);

    expect(updateMasterCvProfilePhoto).toHaveBeenCalledWith(
      userId,
      null,
      null,
      null,
    );
    expect(deleteProfilePhotoObjectBestEffort).toHaveBeenCalledWith(previousKey);
  });
});

describe("getMasterCvPhoto", () => {
  it("returns not found when the Master CV photo is empty", async () => {
    await expect(getMasterCvPhoto(userId)).rejects.toEqual(
      new ProfilePhotoError("Profile photo not found.", 404),
    );
  });
});

describe("snapshotMasterCvPhoto", () => {
  it("copies to a new application key and leaves the Master CV key unchanged", async () => {
    const sourceKey = `users/${userId}/master-cv/profile-photo/${"11111111-1111-4111-8111-111111111111"}`;

    const snapshotKey = await snapshotMasterCvPhoto(
      userId,
      applicationId,
      sourceKey,
      null,
    );

    expect(snapshotKey).toMatch(
      new RegExp(
        `^users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/`,
      ),
    );
    expect(snapshotKey).not.toBe(sourceKey);
    expect(copyProfilePhotoObject).toHaveBeenCalledWith(sourceKey, snapshotKey);
  });

  it("stores a null snapshot when the Master CV has no photo", async () => {
    await expect(
      snapshotMasterCvPhoto(userId, applicationId, null, null),
    ).resolves.toBeNull();
    expect(copyProfilePhotoObject).not.toHaveBeenCalled();
  });
});

describe("deleteApplicationProfilePhotos", () => {
  it("deletes application snapshot objects and does not target the Master CV prefix", async () => {
    await deleteApplicationProfilePhotos(userId, applicationId);

    expect(deleteUnreferencedProfilePhotoObjects).toHaveBeenCalledWith(
      `users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/`,
      [],
    );
  });
});
