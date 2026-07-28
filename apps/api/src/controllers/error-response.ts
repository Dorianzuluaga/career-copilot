import type { Response } from "express";

interface StatusError extends Error {
  statusCode: number;
}

function isStatusError(error: unknown): error is StatusError {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  );
}

export function sendErrorResponse(error: unknown, response: Response): void {
  if (isStatusError(error)) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  response.status(500).json({ message: "Internal server error." });
}
