import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const LOGIN_ERROR_MESSAGE = "Unable to sign in. Please try again.";

export function LoginPage() {
  const { user, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignIn() {
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      await signIn();
      navigate("/dashboard", { replace: true });
    } catch {
      setErrorMessage(LOGIN_ERROR_MESSAGE);
    } finally {
      setIsSigningIn(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Restoring your session…
      </main>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-center text-xl font-bold tracking-tight text-slate-950">
          Career Copilot
        </p>
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Welcome
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in to organize and improve your job applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleSignIn()}
          disabled={isSigningIn}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.98-.9 6.64-2.35L15.4 17.1a6.02 6.02 0 0 1-8.96-3.17H3.1v2.63A10 10 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.44 13.93A6 6 0 0 1 6.13 12c0-.67.12-1.32.31-1.93V7.44H3.1A10 10 0 0 0 2 12c0 1.64.4 3.19 1.1 4.56l3.34-2.63Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.02c1.47 0 2.78.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.9 5.44l3.34 2.63A5.96 5.96 0 0 1 12 6.02Z"
            />
          </svg>
          {isSigningIn ? "Signing in…" : "Continue with Google"}
        </button>

        {errorMessage ? (
          <p role="alert" className="mt-4 text-center text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}
