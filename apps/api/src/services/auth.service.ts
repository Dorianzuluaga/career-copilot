import { randomBytes } from "node:crypto";
import type { User } from "../../generated/prisma/index.js";
import { firebaseAuth } from "../lib/firebase-admin.js";
import {
  createUserSession,
  deleteUserSession,
  findUserBySessionId,
} from "../repositories/auth.repository.js";

export const SESSION_COOKIE_NAME = "career_copilot_session";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthenticationError extends Error {}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

function toAuthenticatedUser(user: User): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
}

export async function authenticateWithGoogle(
  idToken: string,
): Promise<{ sessionId: string; user: AuthenticatedUser }> {
  let decodedToken;

  try {
    decodedToken = await firebaseAuth.verifyIdToken(idToken);
  } catch {
    throw new AuthenticationError("Invalid identity token.");
  }

  if (!decodedToken.sub || !decodedToken.email || !decodedToken.name) {
    throw new AuthenticationError("Required Google profile data is missing.");
  }

  const sessionId = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const user = await createUserSession(
    {
      googleSub: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name,
      avatar: decodedToken.picture ?? null,
    },
    sessionId,
    expiresAt,
  );

  return { sessionId, user: toAuthenticatedUser(user) };
}

export async function getAuthenticatedUser(
  sessionId: string,
): Promise<AuthenticatedUser | null> {
  const user = await findUserBySessionId(sessionId);

  return user ? toAuthenticatedUser(user) : null;
}

export async function logout(sessionId: string): Promise<void> {
  await deleteUserSession(sessionId);
}
