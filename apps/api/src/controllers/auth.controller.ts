import type { Request, Response } from "express";
import {
  authenticateWithGoogle,
  AuthenticationError,
  getAuthenticatedUser,
  logout as logoutSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "../services/auth.service.js";

const authenticationFailure = {
  authenticated: false,
  message: "Authentication failed.",
} as const;

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = cookie.trim().split("=");

    if (cookieName === name) {
      try {
        return decodeURIComponent(valueParts.join("="));
      } catch {
        return null;
      }
    }
  }

  return null;
}

export async function googleAuthentication(
  request: Request,
  response: Response,
): Promise<void> {
  const idToken = request.body?.idToken;

  if (typeof idToken !== "string" || idToken.trim() === "") {
    response.status(401).json(authenticationFailure);
    return;
  }

  try {
    const { sessionId, user } = await authenticateWithGoogle(idToken);

    response.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS,
      path: "/",
    });
    response.status(200).json({ authenticated: true, user });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      response.status(401).json(authenticationFailure);
      return;
    }

    response.status(500).json({ message: "Internal server error." });
  }
}

export async function currentUser(
  request: Request,
  response: Response,
): Promise<void> {
  const sessionId = getCookie(request, SESSION_COOKIE_NAME);

  if (!sessionId) {
    response.status(401).json(authenticationFailure);
    return;
  }

  try {
    const user = await getAuthenticatedUser(sessionId);

    if (!user) {
      response.status(401).json(authenticationFailure);
      return;
    }

    response.status(200).json({ authenticated: true, user });
  } catch {
    response.status(500).json({ message: "Internal server error." });
  }
}

export async function logout(
  request: Request,
  response: Response,
): Promise<void> {
  const sessionId = getCookie(request, SESSION_COOKIE_NAME);

  try {
    if (sessionId) {
      await logoutSession(sessionId);
    }

    response.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    response.status(200).json({ authenticated: false });
  } catch {
    response.status(500).json({ message: "Internal server error." });
  }
}
