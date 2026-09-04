import type { Request, Response } from "express";
import { isAssetId } from "../lib/profile-photo.js";
import {
  generateOptimizedCv,
  getOptimizedCv,
  readOptimizedCvPhoto,
  saveOptimizedCv,
} from "../services/optimized-cv.service.js";
import { validateSupportedLocale } from "../types/supported-locale.js";
import { sendErrorResponse } from "./error-response.js";

function photoAssetIdQuery(request: Request): string | null {
  const value = request.query.assetId;
  if (typeof value !== "string" || value === "") {
    return null;
  }
  return isAssetId(value) ? value : null;
}

export async function createOptimizedCv(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const locale = validateSupportedLocale(request.body?.locale);
    const optimizedCv = await generateOptimizedCv(
      request.params.id,
      request.authenticatedUser!.id,
      locale,
    );
    response.status(200).json({ optimizedCv });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function showOptimizedCv(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const optimizedCv = await getOptimizedCv(
      request.params.id,
      request.authenticatedUser!.id,
    );
    response.status(200).json({ optimizedCv });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function replaceOptimizedCv(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const optimizedCv = await saveOptimizedCv(
      request.params.id,
      request.authenticatedUser!.id,
      request.body,
    );
    response.status(200).json({ optimizedCv });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function showOptimizedCvPhoto(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const photo = await readOptimizedCvPhoto(
      request.params.id,
      request.authenticatedUser!.id,
      photoAssetIdQuery(request),
    );
    response.setHeader("Content-Type", photo.contentType);
    response.setHeader("Cache-Control", "private, no-store");
    response.status(200).send(photo.bytes);
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
