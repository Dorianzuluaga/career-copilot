import { readFile, unlink } from "node:fs/promises";
import type { Request, Response } from "express";
import { extractMasterCv } from "../services/master-cv-extraction.service.js";
import {
  getMasterCvPhoto,
  ProfilePhotoError,
  removeMasterCvPhoto,
  replaceMasterCvPhoto,
  updateMasterCvPhotoPosition,
} from "../services/master-cv-photo.service.js";
import {
  addMasterCv,
  editMasterCv,
  getMasterCv,
  MasterCvError,
} from "../services/master-cv.service.js";
import { ProfilePhotoValidationError } from "../lib/profile-photo.js";

function userId(request: Request): string {
  return request.authenticatedUser!.id;
}

function handleError(error: unknown, response: Response): void {
  if (
    error instanceof MasterCvError ||
    error instanceof ProfilePhotoError ||
    error instanceof ProfilePhotoValidationError
  ) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  response.status(500).json({ message: "Internal server error." });
}

export async function showMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    response.status(200).json({ masterCv: await getMasterCv(userId(request)) });
  } catch (error) {
    handleError(error, response);
  }
}

export async function createMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const masterCv = await addMasterCv(userId(request), request.body);
    response.status(201).json({ masterCv });
  } catch (error) {
    handleError(error, response);
  }
}

export async function replaceMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const masterCv = await editMasterCv(userId(request), request.body);
    response.status(200).json({ masterCv });
  } catch (error) {
    handleError(error, response);
  }
}

export async function putMasterCvPhoto(
  request: Request,
  response: Response,
): Promise<void> {
  const file = request.file;
  if (!file) {
    response.status(400).json({
      message: "Only JPEG, PNG, and WEBP images are supported.",
    });
    return;
  }

  try {
    const bytes = await readFile(file.path);
    const result = await replaceMasterCvPhoto(
      userId(request),
      file.mimetype,
      bytes,
      request.body.positionX,
      request.body.positionY,
    );
    response.status(200).json(result);
  } catch (error) {
    handleError(error, response);
  } finally {
    try {
      await unlink(file.path);
    } catch {
      // Temporary upload files must not remain on disk.
    }
  }
}

export async function patchMasterCvPhoto(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await updateMasterCvPhotoPosition(
      userId(request),
      request.body?.positionX,
      request.body?.positionY,
    );
    response.status(200).json(result);
  } catch (error) {
    handleError(error, response);
  }
}

export async function deleteMasterCvPhoto(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    await removeMasterCvPhoto(userId(request));
    response.status(204).send();
  } catch (error) {
    handleError(error, response);
  }
}

export async function showMasterCvPhoto(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const photo = await getMasterCvPhoto(userId(request));
    response.setHeader("Content-Type", photo.contentType);
    response.setHeader("Cache-Control", "private, no-store");
    response.status(200).send(photo.bytes);
  } catch (error) {
    handleError(error, response);
  }
}

export async function uploadMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  const file = request.file;
  if (!file) {
    response.status(400).json({ message: "A PDF file is required." });
    return;
  }

  let result: Awaited<ReturnType<typeof extractMasterCv>> | null = null;
  let errorResponse: { status: number; message: string } | null = null;

  try {
    if (file.size === 0) {
      errorResponse = { status: 400, message: "The uploaded file is empty." };
    } else {
      const contents = await readFile(file.path);
      if (!contents.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
        errorResponse = {
          status: 400,
          message: "Only PDF files are supported.",
        };
      } else {
        result = await extractMasterCv(file.path, file.originalname);
      }
    }
  } catch {
    errorResponse = {
      status: 422,
      message: "We couldn't extract your CV automatically.",
    };
  }

  try {
    await unlink(file.path);
  } catch {
    response.status(500).json({ message: "Internal server error." });
    return;
  }

  if (errorResponse) {
    response
      .status(errorResponse.status)
      .json({ message: errorResponse.message });
    return;
  }

  response.status(200).json(result);
}
