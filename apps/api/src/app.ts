import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { getFrontendOrigin, isProduction } from "./config/environment.js";
import { applicationRouter } from "./routes/application.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { masterCvRouter } from "./routes/master-cv.routes.js";

export const app = express();

app.disable("x-powered-by");

if (isProduction()) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigin = getFrontendOrigin();
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
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

const unhandledErrorHandler: ErrorRequestHandler = (
  _error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(_error);
    return;
  }

  console.error("Unhandled API error");
  response.status(500).json({ message: "Internal server error." });
};

app.use(unhandledErrorHandler);
