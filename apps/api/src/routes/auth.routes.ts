import { Router } from "express";
import {
  currentUser,
  googleAuthentication,
  logout,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/google", googleAuthentication);
authRouter.get("/me", currentUser);
authRouter.post("/logout", logout);
