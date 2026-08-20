import type { ReactNode } from "react";
import { useLocale } from "../hooks/useLocale";
import {
  WorkspaceNavigation,
  type WorkspaceSection,
} from "./WorkspaceNavigation";
import { GuardedLink } from "../context/UnsavedChangesGuardProvider";

interface ApplicationWorkspaceProps {
  company: string;
  title: string;
  status: string;
  activeSection: WorkspaceSection;
  isJobAnalysisCompleted: boolean;
  isProfileMatchCompleted: boolean;
  isOptimizedCvCompleted: boolean;
  isCoverLetterCompleted: boolean;
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
  isCoverLetterCompleted,
  onSectionChange,
  children,
}: ApplicationWorkspaceProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-8">
      <header className="cc-card p-6 sm:p-8">
        <GuardedLink
          to="/dashboard"
          className="text-sm font-semibold text-brand hover:text-navy"
        >
          ← {t("nav.dashboard")}
        </GuardedLink>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="cc-kicker">{company}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
          </div>
          <span className="cc-badge">{status}</span>
        </div>
      </header>

      <WorkspaceNavigation
        activeSection={activeSection}
        isJobAnalysisCompleted={isJobAnalysisCompleted}
        isProfileMatchCompleted={isProfileMatchCompleted}
        isOptimizedCvCompleted={isOptimizedCvCompleted}
        isCoverLetterCompleted={isCoverLetterCompleted}
        onSectionChange={onSectionChange}
      />

      <section aria-label={t("workspace.contentAriaLabel")}>{children}</section>
    </div>
  );
}
