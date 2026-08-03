import { Router } from "express";
import {
  createApplication,
  deleteApplication,
  indexApplications,
  showApplication,
} from "../controllers/application.controller.js";
import { createJobAnalysis } from "../controllers/job-analysis.controller.js";
import { createJobOffer } from "../controllers/job-offer.controller.js";
import {
  createOptimizedCv,
  replaceOptimizedCv,
  showOptimizedCv,
} from "../controllers/optimized-cv.controller.js";
import { prepareProfileComparison } from "../controllers/profile-comparison.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

export const applicationRouter = Router();

applicationRouter.use(requireAuth);
applicationRouter.post("/", createApplication);
applicationRouter.get("/", indexApplications);
applicationRouter.get("/:id", showApplication);
applicationRouter.delete("/:id", deleteApplication);
applicationRouter.post("/:id/job-offer", createJobOffer);
applicationRouter.post("/:id/job-analysis", createJobAnalysis);
applicationRouter.post("/:id/profile-comparison", prepareProfileComparison);
applicationRouter.post("/:id/optimized-cv", createOptimizedCv);
applicationRouter.get("/:id/optimized-cv", showOptimizedCv);
applicationRouter.put("/:id/optimized-cv", replaceOptimizedCv);
