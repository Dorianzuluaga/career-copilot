import type { Request, Response } from "express";
import { compareProfiles } from "../services/profile-comparison.service.js";
import { sendErrorResponse } from "./error-response.js";

export async function prepareProfileComparison(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const comparison = await compareProfiles(
      request.params.id,
      request.authenticatedUser!.id,
    );
    response.status(200).json(comparison);
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
