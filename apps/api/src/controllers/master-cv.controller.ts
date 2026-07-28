import { readFile, unlink } from "node:fs/promises";
import type { Request, Response } from "express";
import { extractMasterCv } from "../services/master-cv-extraction.service.js";
import {
  addMasterCv,
  editMasterCv,
  getMasterCv,
  MasterCvError,
} from "../services/master-cv.service.js";

function userId(request: Request): string {
  return request.authenticatedUser!.id;
}

function handleError(error: unknown, response: Response): void {
  if (error instanceof MasterCvError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  response.status(500).json({ message: "Internal server error." });
}

export async function showMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    response.status(200).json({ masterCv: await getMasterCv(userId(request)) });
  } catch (error) {
    handleError(error, response);
  }
}

export async function createMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const masterCv = await addMasterCv(userId(request), request.body);
    response.status(201).json({ masterCv });
  } catch (error) {
    handleError(error, response);
  }
}

export async function replaceMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const masterCv = await editMasterCv(userId(request), request.body);
    response.status(200).json({ masterCv });
  } catch (error) {
    handleError(error, response);
  }
}

export async function uploadMasterCv(
  request: Request,
  response: Response,
): Promise<void> {
  const file = request.file;
  if (!file) {
    response.status(400).json({ message: "A PDF file is required." });
    return;
  }

  let result: Awaited<ReturnType<typeof extractMasterCv>> | null = null;
  let errorResponse: { status: number; message: string } | null = null;

  try {
    if (file.size === 0) {
      errorResponse = { status: 400, message: "The uploaded file is empty." };
    } else {
      const contents = await readFile(file.path);
      if (!contents.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
        errorResponse = {
          status: 400,
          message: "Only PDF files are supported.",
        };
      } else {
        result = await extractMasterCv(file.path, file.originalname);
      }
    }
  } catch {
    errorResponse = {
      status: 422,
      message: "We couldn't extract your CV automatically.",
    };
  }

  try {
    await unlink(file.path);
  } catch {
    response.status(500).json({ message: "Internal server error." });
    return;
  }

  if (errorResponse) {
    response
      .status(errorResponse.status)
      .json({ message: errorResponse.message });
    return;
  }

  response.status(200).json(result);
}
