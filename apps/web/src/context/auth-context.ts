import { createContext } from "react";
import type { AuthenticatedUser } from "../types/auth";

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
