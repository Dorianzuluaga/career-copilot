import type { Request, Response } from "express";
import {
  generateOptimizedCv,
  getOptimizedCv,
  saveOptimizedCv,
} from "../services/optimized-cv.service.js";
import { sendErrorResponse } from "./error-response.js";

export async function createOptimizedCv(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const optimizedCv = await generateOptimizedCv(
      request.params.id,
      request.authenticatedUser!.id,
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
