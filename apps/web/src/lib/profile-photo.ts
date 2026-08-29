export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export const PROFILE_PHOTO_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ProfilePhotoClientError = "invalidType" | "tooLarge";

export function getProfilePhotoFileError(
  file: File,
): ProfilePhotoClientError | null {
  if (file.size === 0 || !ALLOWED_MIME_TYPES.has(file.type)) {
    return "invalidType";
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "tooLarge";
  }
  return null;
}
