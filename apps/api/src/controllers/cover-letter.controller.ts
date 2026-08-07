import type { Request, Response } from "express";
import {
  generateCoverLetter,
  getCoverLetter,
  saveCoverLetter,
} from "../services/cover-letter.service.js";
import { sendErrorResponse } from "./error-response.js";

export async function createCoverLetter(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const coverLetter = await generateCoverLetter(
      request.params.id,
      request.authenticatedUser!.id,
    );
    response.status(200).json({ coverLetter });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function showCoverLetter(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const coverLetter = await getCoverLetter(
      request.params.id,
      request.authenticatedUser!.id,
    );
    response.status(200).json({ coverLetter });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function replaceCoverLetter(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const coverLetter = await saveCoverLetter(
      request.params.id,
      request.authenticatedUser!.id,
      request.body,
    );
    response.status(200).json({ coverLetter });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
