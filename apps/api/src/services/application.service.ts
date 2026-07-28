import {
  createApplication as insertApplication,
  deleteApplicationByIdForUser,
  findApplicationByIdForUser,
  findApplicationsByUserId,
} from "../repositories/application.repository.js";

export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getOwnedApplication(
  applicationId: string,
  userId: string,
) {
  if (!UUID_PATTERN.test(applicationId)) {
    throw new ApplicationError("Application not found.", 404);
  }
  const application = await findApplicationByIdForUser(applicationId, userId);
  if (!application) {
    throw new ApplicationError("Application not found.", 404);
  }
  return application;
}

export function addApplication(userId: string) {
  return insertApplication(userId);
}

export function listApplications(userId: string) {
  return findApplicationsByUserId(userId);
}

export function getApplication(applicationId: string, userId: string) {
  return getOwnedApplication(applicationId, userId);
}

export async function removeApplication(
  applicationId: string,
  userId: string,
): Promise<void> {
  if (!UUID_PATTERN.test(applicationId)) {
    throw new ApplicationError("Application not found.", 404);
  }
  const result = await deleteApplicationByIdForUser(applicationId, userId);
  if (result.count === 0) {
    throw new ApplicationError("Application not found.", 404);
  }
}
