import {
  isAssetId,
  optimizedCvPhotoPrefix,
  parseOptimizedCvPhotoAssetId,
  PROFILE_PHOTO_DEFAULT_POSITION,
  ProfilePhotoValidationError,
  validateProfilePhotoPosition,
} from "../lib/profile-photo.js";
import { findMasterCvByUserId } from "../repositories/master-cv.repository.js";
import {
  findOptimizedCvByApplicationId,
  upsertOptimizedCv,
} from "../repositories/optimized-cv.repository.js";
import type { MasterCvInput } from "../types/master-cv.js";
import type {
  GeneratedOptimizedCvDraft,
  OptimizedCv,
} from "../types/optimized-cv.js";
import {
  isSupportedLocale,
  parseNullableSupportedLocale,
  SupportedLocaleValidationError,
  type SupportedLocale,
} from "../types/supported-locale.js";
import {
  ApplicationError,
  getOwnedApplication,
} from "./application.service.js";
import { MasterCvError, validateMasterCvInput } from "./master-cv.service.js";
import {
  ProfilePhotoError,
  getOptimizedCvPhoto,
  resolveOptimizedCvPhotoObjectKey,
  snapshotMasterCvPhoto,
} from "./master-cv-photo.service.js";
import { generateOptimizedCvDraft } from "./optimized-cv-ai.service.js";
import { deleteUnreferencedProfilePhotoObjects } from "./profile-photo-storage.service.js";
import {
  getProfileComparison,
  prepareProfileComparisonInput,
  ProfileComparisonError,
} from "./profile-comparison.service.js";

