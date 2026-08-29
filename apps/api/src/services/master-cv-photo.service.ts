import { randomUUID } from "node:crypto";
import {
  detectProfilePhotoMime,
  masterCvPhotoObjectKey,
  optimizedCvPhotoObjectKey,
  optimizedCvPhotoPrefix,
  parseMasterCvPhotoAssetId,
  parseOptimizedCvPhotoAssetId,
  PROFILE_PHOTO_NOT_FOUND_MESSAGE,
  PROFILE_PHOTO_POSITION_SAVE_FAILED_MESSAGE,
  PROFILE_PHOTO_REMOVE_FAILED_MESSAGE,
  PROFILE_PHOTO_UPLOAD_FAILED_MESSAGE,
  ProfilePhotoValidationError,
  validateProfilePhotoFile,
  validateProfilePhotoPosition,
} from "../lib/profile-photo.js";
import {
  findMasterCvByUserId,
  updateMasterCvProfilePhoto,
  updateMasterCvProfilePhotoPosition as persistMasterCvProfilePhotoPosition,
} from "../repositories/master-cv.repository.js";
import { findOptimizedCvByApplicationId } from "../repositories/optimized-cv.repository.js";
import { MasterCvError } from "./master-cv.service.js";
import {
  copyProfilePhotoObject,
  deleteProfilePhotoObjectBestEffort,
  deleteUnreferencedProfilePhotoObjects,
  profilePhotoObjectExists,
  readProfilePhotoObject,
  writeProfilePhotoObject,
} from "./profile-photo-storage.service.js";

export class ProfilePhotoError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

async function requireMasterCv(userId: string) {
  const masterCv = await findMasterCvByUserId(userId);
  if (!masterCv) {
    throw new MasterCvError("Master CV not found.", 404);
  }
  return masterCv;
}

async function readOwnedPhoto(
  objectKey: string,
): Promise<{ bytes: Buffer; contentType: string }> {
  const bytes = await readProfilePhotoObject(objectKey);
  const contentType = detectProfilePhotoMime(bytes);
  if (!contentType) {
    throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
  }
  return { bytes, contentType };
}

export async function replaceMasterCvPhoto(
  userId: string,
  declaredMimeType: string,
  bytes: Buffer,
  requestedPositionX?: unknown,
  requestedPositionY?: unknown,
): Promise<{
  profilePhotoAssetId: string;
  profilePhotoPositionX: number;
  profilePhotoPositionY: number;
}> {
  try {
    const contentType = validateProfilePhotoFile(declaredMimeType, bytes);
    const { positionX, positionY } = validateProfilePhotoPosition(
      requestedPositionX,
      requestedPositionY,
      true,
    );
    const masterCv = await requireMasterCv(userId);
    const previousKey = masterCv.profilePhotoObjectKey;
    const assetId = randomUUID();
    const objectKey = masterCvPhotoObjectKey(userId, assetId);

    await writeProfilePhotoObject(objectKey, bytes, contentType);

    try {
      await updateMasterCvProfilePhoto(
        userId,
        objectKey,
        positionX,
        positionY,
      );
    } catch (error) {
      await deleteProfilePhotoObjectBestEffort(objectKey);
      throw error;
    }

    if (previousKey && previousKey !== objectKey) {
      await deleteProfilePhotoObjectBestEffort(previousKey);
    }

    return {
      profilePhotoAssetId: assetId,
      profilePhotoPositionX: positionX,
      profilePhotoPositionY: positionY,
    };
  } catch (error) {
    if (
      error instanceof ProfilePhotoValidationError ||
      error instanceof MasterCvError ||
      error instanceof ProfilePhotoError
    ) {
      throw error;
    }
    throw new ProfilePhotoError(PROFILE_PHOTO_UPLOAD_FAILED_MESSAGE, 500);
  }
}

export async function updateMasterCvPhotoPosition(
  userId: string,
  requestedPositionX: unknown,
  requestedPositionY: unknown,
): Promise<{
  profilePhotoAssetId: string;
  profilePhotoPositionX: number;
  profilePhotoPositionY: number;
}> {
  try {
    const { positionX, positionY } = validateProfilePhotoPosition(
      requestedPositionX,
      requestedPositionY,
    );
    const masterCv = await requireMasterCv(userId);
    const assetId = parseMasterCvPhotoAssetId(
      masterCv.profilePhotoObjectKey,
      userId,
    );
    if (!masterCv.profilePhotoObjectKey || !assetId) {
      throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
    }
    await persistMasterCvProfilePhotoPosition(userId, positionX, positionY);
    return {
      profilePhotoAssetId: assetId,
      profilePhotoPositionX: positionX,
      profilePhotoPositionY: positionY,
    };
  } catch (error) {
    if (
      error instanceof ProfilePhotoValidationError ||
      error instanceof MasterCvError ||
      error instanceof ProfilePhotoError
    ) {
      throw error;
    }
    throw new ProfilePhotoError(
      PROFILE_PHOTO_POSITION_SAVE_FAILED_MESSAGE,
      500,
    );
  }
}

