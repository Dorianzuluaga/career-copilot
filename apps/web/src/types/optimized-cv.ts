import type { MasterCvInput } from "./master-cv";

export type OptimizedCv = MasterCvInput & {
  profilePhotoAssetId?: string | null;
  profilePhotoPositionX?: number | null;
  profilePhotoPositionY?: number | null;
};
