import { describe, expect, it } from "vitest";
import {
  detectProfilePhotoMime,
  masterCvPhotoObjectKey,
  optimizedCvPhotoObjectKey,
  parseMasterCvPhotoAssetId,
  parseOptimizedCvPhotoAssetId,
  PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TOO_LARGE_MESSAGE,
  ProfilePhotoValidationError,
  validateProfilePhotoFile,
  validateProfilePhotoPosition,
} from "./profile-photo.js";

const userId = "4e9c843b-5c3d-4e65-8514-7de898b2aca6";
const applicationId = "8e9c843b-5c3d-4e65-8514-7de898b2aca6";
const assetId = "7e9c843b-5c3d-4e65-8514-7de898b2aca6";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
]);
const webp = Buffer.concat([
  Buffer.from("RIFF"),
  Buffer.from([0x10, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP"),
  Buffer.from("VP8 "),
]);
const gif = Buffer.from("GIF89a");
const pdf = Buffer.from("%PDF-1.7");

describe("profile photo object keys", () => {
  it("derives Master CV and Optimized CV keys from server ids", () => {
    expect(masterCvPhotoObjectKey(userId, assetId)).toBe(
      `users/${userId}/master-cv/profile-photo/${assetId}`,
    );
    expect(optimizedCvPhotoObjectKey(userId, applicationId, assetId)).toBe(
      `users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/${assetId}`,
    );
  });

  it("parses asset ids only from owned prefixes", () => {
    const masterKey = masterCvPhotoObjectKey(userId, assetId);
    const snapshotKey = optimizedCvPhotoObjectKey(
      userId,
      applicationId,
      assetId,
    );

    expect(parseMasterCvPhotoAssetId(masterKey, userId)).toBe(assetId);
    expect(parseMasterCvPhotoAssetId(null, userId)).toBeNull();
    expect(
      parseMasterCvPhotoAssetId(
        "https://storage.googleapis.com/bucket/photo.jpg",
        userId,
      ),
    ).toBeNull();
    expect(parseOptimizedCvPhotoAssetId(snapshotKey, userId, applicationId)).toBe(
      assetId,
    );
    expect(
      parseOptimizedCvPhotoAssetId(masterKey, userId, applicationId),
    ).toBeNull();
    expect(
      parseOptimizedCvPhotoAssetId(
        optimizedCvPhotoObjectKey(
          "00000000-0000-4000-8000-000000000000",
          applicationId,
          assetId,
        ),
        userId,
        applicationId,
      ),
    ).toBeNull();
  });
});

describe("profile photo validation", () => {
  it("accepts JPEG, PNG, and WEBP at or under 2 MB", () => {
    expect(validateProfilePhotoFile("image/jpeg", jpeg)).toBe("image/jpeg");
    expect(validateProfilePhotoFile("image/png", png)).toBe("image/png");
    expect(validateProfilePhotoFile("image/webp", webp)).toBe("image/webp");
    expect(detectProfilePhotoMime(jpeg)).toBe("image/jpeg");
  });

  it("rejects empty files, oversize files, and disallowed types", () => {
    expect(() => validateProfilePhotoFile("image/jpeg", Buffer.alloc(0))).toThrow(
      ProfilePhotoValidationError,
    );
    expect(() =>
      validateProfilePhotoFile(
        "image/jpeg",
        Buffer.alloc(PROFILE_PHOTO_MAX_BYTES + 1, jpeg[0]),
      ),
    ).toThrow(PROFILE_PHOTO_TOO_LARGE_MESSAGE);
    expect(() => validateProfilePhotoFile("image/gif", gif)).toThrow(
      PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
    );
    expect(() => validateProfilePhotoFile("image/svg+xml", Buffer.from("<svg"))).toThrow(
      PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
    );
    expect(() => validateProfilePhotoFile("image/heic", Buffer.from("ftypheic"))).toThrow(
      PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
    );
    expect(() => validateProfilePhotoFile("application/pdf", pdf)).toThrow(
      PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
    );
    expect(() => validateProfilePhotoFile("image/jpeg", gif)).toThrow(
      PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
    );
    expect(() => validateProfilePhotoFile("image/png", jpeg)).toThrow(
      PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
    );
  });
});

describe("profile photo position validation", () => {
  it("accepts paired integer percentages and defaults omitted upload values", () => {
    expect(validateProfilePhotoPosition(0, 100)).toEqual({
      positionX: 0,
      positionY: 100,
    });
    expect(validateProfilePhotoPosition("25", "75")).toEqual({
      positionX: 25,
      positionY: 75,
    });
    expect(validateProfilePhotoPosition(undefined, undefined, true)).toEqual({
      positionX: 50,
      positionY: 50,
    });
  });

  it.each([
    [undefined, 50],
    [50, undefined],
    [1.5, 50],
    ["1.5", "50"],
    [-1, 50],
    [50, 101],
    ["left", "50"],
  ])("rejects invalid position pair %j, %j", (positionX, positionY) => {
    expect(() =>
      validateProfilePhotoPosition(positionX, positionY),
    ).toThrow(ProfilePhotoValidationError);
  });
});
