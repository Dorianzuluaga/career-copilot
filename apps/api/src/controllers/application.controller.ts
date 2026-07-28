import type { Request, Response } from "express";
import {
  addApplication,
  getApplication,
  listApplications,
  removeApplication,
} from "../services/application.service.js";
import { sendErrorResponse } from "./error-response.js";

function userId(request: Request): string {
  return request.authenticatedUser!.id;
}

export async function createApplication(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const application = await addApplication(userId(request));
    response.status(201).json({ application });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function indexApplications(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const applications = await listApplications(userId(request));
    response.status(200).json({ applications });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function showApplication(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const application = await getApplication(
      request.params.id,
      userId(request),
    );
    response.status(200).json({ application });
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function deleteApplication(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    await removeApplication(request.params.id, userId(request));
    response.status(204).send();
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
