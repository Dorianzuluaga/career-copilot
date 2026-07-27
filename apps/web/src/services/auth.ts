import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase";
import type { AuthenticationResponse } from "../types/auth";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function readAuthenticationResponse(
  response: Response,
): Promise<AuthenticationResponse> {
  if (!response.ok) {
    throw new Error("Authentication failed.");
  }

  return (await response.json()) as AuthenticationResponse;
}

export async function signInWithGoogle(): Promise<AuthenticationResponse> {
  const credential = await signInWithPopup(
    firebaseAuth,
    new GoogleAuthProvider(),
  );
  const idToken = await credential.user.getIdToken();
  const response = await fetch(`${apiUrl}/api/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  const authentication = await readAuthenticationResponse(response);

  await signOut(firebaseAuth);

  return authentication;
}

export async function getCurrentUser(): Promise<AuthenticationResponse | null> {
  const response = await fetch(`${apiUrl}/api/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  return readAuthenticationResponse(response);
}
