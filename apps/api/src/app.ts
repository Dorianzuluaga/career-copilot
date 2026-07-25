import express from "express";

export const app = express();

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});
