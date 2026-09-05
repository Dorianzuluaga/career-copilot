import type { Request, Response } from "express";
import {
  exportApplicationDocument,
  previewExportDocument,
  validateExportDocumentType,
  validatePresentationLanguage,
} from "../services/export.service.js";
import { sendErrorResponse } from "./error-response.js";

function readExportRequest(body: unknown): {
  documentType: ReturnType<typeof validateExportDocumentType>;
  presentationLanguage: ReturnType<typeof validatePresentationLanguage>;
} {
  const payload =
    body && typeof body === "object"
      ? (body as { document?: unknown; presentationLanguage?: unknown })
      : {};

  return {
    documentType: validateExportDocumentType(payload.document),
    presentationLanguage: validatePresentationLanguage(
      payload.presentationLanguage,
    ),
  };
}

export async function createExport(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const { documentType, presentationLanguage } = readExportRequest(
      request.body,
    );
    const exported = await exportApplicationDocument(
      request.params.id,
      request.authenticatedUser!.id,
      documentType,
      presentationLanguage,
    );

    response.setHeader("Content-Type", exported.contentType);
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${exported.filename}"`,
    );
    response.status(200).send(exported.buffer);
  } catch (error) {
    sendErrorResponse(error, response);
  }
}

export async function createExportPreview(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const { documentType, presentationLanguage } = readExportRequest(
      request.body,
    );
    const preview = await previewExportDocument(
      request.params.id,
      request.authenticatedUser!.id,
      documentType,
      presentationLanguage,
    );
    response.status(200).json(preview);
  } catch (error) {
    sendErrorResponse(error, response);
  }
}
