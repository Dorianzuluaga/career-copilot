import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { useAuthenticatedImage } from "../hooks/useAuthenticatedImage";
import { useLocale } from "../hooks/useLocale";
import type { TranslationKey } from "../i18n/messages";
import {
  getProfilePhotoFileError,
  PROFILE_PHOTO_ACCEPT,
} from "../lib/profile-photo";
import { ApiError } from "../services/api";
import {
  deleteMasterCvPhoto,
  masterCvPhotoUrl,
  updateMasterCvPhotoPosition,
  uploadMasterCvPhoto,
} from "../services/master-cv";

const DEFAULT_POSITION = 50;
const PHOTO_API_ERROR_KEYS = {
  "Only JPEG, PNG, and WEBP images are supported.":
    "masterCv.validation.photoInvalidType",
  "Maximum file size is 2 MB.": "masterCv.validation.photoTooLarge",
  "The uploaded file is empty.": "masterCv.validation.photoInvalidType",
  "The photo could not be uploaded.": "masterCv.validation.photoUploadFailed",
  "The photo could not be removed.": "masterCv.validation.photoRemoveFailed",
  "The photo position could not be saved.":
    "masterCv.validation.photoPositionSaveFailed",
} as const;

type PhotoFailureKey =
  | "masterCv.validation.photoUploadFailed"
  | "masterCv.validation.photoRemoveFailed"
  | "masterCv.validation.photoPositionSaveFailed";

function photoErrorMessage(
  error: unknown,
  fallbackKey: PhotoFailureKey,
  t: (key: TranslationKey) => string,
): string {
  if (error instanceof ApiError) {
    const key =
      PHOTO_API_ERROR_KEYS[error.message as keyof typeof PHOTO_API_ERROR_KEYS];
    if (key) return t(key);
  }
  return t(fallbackKey);
}

