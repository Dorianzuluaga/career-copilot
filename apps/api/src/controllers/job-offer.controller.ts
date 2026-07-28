import type { Request, Response } from "express";
import { addJobOffer } from "../services/job-offer.service.js";
import { sendErrorResponse } from "./error-response.js";

export async function createJobOffer(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const jobOffer = await addJobOffer(
      request.params.id,
      request.authenticatedUser!.id,
      request.body,
    );
    response.status(201).json({ jobOffer });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
