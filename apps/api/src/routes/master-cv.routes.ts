import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { Router } from "express";
import multer from "multer";
import {
  PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TOO_LARGE_MESSAGE,
  isAllowedProfilePhotoMime,
} from "../lib/profile-photo.js";
import {
  createMasterCv,
  deleteMasterCvPhoto,
  patchMasterCvPhoto,
  putMasterCvPhoto,
  replaceMasterCv,
  showMasterCv,
  showMasterCvPhoto,
  uploadMasterCv,
} from "../controllers/master-cv.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

const MAX_PDF_SIZE = 10 * 1024 * 1024;
const upload = multer({
  storage: multer.diskStorage({
    destination: tmpdir(),
    filename: (_request, _file, callback) => {
      callback(null, `career-copilot-cv-${randomUUID()}.pdf`);
    },
  }),
  limits: { fileSize: MAX_PDF_SIZE, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new Error("Only PDF files are supported."));
      return;
    }
    callback(null, true);
  },
});

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: tmpdir(),
    filename: (_request, _file, callback) => {
      callback(null, `career-copilot-photo-${randomUUID()}`);
    },
  }),
  limits: { fileSize: PROFILE_PHOTO_MAX_BYTES, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!isAllowedProfilePhotoMime(file.mimetype)) {
      callback(new Error(PROFILE_PHOTO_INVALID_TYPE_MESSAGE));
      return;
    }
    callback(null, true);
  },
});

export const masterCvRouter = Router();

masterCvRouter.use(requireAuth);
masterCvRouter.get("/", showMasterCv);
masterCvRouter.post("/", createMasterCv);
masterCvRouter.put("/", replaceMasterCv);
masterCvRouter.put("/photo", (request, response) => {
  photoUpload.single("file")(request, response, (error: unknown) => {
    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      response.status(400).json({ message: PROFILE_PHOTO_TOO_LARGE_MESSAGE });
      return;
    }
    if (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : PROFILE_PHOTO_INVALID_TYPE_MESSAGE,
      });
      return;
    }
    void putMasterCvPhoto(request, response);
  });
});
masterCvRouter.patch("/photo", patchMasterCvPhoto);
masterCvRouter.delete("/photo", deleteMasterCvPhoto);
masterCvRouter.get("/photo", showMasterCvPhoto);
masterCvRouter.post("/upload", (request, response) => {
  upload.single("file")(request, response, (error: unknown) => {
    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      response.status(400).json({ message: "Maximum file size is 10 MB." });
      return;
    }
    if (error) {
      response.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Only PDF files are supported.",
      });
      return;
    }
    void uploadMasterCv(request, response);
  });
});