export class OptimizedCvError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function parseWorkingLanguage(value: unknown): SupportedLocale | null {
  try {
    return parseNullableSupportedLocale(value, "workingLanguage");
  } catch (error) {
    if (error instanceof SupportedLocaleValidationError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

function readPayloadWorkingLanguage(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return "workingLanguage" in value
    ? (value as { workingLanguage: unknown }).workingLanguage
    : undefined;
}

function readStoredWorkingLanguage(record: unknown): SupportedLocale | null {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }
  if (!("workingLanguage" in record)) {
    return null;
  }
  const value = (record as { workingLanguage: unknown }).workingLanguage;
  if (value === null || value === undefined) {
    return null;
  }
  if (!isSupportedLocale(value)) {
    throw new OptimizedCvError("The saved Optimized CV is invalid.", 400);
  }
  return value;
}

function validateOptimizedCvText(value: unknown): MasterCvInput {
  try {
    return validateMasterCvInput(value);
  } catch (error) {
    if (error instanceof MasterCvError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

function toPublicOptimizedCv(
  record: unknown,
  userId: string,
  applicationId: string,
): OptimizedCv {
  const text = validateOptimizedCvText(record);
  const objectKey =
    record &&
    typeof record === "object" &&
    "profilePhotoObjectKey" in record &&
    typeof (record as { profilePhotoObjectKey: unknown })
      .profilePhotoObjectKey === "string"
      ? (record as { profilePhotoObjectKey: string }).profilePhotoObjectKey
      : null;
  const profilePhotoAssetId = parseOptimizedCvPhotoAssetId(
    objectKey,
    userId,
    applicationId,
  );
  const storedPositionX =
    record &&
    typeof record === "object" &&
    "profilePhotoPositionX" in record &&
    typeof (record as { profilePhotoPositionX: unknown })
      .profilePhotoPositionX === "number"
      ? (record as { profilePhotoPositionX: number }).profilePhotoPositionX
      : PROFILE_PHOTO_DEFAULT_POSITION;
  const storedPositionY =
    record &&
    typeof record === "object" &&
    "profilePhotoPositionY" in record &&
    typeof (record as { profilePhotoPositionY: unknown })
      .profilePhotoPositionY === "number"
      ? (record as { profilePhotoPositionY: number }).profilePhotoPositionY
      : PROFILE_PHOTO_DEFAULT_POSITION;
  return {
    ...text,
    profilePhotoAssetId,
    profilePhotoPositionX:
      profilePhotoAssetId === null ? null : storedPositionX,
    profilePhotoPositionY:
      profilePhotoAssetId === null ? null : storedPositionY,
    workingLanguage: readStoredWorkingLanguage(record),
  };
}

type ClientPhotoConfiguration = {
  assetId: string | null;
  positionX: number | null;
  positionY: number | null;
};

function parseClientPhotoConfiguration(
  value: unknown,
): ClientPhotoConfiguration | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const hasAssetId = "profilePhotoAssetId" in value;
  const hasPositionX = "profilePhotoPositionX" in value;
  const hasPositionY = "profilePhotoPositionY" in value;
  if (!hasAssetId && !hasPositionX && !hasPositionY) {
    return undefined;
  }
  if (!hasAssetId) {
    throw new OptimizedCvError(
      "The profile photo configuration is invalid.",
      400,
    );
  }
  const assetId = (value as { profilePhotoAssetId: unknown })
    .profilePhotoAssetId;
  if (assetId === null || assetId === "") {
    const positionX = hasPositionX
      ? (value as { profilePhotoPositionX: unknown }).profilePhotoPositionX
      : null;
    const positionY = hasPositionY
      ? (value as { profilePhotoPositionY: unknown }).profilePhotoPositionY
      : null;
    if (positionX !== null || positionY !== null) {
      throw new OptimizedCvError(
        "The profile photo configuration is invalid.",
        400,
      );
    }
    return { assetId: null, positionX: null, positionY: null };
  }
  if (typeof assetId !== "string" || !isAssetId(assetId)) {
    throw new OptimizedCvError("profilePhotoAssetId is invalid.", 400);
  }
  try {
    const position = validateProfilePhotoPosition(
      hasPositionX
        ? (value as { profilePhotoPositionX: unknown }).profilePhotoPositionX
        : undefined,
      hasPositionY
        ? (value as { profilePhotoPositionY: unknown }).profilePhotoPositionY
        : undefined,
    );
    return {
      assetId,
      positionX: position.positionX,
      positionY: position.positionY,
    };
  } catch (error) {
    if (error instanceof ProfilePhotoValidationError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

async function requireOwnedApplication(applicationId: string, userId: string) {
  try {
    await getOwnedApplication(applicationId, userId);
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

function mapPhotoError(error: unknown): never {
  if (error instanceof ProfilePhotoError) {
    throw new OptimizedCvError(error.message, error.statusCode);
  }
  throw error;
}

export async function generateOptimizedCv(
  applicationId: string,
  userId: string,
  locale: SupportedLocale,
): Promise<GeneratedOptimizedCvDraft> {
  try {
    const input = await prepareProfileComparisonInput(applicationId, userId);
    const profileMatch = await getProfileComparison(applicationId, userId);
    const masterCv = await findMasterCvByUserId(userId);
    const saved = await findOptimizedCvByApplicationId(applicationId);
    const snapshotKey = await snapshotMasterCvPhoto(
      userId,
      applicationId,
      masterCv?.profilePhotoObjectKey ?? null,
      saved?.profilePhotoObjectKey ?? null,
    );
    const profilePhotoAssetId = parseOptimizedCvPhotoAssetId(
      snapshotKey,
      userId,
      applicationId,
    );
    const profilePhotoPositionX =
      profilePhotoAssetId === null
        ? null
        : (masterCv?.profilePhotoPositionX ?? PROFILE_PHOTO_DEFAULT_POSITION);
    const profilePhotoPositionY =
      profilePhotoAssetId === null
        ? null
        : (masterCv?.profilePhotoPositionY ?? PROFILE_PHOTO_DEFAULT_POSITION);
    return generateOptimizedCvDraft(
      {
        masterCv: input.masterCv,
        jobAnalysis: input.jobAnalysis,
        profileMatch,
      },
      locale,
      profilePhotoAssetId,
      profilePhotoPositionX,
      profilePhotoPositionY,
    );
  } catch (error) {
    if (error instanceof ProfileComparisonError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    if (error instanceof ProfilePhotoError) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    if (
      error instanceof Error &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
    ) {
      throw new OptimizedCvError(error.message, error.statusCode);
    }
    throw error;
  }
}

export async function getOptimizedCv(
  applicationId: string,
  userId: string,
): Promise<OptimizedCv> {
  await requireOwnedApplication(applicationId, userId);
  const optimizedCv = await findOptimizedCvByApplicationId(applicationId);
  if (!optimizedCv) {
    throw new OptimizedCvError("Optimized CV not found.", 404);
  }
  return toPublicOptimizedCv(optimizedCv, userId, applicationId);
}

export async function readOptimizedCvPhoto(
  applicationId: string,
  userId: string,
  assetId: string | null,
): Promise<{ bytes: Buffer; contentType: string }> {
  await requireOwnedApplication(applicationId, userId);
  try {
    return await getOptimizedCvPhoto(userId, applicationId, assetId);
  } catch (error) {
    mapPhotoError(error);
  }
}

export async function saveOptimizedCv(
  applicationId: string,
  userId: string,
  value: unknown,
): Promise<OptimizedCv> {
  await requireOwnedApplication(applicationId, userId);
  const input = validateOptimizedCvText(value);
  const workingLanguage = parseWorkingLanguage(
    readPayloadWorkingLanguage(value),
  );
  const requestedPhoto = parseClientPhotoConfiguration(value);
  const saved = await findOptimizedCvByApplicationId(applicationId);
  if (!saved && workingLanguage === null) {
    throw new OptimizedCvError(
      'workingLanguage must be one of "es", "en", or "fr".',
      400,
    );
  }
  let nextObjectKey: string | null;
  try {
    nextObjectKey = await resolveOptimizedCvPhotoObjectKey({
      userId,
      applicationId,
      requestedAssetId: requestedPhoto?.assetId,
      savedObjectKey: saved?.profilePhotoObjectKey ?? null,
    });
  } catch (error) {
    mapPhotoError(error);
  }
  const optimizedCv = await upsertOptimizedCv(
    applicationId,
    input,
    nextObjectKey,
    nextObjectKey === null
      ? null
      : (requestedPhoto?.positionX ??
          saved?.profilePhotoPositionX ??
          PROFILE_PHOTO_DEFAULT_POSITION),
    nextObjectKey === null
      ? null
      : (requestedPhoto?.positionY ??
          saved?.profilePhotoPositionY ??
          PROFILE_PHOTO_DEFAULT_POSITION),
    workingLanguage,
  );
  await deleteUnreferencedProfilePhotoObjects(
    optimizedCvPhotoPrefix(userId, applicationId),
    [nextObjectKey],
  );
  return toPublicOptimizedCv(optimizedCv, userId, applicationId);
}
