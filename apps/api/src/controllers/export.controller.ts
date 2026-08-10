import type { Request, Response } from "express";
import {
  exportApplicationDocument,
  validateExportDocumentType,
} from "../services/export.service.js";
import { sendErrorResponse } from "./error-response.js";

export async function createExport(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    const documentType = validateExportDocumentType(request.body?.document);
    const exported = await exportApplicationDocument(
      request.params.id,
      request.authenticatedUser!.id,
      documentType,
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
