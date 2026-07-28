import {
  createJobOffer,
  findJobOfferByApplicationId,
} from "../repositories/job-offer.repository.js";
import { getOwnedApplication } from "./application.service.js";

const MIN_DESCRIPTION_LENGTH = 300;
const MAX_DESCRIPTION_LENGTH = 25_000;

function hasUnsupportedControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return (
      (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127
    );
  });
}

export class JobOfferError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export function validateJobDescription(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new JobOfferError("Job description is required.", 400);
  }
  if (value.length < MIN_DESCRIPTION_LENGTH) {
    throw new JobOfferError("The job description is too short.", 400);
  }
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    throw new JobOfferError(
      "The job description exceeds the maximum allowed length.",
      400,
    );
  }
  if (hasUnsupportedControlCharacters(value)) {
    throw new JobOfferError("Job description must be plain text.", 400);
  }
  return value;
}

export async function addJobOffer(
  applicationId: string,
  userId: string,
  value: unknown,
) {
  await getOwnedApplication(applicationId, userId);
  if (await findJobOfferByApplicationId(applicationId)) {
    throw new JobOfferError(
      "The original job offer has already been saved.",
      409,
    );
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new JobOfferError("Job description is required.", 400);
  }
  const input = value as Record<string, unknown>;
  return createJobOffer(
    applicationId,
    validateJobDescription(input.originalDescription),
  );
}
