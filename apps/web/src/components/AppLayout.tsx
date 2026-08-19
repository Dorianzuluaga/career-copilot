import type { SVGProps } from "react";
import { Outlet, useLocation } from "react-router";
import { GuardedLink } from "../context/UnsavedChangesGuardProvider";

function headerLinkClass(isActive: boolean): string {
  return isActive
    ? "rounded-md bg-navy-hover px-3 py-2 text-sm font-semibold text-white"
    : "rounded-md px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-navy-hover hover:text-white";
}

function sidebarLinkClass(isActive: boolean): string {
  return isActive
    ? "flex items-center gap-3 rounded-lg border-l-[3px] border-brand bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand"
    : "flex items-center gap-3 rounded-lg border-l-[3px] border-transparent px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-canvas hover:text-ink";
}

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M4 4.75h6.5v6.5H4v-6.5Zm9.5 0H20v4h-6.5v-4ZM4 13.75h6.5V20H4v-6.25Zm9.5-2H20V20h-6.5V11.75Z"
      />
    </svg>
  );
}

function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M7 3.75h6.25L19 9.5V20.25a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M13.25 3.75V8.5H19M8.5 12.5h7M8.5 16.25h5"
      />
    </svg>
  );
}

const mainNavItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    to: "/master-cv",
    label: "Master CV",
    icon: DocumentIcon,
    isActive: (pathname: string) =>
      pathname === "/master-cv" || pathname.startsWith("/onboarding/master-cv"),
  },
] as const;

export function AppLayout() {
  const { pathname } = useLocation();
  const isProfileActive = pathname === "/profile";

  return (
    <div className="grid min-h-screen grid-cols-1 bg-canvas text-ink lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
      <header className="border-b border-navy-hover bg-navy lg:col-span-2">
        <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <GuardedLink
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"
          >
            <img
              src="/logo-career-copilot.png"
              alt=""
              className="h-10 w-auto shrink-0"
            />
            Career Copilot
          </GuardedLink>
          <nav aria-label="Account" className="ml-auto flex items-center gap-1">
            {mainNavItems.map((item) => (
              <GuardedLink
                key={item.to}
                to={item.to}
                aria-current={item.isActive(pathname) ? "page" : undefined}
                className={`lg:hidden ${headerLinkClass(item.isActive(pathname))}`}
              >
                {item.label}
              </GuardedLink>
            ))}
            <GuardedLink
              to="/profile"
              aria-current={isProfileActive ? "page" : undefined}
              className={headerLinkClass(isProfileActive)}
            >
              Profile
            </GuardedLink>
          </nav>
        </div>
      </header>

      <aside className="hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <nav aria-label="Main" className="px-3 py-6">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            MAIN
          </p>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = item.isActive(pathname);
              const Icon = item.icon;

              return (
                <li key={item.to}>
                  <GuardedLink
                    to={item.to}
                    aria-current={isActive ? "page" : undefined}
                    className={sidebarLinkClass(isActive)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </GuardedLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 text-sm text-muted sm:px-6 lg:px-8">
            Career Copilot
          </div>
        </footer>
      </div>
    </div>
  );
}
