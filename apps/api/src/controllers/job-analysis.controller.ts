import type { Request, Response } from "express";
import { analyzeJobOffer } from "../services/job-analysis.service.js";
import { validateSupportedLocale } from "../types/supported-locale.js";
import { sendErrorResponse } from "./error-response.js";

export async function createJobAnalysis(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const locale = validateSupportedLocale(request.body?.locale);
    const jobAnalysis = await analyzeJobOffer(
      request.params.id,
      request.authenticatedUser!.id,
      locale,
    );
    response.status(200).json({ jobAnalysis });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