export async function removeMasterCvPhoto(userId: string): Promise<void> {
  try {
    const masterCv = await requireMasterCv(userId);
    const previousKey = masterCv.profilePhotoObjectKey;
    if (!previousKey) {
      return;
    }

    await updateMasterCvProfilePhoto(userId, null, null, null);
    await deleteProfilePhotoObjectBestEffort(previousKey);
  } catch (error) {
    if (error instanceof MasterCvError || error instanceof ProfilePhotoError) {
      throw error;
    }
    throw new ProfilePhotoError(PROFILE_PHOTO_REMOVE_FAILED_MESSAGE, 500);
  }
}

export async function getMasterCvPhoto(
  userId: string,
): Promise<{ bytes: Buffer; contentType: string }> {
  const masterCv = await requireMasterCv(userId);
  const assetId = parseMasterCvPhotoAssetId(
    masterCv.profilePhotoObjectKey,
    userId,
  );
  if (!masterCv.profilePhotoObjectKey || !assetId) {
    throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
  }

  try {
    return await readOwnedPhoto(masterCv.profilePhotoObjectKey);
  } catch (error) {
    if (error instanceof ProfilePhotoError) {
      throw error;
    }
    throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
  }
}

export async function snapshotMasterCvPhoto(
  userId: string,
  applicationId: string,
  sourceKey: string | null,
  savedSnapshotKey: string | null,
): Promise<string | null> {
  let snapshotKey: string | null = null;

  if (sourceKey) {
    const assetId = randomUUID();
    snapshotKey = optimizedCvPhotoObjectKey(userId, applicationId, assetId);
    try {
      await copyProfilePhotoObject(sourceKey, snapshotKey);
    } catch (error) {
      await deleteProfilePhotoObjectBestEffort(snapshotKey);
      throw error;
    }
  }

  await deleteUnreferencedProfilePhotoObjects(
    optimizedCvPhotoPrefix(userId, applicationId),
    [savedSnapshotKey, snapshotKey],
  );

  return snapshotKey;
}

export async function getOptimizedCvPhoto(
  userId: string,
  applicationId: string,
  assetId: string | null,
): Promise<{ bytes: Buffer; contentType: string }> {
  if (assetId) {
    const objectKey = optimizedCvPhotoObjectKey(userId, applicationId, assetId);
    if (
      parseOptimizedCvPhotoAssetId(objectKey, userId, applicationId) === null
    ) {
      throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
    }
    try {
      if (!(await profilePhotoObjectExists(objectKey))) {
        throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
      }
      return await readOwnedPhoto(objectKey);
    } catch (error) {
      if (error instanceof ProfilePhotoError) {
        throw error;
      }
      throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
    }
  }

  const saved = await findOptimizedCvByApplicationId(applicationId);
  const savedAssetId = parseOptimizedCvPhotoAssetId(
    saved?.profilePhotoObjectKey,
    userId,
    applicationId,
  );
  if (!saved?.profilePhotoObjectKey || !savedAssetId) {
    throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
  }

  try {
    return await readOwnedPhoto(saved.profilePhotoObjectKey);
  } catch (error) {
    if (error instanceof ProfilePhotoError) {
      throw error;
    }
    throw new ProfilePhotoError(PROFILE_PHOTO_NOT_FOUND_MESSAGE, 404);
  }
}

export async function deleteApplicationProfilePhotos(
  userId: string,
  applicationId: string,
): Promise<void> {
  await deleteUnreferencedProfilePhotoObjects(
    optimizedCvPhotoPrefix(userId, applicationId),
    [],
  );
}

export async function resolveOptimizedCvPhotoObjectKey(input: {
  userId: string;
  applicationId: string;
  requestedAssetId: string | null | undefined;
  savedObjectKey: string | null;
}): Promise<string | null> {
  const { userId, applicationId, requestedAssetId, savedObjectKey } = input;

  if (requestedAssetId === undefined) {
    return savedObjectKey;
  }
  if (requestedAssetId === null) {
    return null;
  }

  const objectKey = optimizedCvPhotoObjectKey(
    userId,
    applicationId,
    requestedAssetId,
  );
  if (parseOptimizedCvPhotoAssetId(objectKey, userId, applicationId) === null) {
    throw new ProfilePhotoError("profilePhotoAssetId is invalid.", 400);
  }
  if (objectKey === savedObjectKey) {
    return objectKey;
  }

  const exists = await profilePhotoObjectExists(objectKey);
  if (!exists) {
    throw new ProfilePhotoError("profilePhotoAssetId is invalid.", 400);
  }
  return objectKey;
}
