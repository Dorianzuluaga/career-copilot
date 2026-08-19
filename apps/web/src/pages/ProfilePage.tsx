import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      setErrorMessage("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div>
        <p className="cc-kicker">Account</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted">
          Your Google account information used to sign in to Career Copilot.
        </p>
      </div>

      <div className="cc-card mt-8 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-lg font-semibold text-muted"
            >
              {user.name.trim().charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-ink">{user.name}</p>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <Detail label="Full name" value={user.name} />
          <Detail label="Email" value={user.email} />
          <Detail label="Authentication provider" value="Google" />
        </dl>

        <div className="mt-8 border-t border-line pt-6">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="cc-btn-secondary"
          >
            {isSigningOut ? "Signing out…" : "Log out"}
          </button>

          {errorMessage ? (
            <p role="alert" className="mt-4 text-sm font-medium text-danger">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
