import { Outlet } from "react-router";
import { GuardedLink } from "../context/UnsavedChangesGuardProvider";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <GuardedLink
            to="/"
            className="text-lg font-bold tracking-tight text-slate-950"
          >
            Career Copilot
          </GuardedLink>
          <nav className="flex items-center gap-5">
            <GuardedLink
              to="/master-cv"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Master CV
            </GuardedLink>
            <GuardedLink
              to="/dashboard"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Dashboard
            </GuardedLink>
            <GuardedLink
              to="/profile"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Profile
            </GuardedLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
          Career Copilot
        </div>
      </footer>
    </div>
  );
}
