export type OptimizedCvHeaderContactKind =
  "phone" | "email" | "location" | "linkedin" | "website";

export type OptimizedCvHeaderContactItem = {
  kind: OptimizedCvHeaderContactKind;
  value: string;
};

export type OptimizedCvHeaderModel = {
  fullName: string;
  professionalTitle: string | null;
  phoneEmail: OptimizedCvHeaderContactItem[];
  locationLinkedin: OptimizedCvHeaderContactItem[];
  website: OptimizedCvHeaderContactItem | null;
  photo: { assetId: string; positionX: number; positionY: number } | null;
};

export type OptimizedCvHeaderInput = {
  fullName: string;
  professionalTitle?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  website?: string | null;
  profilePhotoAssetId?: string | null;
  profilePhotoPositionX?: number | null;
  profilePhotoPositionY?: number | null;
};

export const OPTIMIZED_CV_HEADER_PDF_PHOTO_SIZE = 84;
export const OPTIMIZED_CV_HEADER_PDF_PHOTO_TRAILING_INSET = 50;
export const OPTIMIZED_CV_HEADER_PREVIEW_PHOTO_LEFT_SHIFT = 4;
export const OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_START = 125;
export const OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_MIDPOINT = 130;
export const OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_MIDPOINT_OPACITY = 0.05;
export const OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_EDGE_OPACITY = 0.99;
export const CSS_PIXELS_PER_PDF_POINT = 96 / 72;
export const OPTIMIZED_CV_HEADER_PHOTO_SIZE =
  OPTIMIZED_CV_HEADER_PDF_PHOTO_SIZE * CSS_PIXELS_PER_PDF_POINT;
export const OPTIMIZED_CV_HEADER_PHOTO_TRAILING_INSET =
  OPTIMIZED_CV_HEADER_PDF_PHOTO_TRAILING_INSET * CSS_PIXELS_PER_PDF_POINT +
  OPTIMIZED_CV_HEADER_PREVIEW_PHOTO_LEFT_SHIFT;
export const OPTIMIZED_CV_HEADER_PHOTO_DEFAULT_POSITION = 50;

export function getOptimizedCvHeaderPhotoFrameStyle() {
  return {
    width: OPTIMIZED_CV_HEADER_PHOTO_SIZE,
    height: OPTIMIZED_CV_HEADER_PHOTO_SIZE,
    marginRight: OPTIMIZED_CV_HEADER_PHOTO_TRAILING_INSET,
    position: "relative" as const,
  };
}

export function getOptimizedCvHeaderPhotoImageStyle(
  photo: NonNullable<OptimizedCvHeaderModel["photo"]>,
) {
  return {
    width: "100%",
    height: "100%",
    objectPosition: `${photo.positionX}% ${photo.positionY}%`,
  };
}

export function getOptimizedCvHeaderPhotoEdgeMaskStyle() {
  const maskImage = `radial-gradient(circle closest-side at center, rgb(0 0 0 / 1) ${OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_START}%, rgb(0 0 0 / ${1 - OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_MIDPOINT_OPACITY}) ${OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_MIDPOINT}%, rgb(0 0 0 / ${1 - OPTIMIZED_CV_HEADER_PHOTO_VIGNETTE_EDGE_OPACITY}) 100%)`;

  return {
    maskImage,
    WebkitMaskImage: maskImage,
  };
}

export function hasHeaderText(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function contactItem(
  kind: OptimizedCvHeaderContactKind,
  value: string | null | undefined,
): OptimizedCvHeaderContactItem | null {
  return hasHeaderText(value) ? { kind, value } : null;
}

function photoPosition(value: number | null | undefined): number {
  return Number.isInteger(value) && value! >= 0 && value! <= 100
    ? value!
    : OPTIMIZED_CV_HEADER_PHOTO_DEFAULT_POSITION;
}

export function buildOptimizedCvHeaderModel(
  cv: OptimizedCvHeaderInput,
): OptimizedCvHeaderModel {
  const assetId = cv.profilePhotoAssetId;
  return {
    fullName: cv.fullName,
    professionalTitle: hasHeaderText(cv.professionalTitle)
      ? cv.professionalTitle
      : null,
    phoneEmail: [
      contactItem("phone", cv.phone),
      contactItem("email", cv.email),
    ].filter((item): item is OptimizedCvHeaderContactItem => item !== null),
    locationLinkedin: [
      contactItem("location", cv.location),
      contactItem("linkedin", cv.linkedin),
    ].filter((item): item is OptimizedCvHeaderContactItem => item !== null),
    website: contactItem("website", cv.website),
    photo:
      typeof assetId === "string" && assetId.trim().length > 0
        ? {
            assetId,
            positionX: photoPosition(cv.profilePhotoPositionX),
            positionY: photoPosition(cv.profilePhotoPositionY),
          }
        : null,
  };
}

export function getOptimizedCvHeaderStructure(
  model: OptimizedCvHeaderModel,
): string[] {
  const structure = ["fullName"];
  if (model.professionalTitle !== null) {
    structure.push("professionalTitle");
  }
  if (model.phoneEmail.length > 0) {
    structure.push("phoneEmail");
  }
  if (model.locationLinkedin.length > 0) {
    structure.push("locationLinkedin");
  }
  if (model.website !== null) {
    structure.push("website");
  }
  return structure;
}

/** Shared local SVG path data. Preview and PDF must keep these identical. */
export const OPTIMIZED_CV_HEADER_ICON_PATHS: Record<
  OptimizedCvHeaderContactKind,
  string[]
> = {
  phone: [
    "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z",
  ],
  email: [
    "M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z",
    "M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z",
  ],
  location: [
    "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
  ],
  linkedin: [
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  ],
  website: [
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  ],
};
