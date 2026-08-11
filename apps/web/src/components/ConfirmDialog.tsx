import type { ReactNode } from "react";

export interface ConfirmDialogAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  primaryAction: ConfirmDialogAction;
  secondaryAction: ConfirmDialogAction;
  cancelAction: ConfirmDialogAction;
}

function actionClassName(
  variant: ConfirmDialogAction["variant"] = "secondary",
): string {
  if (variant === "primary") {
    return "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
  }
  if (variant === "danger") {
    return "rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";
  }
  return "rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
}

export function ConfirmDialog({
  open,
  title,
  description,
  primaryAction,
  secondaryAction,
  cancelAction,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-slate-950"
        >
          {title}
        </h2>
        <div className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={actionClassName(cancelAction.variant)}
            disabled={cancelAction.disabled}
            onClick={cancelAction.onClick}
          >
            {cancelAction.label}
          </button>
          <button
            type="button"
            className={actionClassName(secondaryAction.variant ?? "danger")}
            disabled={secondaryAction.disabled}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
          <button
            type="button"
            className={actionClassName(primaryAction.variant ?? "primary")}
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </button>
        </div>
      </div>
    </div>
  );
}
