import { Router } from "express";
import {
  currentUser,
  googleAuthentication,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/google", googleAuthentication);
authRouter.get("/me", currentUser);