function clampPosition(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function profilePhotoPositionAfterDrag(
  startX: number,
  startY: number,
  deltaX: number,
  deltaY: number,
  width: number,
  height: number,
): { positionX: number; positionY: number } {
  return {
    positionX: clampPosition(startX - (deltaX / Math.max(width, 1)) * 100),
    positionY: clampPosition(startY - (deltaY / Math.max(height, 1)) * 100),
  };
}

type DragStart = {
  pointerId: number;
  clientX: number;
  clientY: number;
  positionX: number;
  positionY: number;
};

export function MasterCvProfilePhotoField({
  persistence,
  assetId,
  positionX,
  positionY,
  onPhotoChange,
  pendingFile,
  onPendingFileChange,
  disabled,
}: {
  persistence: "immediate" | "deferred";
  assetId: string | null;
  positionX: number | null;
  positionY: number | null;
  onPhotoChange: (
    assetId: string | null,
    positionX: number | null,
    positionY: number | null,
  ) => void;
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const { t } = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef<DragStart | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(pendingFile);
  const [localPreview, setLocalPreview] = useState<string | null>(() =>
    pendingFile ? URL.createObjectURL(pendingFile) : null,
  );
  const [draftX, setDraftX] = useState(positionX ?? DEFAULT_POSITION);
  const [draftY, setDraftY] = useState(positionY ?? DEFAULT_POSITION);

  const remoteSrc = assetId && !selectedFile ? masterCvPhotoUrl(assetId) : null;
  const { objectUrl: remotePreview } = useAuthenticatedImage(remoteSrc);
  const previewSrc = localPreview ?? remotePreview;
  const hasPhoto = Boolean(selectedFile || pendingFile || assetId);
  const savedX = positionX ?? DEFAULT_POSITION;
  const savedY = positionY ?? DEFAULT_POSITION;
  const positionChanged = draftX !== savedX || draftY !== savedY;

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (!selectedFile) {
      setDraftX(positionX ?? DEFAULT_POSITION);
      setDraftY(positionY ?? DEFAULT_POSITION);
    }
  }, [assetId, positionX, positionY, selectedFile]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function setPosition(nextX: number, nextY: number) {
    setDraftX(clampPosition(nextX));
    setDraftY(clampPosition(nextY));
  }

  function handleSelectedFile(file: File | undefined) {
    if (!file) return;
    const clientError = getProfilePhotoFileError(file);
    if (clientError === "tooLarge") {
      setErrorMessage(t("masterCv.validation.photoTooLarge"));
      return;
    }
    if (clientError) {
      setErrorMessage(t("masterCv.validation.photoInvalidType"));
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setLocalPreview(URL.createObjectURL(file));
    onPendingFileChange(null);
    setPosition(DEFAULT_POSITION, DEFAULT_POSITION);
  }

  async function handleApply() {
    if (!selectedFile) return;
    setErrorMessage(null);
    if (persistence === "deferred") {
      onPendingFileChange(selectedFile);
      onPhotoChange(assetId, draftX, draftY);
      return;
    }

    setIsBusy(true);
    try {
      const result = await uploadMasterCvPhoto(selectedFile, draftX, draftY);
      onPendingFileChange(null);
      onPhotoChange(
        result.profilePhotoAssetId,
        result.profilePhotoPositionX,
        result.profilePhotoPositionY,
      );
      setSelectedFile(null);
      setLocalPreview(null);
    } catch (error) {
      setErrorMessage(
        photoErrorMessage(error, "masterCv.validation.photoUploadFailed", t),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSavePosition() {
    if (!assetId || selectedFile || !positionChanged) return;
    setErrorMessage(null);
    setIsBusy(true);
    try {
      const result = await updateMasterCvPhotoPosition(draftX, draftY);
      onPhotoChange(
        result.profilePhotoAssetId,
        result.profilePhotoPositionX,
        result.profilePhotoPositionY,
      );
    } catch (error) {
      setErrorMessage(
        photoErrorMessage(
          error,
          "masterCv.validation.photoPositionSaveFailed",
          t,
        ),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRemove() {
    setErrorMessage(null);
    setSelectedFile(null);
    setLocalPreview(null);
    onPendingFileChange(null);
    if (persistence === "deferred" || !assetId) {
      onPhotoChange(null, null, null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsBusy(true);
    try {
      await deleteMasterCvPhoto();
      onPhotoChange(null, null, null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setErrorMessage(
        photoErrorMessage(error, "masterCv.validation.photoRemoveFailed", t),
      );
    } finally {
      setIsBusy(false);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!previewSrc || disabled || isBusy) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      positionX: draftX,
      positionY: draftY,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = profilePhotoPositionAfterDrag(
      start.positionX,
      start.positionY,
      event.clientX - start.clientX,
      event.clientY - start.clientY,
      bounds.width,
      bounds.height,
    );
    setPosition(position.positionX, position.positionY);
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current?.pointerId === event.pointerId) {
      dragStart.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="sm:col-span-2">
      <p className="text-sm font-medium text-ink">
        {t("masterCv.form.profilePhoto")}
      </p>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={PROFILE_PHOTO_ACCEPT}
        className="sr-only"
        disabled={disabled || isBusy}
        onChange={(event) => {
          handleSelectedFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {hasPhoto ? (
        <div className="mt-3 flex flex-col items-start gap-5 sm:flex-row">
          <div
            className="h-36 w-36 shrink-0 touch-none overflow-hidden rounded bg-muted/20"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            {previewSrc ? (
              <img
                src={previewSrc}
                alt={t("masterCv.form.profilePhoto")}
                draggable={false}
                className="h-full w-full select-none object-cover"
                style={{ objectPosition: `${draftX}% ${draftY}%` }}
              />
            ) : null}
          </div>
          <div
            className="flex flex-col items-start gap-3"
            data-profile-photo-actions
          >
            <p className="text-sm text-muted">
              {t("masterCv.form.positionPhoto")}
            </p>
            {selectedFile ? (
              <button
                type="button"
                onClick={() => void handleApply()}
                disabled={disabled || isBusy}
                className="cc-btn-primary px-3 py-1.5"
              >
                {t("masterCv.form.applyPhoto")}
              </button>
            ) : assetId ? (
              <button
                type="button"
                onClick={() => void handleSavePosition()}
                disabled={disabled || isBusy || !positionChanged}
                className="cc-btn-primary px-3 py-1.5"
              >
                {t("masterCv.form.savePhotoPosition")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={openFilePicker}
              disabled={disabled || isBusy}
              className="cc-btn-secondary px-3 py-1.5"
            >
              {t("masterCv.form.replacePhoto")}
            </button>
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={disabled || isBusy}
              className="px-3 py-1.5 text-left text-sm font-semibold text-danger"
            >
              {t("masterCv.form.removePhoto")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-muted">
            {t("masterCv.form.profilePhotoHelper")}
          </p>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled || isBusy}
            className="cc-btn-secondary mt-3 px-3 py-1.5"
          >
            {t("masterCv.form.uploadPhoto")}
          </button>
        </div>
      )}
      {errorMessage ? (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
