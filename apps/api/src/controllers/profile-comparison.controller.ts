import type { Request, Response } from "express";
import {
  compareProfiles,
  getProfileComparison,
} from "../services/profile-comparison.service.js";
import { presentProfileMatch } from "../services/profile-match-presentation.service.js";
import { validateSupportedLocale } from "../types/supported-locale.js";
import { sendErrorResponse } from "./error-response.js";

export async function prepareProfileComparison(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const locale = validateSupportedLocale(request.body?.locale);
    const comparison = await compareProfiles(
      request.params.id,
      request.authenticatedUser!.id,
      locale,
    );
    response.status(200).json(comparison);
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function showProfileComparison(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const comparison = await getProfileComparison(
      request.params.id,
      request.authenticatedUser!.id,
    );
    response.status(200).json(comparison);
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function presentProfileComparison(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const locale = validateSupportedLocale(request.body?.locale);
    const presentation = await presentProfileMatch(
      request.params.id,
      request.authenticatedUser!.id,
      locale,
    );
    response.status(200).json(presentation);
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
