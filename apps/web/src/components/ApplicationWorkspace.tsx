import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  WorkspaceNavigation,
  type WorkspaceSection,
} from "./WorkspaceNavigation";

interface ApplicationWorkspaceProps {
  company: string;
  title: string;
  status: string;
  activeSection: WorkspaceSection;
  isJobAnalysisCompleted: boolean;
  isProfileMatchCompleted: boolean;
  isOptimizedCvCompleted: boolean;
  onSectionChange: (section: WorkspaceSection) => void;
  children: ReactNode;
}

export function ApplicationWorkspace({
  company,
  title,
  status,
  activeSection,
  isJobAnalysisCompleted,
  isProfileMatchCompleted,
  isOptimizedCvCompleted,
  onSectionChange,
  children,
}: ApplicationWorkspaceProps) {
  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          ← Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">{company}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {status}
          </span>
        </div>
      </header>

      <WorkspaceNavigation
        activeSection={activeSection}
        isJobAnalysisCompleted={isJobAnalysisCompleted}
        isProfileMatchCompleted={isProfileMatchCompleted}
        isOptimizedCvCompleted={isOptimizedCvCompleted}
        onSectionChange={onSectionChange}
      />

      <section aria-label="Application workspace content">{children}</section>
    </div>
  );
}
