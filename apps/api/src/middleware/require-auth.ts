import type { NextFunction, Request, Response } from "express";
import {
  getAuthenticatedUser,
  SESSION_COOKIE_NAME,
} from "../services/auth.service.js";

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = cookie.trim().split("=");
    if (cookieName !== name) continue;

    try {
      return decodeURIComponent(valueParts.join("="));
    } catch {
      return null;
    }
  }
  return null;
}

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const sessionId = getCookie(request, SESSION_COOKIE_NAME);
  if (!sessionId) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const user = await getAuthenticatedUser(sessionId);
    if (!user) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    request.authenticatedUser = user;
    next();
  } catch {
    response.status(500).json({ message: "Internal server error." });
  }
}
