import cors from "cors";
import express from "express";
import { applicationRouter } from "./routes/application.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { masterCvRouter } from "./routes/master-cv.routes.js";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/master-cv", masterCvRouter);
app.use("/api/applications", applicationRouter);
