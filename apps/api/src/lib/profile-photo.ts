export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export const PROFILE_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ProfilePhotoMimeType = (typeof PROFILE_PHOTO_MIME_TYPES)[number];

export const PROFILE_PHOTO_INVALID_TYPE_MESSAGE =
  "Only JPEG, PNG, and WEBP images are supported.";
export const PROFILE_PHOTO_TOO_LARGE_MESSAGE = "Maximum file size is 2 MB.";
export const PROFILE_PHOTO_EMPTY_MESSAGE = "The uploaded file is empty.";
export const PROFILE_PHOTO_UPLOAD_FAILED_MESSAGE =
  "The photo could not be uploaded.";
export const PROFILE_PHOTO_REMOVE_FAILED_MESSAGE =
  "The photo could not be removed.";
export const PROFILE_PHOTO_NOT_FOUND_MESSAGE = "Profile photo not found.";
export const PROFILE_PHOTO_POSITION_INVALID_MESSAGE =
  "Photo position must contain integers from 0 to 100.";
export const PROFILE_PHOTO_POSITION_SAVE_FAILED_MESSAGE =
  "The photo position could not be saved.";
export const PROFILE_PHOTO_DEFAULT_POSITION = 50;

export type ProfilePhotoPosition = {
  positionX: number;
  positionY: number;
};

const ASSET_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_MIME = new Set<string>(PROFILE_PHOTO_MIME_TYPES);

export function isAssetId(value: string): boolean {
  return ASSET_ID_PATTERN.test(value);
}

export function masterCvPhotoObjectKey(
  userId: string,
  assetId: string,
): string {
  return `users/${userId}/master-cv/profile-photo/${assetId}`;
}

export function optimizedCvPhotoObjectKey(
  userId: string,
  applicationId: string,
  assetId: string,
): string {
  return `users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/${assetId}`;
}

export function optimizedCvPhotoPrefix(
  userId: string,
  applicationId: string,
): string {
  return `users/${userId}/applications/${applicationId}/optimized-cv/profile-photo/`;
}

function assetIdFromPrefixedKey(
  objectKey: string | null | undefined,
  prefix: string,
): string | null {
  if (!objectKey || !objectKey.startsWith(prefix)) {
    return null;
  }
  const assetId = objectKey.slice(prefix.length);
  if (!isAssetId(assetId) || assetId.includes("/")) {
    return null;
  }
  return assetId;
}

export function parseMasterCvPhotoAssetId(
  objectKey: string | null | undefined,
  userId: string,
): string | null {
  return assetIdFromPrefixedKey(
    objectKey,
    `users/${userId}/master-cv/profile-photo/`,
  );
}

export function parseOptimizedCvPhotoAssetId(
  objectKey: string | null | undefined,
  userId: string,
  applicationId: string,
): string | null {
  return assetIdFromPrefixedKey(
    objectKey,
    optimizedCvPhotoPrefix(userId, applicationId),
  );
}

export function detectProfilePhotoMime(
  bytes: Buffer,
): ProfilePhotoMimeType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).equals(Buffer.from("RIFF")) &&
    bytes.subarray(8, 12).equals(Buffer.from("WEBP"))
  ) {
    return "image/webp";
  }

  return null;
}

export function isAllowedProfilePhotoMime(
  value: string,
): value is ProfilePhotoMimeType {
  return ALLOWED_MIME.has(value);
}

export function validateProfilePhotoFile(
  declaredMimeType: string,
  bytes: Buffer,
): ProfilePhotoMimeType {
  if (bytes.length === 0) {
    throw new ProfilePhotoValidationError(PROFILE_PHOTO_EMPTY_MESSAGE);
  }
  if (bytes.length > PROFILE_PHOTO_MAX_BYTES) {
    throw new ProfilePhotoValidationError(PROFILE_PHOTO_TOO_LARGE_MESSAGE);
  }
  if (!isAllowedProfilePhotoMime(declaredMimeType)) {
    throw new ProfilePhotoValidationError(PROFILE_PHOTO_INVALID_TYPE_MESSAGE);
  }
  const detected = detectProfilePhotoMime(bytes);
  if (detected === null || detected !== declaredMimeType) {
    throw new ProfilePhotoValidationError(PROFILE_PHOTO_INVALID_TYPE_MESSAGE);
  }
  return detected;
}

function parsePositionValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
  }
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return parsed >= 0 && parsed <= 100 ? parsed : null;
}

export function validateProfilePhotoPosition(
  positionX: unknown,
  positionY: unknown,
  defaultWhenOmitted = false,
): ProfilePhotoPosition {
  if (
    defaultWhenOmitted &&
    positionX === undefined &&
    positionY === undefined
  ) {
    return {
      positionX: PROFILE_PHOTO_DEFAULT_POSITION,
      positionY: PROFILE_PHOTO_DEFAULT_POSITION,
    };
  }
  const parsedX = parsePositionValue(positionX);
  const parsedY = parsePositionValue(positionY);
  if (parsedX === null || parsedY === null) {
    throw new ProfilePhotoValidationError(
      PROFILE_PHOTO_POSITION_INVALID_MESSAGE,
    );
  }
  return { positionX: parsedX, positionY: parsedY };
}

export class ProfilePhotoValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
