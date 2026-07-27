import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, signInWithGoogle } from "../services/auth";
import type { AuthenticatedUser } from "../types/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    void getCurrentUser()
      .then((response) => {
        if (isActive) {
          setUser(response?.user ?? null);
        }
      })
      .catch(() => {
        if (isActive) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const signIn = useCallback(async () => {
    const response = await signInWithGoogle();
    setUser(response.user);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn }),
    [isLoading, signIn, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
