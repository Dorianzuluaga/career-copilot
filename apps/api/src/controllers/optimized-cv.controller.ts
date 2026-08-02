import type { Request, Response } from "express";
import { generateOptimizedCv } from "../services/optimized-cv.service.js";
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
