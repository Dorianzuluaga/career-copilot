import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { CoverLetterPdfDocument } from "../documents/cover-letter.document.js";
import { OptimizedCvPdfDocument } from "../documents/optimized-cv.document.js";
import type { CoverLetter } from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";

export type DocumentFormat = "pdf";

export type RenderableDocument =
  | { type: "optimized-cv"; data: OptimizedCv }
  | { type: "cover-letter"; data: CoverLetter };

export class DocumentRenderingError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export async function renderDocument(
  document: RenderableDocument,
  format: DocumentFormat = "pdf",
): Promise<Buffer> {
  if (format !== "pdf") {
    throw new DocumentRenderingError("Unsupported document format.", 400);
  }

  const element = (
    document.type === "optimized-cv"
      ? createElement(OptimizedCvPdfDocument, { cv: document.data })
      : createElement(CoverLetterPdfDocument, {
          coverLetter: document.data,
        })
  ) as ReactElement<DocumentProps>;

  return renderToBuffer(element);
}
