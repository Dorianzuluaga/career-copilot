import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import sharp from "sharp";
import { CoverLetterPdfDocument } from "../documents/cover-letter.document.js";
import {
  buildOptimizedCvHeaderModel,
  OPTIMIZED_CV_HEADER_PDF_VIGNETTE_EDGE_OPACITY,
  OPTIMIZED_CV_HEADER_PDF_VIGNETTE_MIDPOINT,
  OPTIMIZED_CV_HEADER_PDF_VIGNETTE_MIDPOINT_OPACITY,
  OPTIMIZED_CV_HEADER_PDF_VIGNETTE_RADIUS,
  OPTIMIZED_CV_HEADER_PDF_VIGNETTE_START,
} from "../documents/optimized-cv-header.js";
import { OptimizedCvPdfDocument } from "../documents/optimized-cv.document.js";
import { detectProfilePhotoMime } from "../lib/profile-photo.js";
import type { CoverLetter } from "../types/cover-letter.js";
import type { OptimizedCv } from "../types/optimized-cv.js";

export type DocumentFormat = "pdf";

export type RenderableDocument =
  | {
      type: "optimized-cv";
      data: OptimizedCv;
      profilePhotoBytes?: Buffer | null;
    }
  | { type: "cover-letter"; data: CoverLetter };

export class DocumentRenderingError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export async function toPdfProfilePhotoSource(
  bytes: Buffer,
  positionX = 50,
  positionY = 50,
): Promise<string> {
  const mime = detectProfilePhotoMime(bytes);
  if (mime === null) {
    throw new DocumentRenderingError(
      "The profile photo could not be rendered.",
      500,
    );
  }

  const normalized = await sharp(bytes)
    .rotate()
    .toBuffer({ resolveWithObject: true });
  const cropSize = Math.min(normalized.info.width, normalized.info.height);
  const left = Math.round(
    (normalized.info.width - cropSize) * (positionX / 100),
  );
  const top = Math.round(
    (normalized.info.height - cropSize) * (positionY / 100),
  );
  const edgeMask = Buffer.from(`
    <svg width="${cropSize}" height="${cropSize}">
      <defs>
        <radialGradient id="edge-mask" cx="50%" cy="50%" r="${OPTIMIZED_CV_HEADER_PDF_VIGNETTE_RADIUS}%">
          <stop offset="${OPTIMIZED_CV_HEADER_PDF_VIGNETTE_START}%" stop-color="white" stop-opacity="1" />
          <stop offset="${OPTIMIZED_CV_HEADER_PDF_VIGNETTE_MIDPOINT}%" stop-color="white" stop-opacity="${1 - OPTIMIZED_CV_HEADER_PDF_VIGNETTE_MIDPOINT_OPACITY}" />
          <stop offset="${OPTIMIZED_CV_HEADER_PDF_VIGNETTE_MIDPOINT}%" stop-color="white" stop-opacity="${1 - OPTIMIZED_CV_HEADER_PDF_VIGNETTE_EDGE_OPACITY}" />
          <stop offset="100%" stop-color="white" stop-opacity="${1 - OPTIMIZED_CV_HEADER_PDF_VIGNETTE_EDGE_OPACITY}" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#edge-mask)" />
    </svg>
  `);
  const png = await sharp(normalized.data)
    .extract({ left, top, width: cropSize, height: cropSize })
    .ensureAlpha()
    .composite([{ input: edgeMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${png.toString("base64")}`;
}

export async function renderDocument(
  document: RenderableDocument,
  format: DocumentFormat = "pdf",
): Promise<Buffer> {
  if (format !== "pdf") {
    throw new DocumentRenderingError("Unsupported document format.", 400);
  }
  if (
    document.type === "optimized-cv" &&
    document.data.profilePhotoAssetId &&
    !document.profilePhotoBytes
  ) {
    throw new DocumentRenderingError(
      "The profile photo could not be rendered.",
      500,
    );
  }

  const header =
    document.type === "optimized-cv"
      ? buildOptimizedCvHeaderModel(document.data)
      : null;
  const profilePhotoSrc =
    document.type === "optimized-cv" && document.profilePhotoBytes
      ? await toPdfProfilePhotoSource(
          document.profilePhotoBytes,
          header?.photo?.positionX,
          header?.photo?.positionY,
        )
      : null;

  const element = (
    document.type === "optimized-cv"
      ? createElement(OptimizedCvPdfDocument, {
          cv: document.data,
          profilePhotoSrc,
        })
      : createElement(CoverLetterPdfDocument, {
          coverLetter: document.data,
        })
  ) as ReactElement<DocumentProps>;

  return renderToBuffer(element);
}
