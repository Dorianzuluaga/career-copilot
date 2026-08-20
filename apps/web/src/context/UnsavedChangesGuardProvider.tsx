import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useNavigate, type LinkProps } from "react-router";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useLocale } from "../hooks/useLocale";
import type { UnsavedDocument } from "../lib/unsaved-documents";

export interface UnsavedChangesGuardRegistration {
  getBlockingDocuments: () => UnsavedDocument[];
  saveDocuments: (documents: UnsavedDocument[]) => Promise<boolean>;
  discardDocuments: (documents: UnsavedDocument[]) => void;
}

interface PendingNavigation {
  documents: UnsavedDocument[];
  proceed: () => void;
}

interface UnsavedChangesGuardContextValue {
  register: (registration: UnsavedChangesGuardRegistration) => void;
  unregister: () => void;
  requestNavigation: (
    proceed: () => void,
    documents?: UnsavedDocument[],
  ) => void;
}

const UnsavedChangesGuardContext =
  createContext<UnsavedChangesGuardContextValue | null>(null);

export function UnsavedChangesGuardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { t } = useLocale();
  const registrationRef = useRef<UnsavedChangesGuardRegistration | null>(null);
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const register = useCallback(
    (registration: UnsavedChangesGuardRegistration) => {
      registrationRef.current = registration;
    },
    [],
  );

  const unregister = useCallback(() => {
    registrationRef.current = null;
  }, []);

  const requestNavigation = useCallback(
    (proceed: () => void, documents?: UnsavedDocument[]) => {
      const blockingDocuments =
        documents ?? registrationRef.current?.getBlockingDocuments() ?? [];
      if (blockingDocuments.length === 0) {
        proceed();
        return;
      }
      setPending({ documents: blockingDocuments, proceed });
    },
    [],
  );

  const closeDialog = useCallback(() => {
    setPending(null);
    setIsSaving(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (isSaving) return;
    closeDialog();
  }, [closeDialog, isSaving]);

  const handleLeaveWithoutSaving = useCallback(() => {
    if (!pending || isSaving) return;
    registrationRef.current?.discardDocuments(pending.documents);
    const proceed = pending.proceed;
    closeDialog();
    proceed();
  }, [closeDialog, isSaving, pending]);

  const handleSaveAndContinue = useCallback(() => {
    if (!pending || isSaving) return;
    const registration = registrationRef.current;
    if (!registration) return;

    const { documents, proceed } = pending;
    setIsSaving(true);
    void registration.saveDocuments(documents).then((saved) => {
      if (!saved) {
        setIsSaving(false);
        setPending(null);
        return;
      }
      closeDialog();
      proceed();
    });
  }, [closeDialog, isSaving, pending]);

  const value = useMemo(
    () => ({ register, unregister, requestNavigation }),
    [register, requestNavigation, unregister],
  );

  return (
    <UnsavedChangesGuardContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={pending !== null}
        title={t("workspace.unsaved.title")}
        description={
          pending ? (
            <div className="space-y-3">
              <p>{t("workspace.unsaved.description")}</p>
              <ul className="list-disc space-y-1 pl-5">
                {pending.documents.map((document) => (
                  <li key={document.id}>{document.label}</li>
                ))}
              </ul>
            </div>
          ) : null
        }
        cancelAction={{
          label: t("workspace.unsaved.cancel"),
          onClick: handleCancel,
          disabled: isSaving,
        }}
        secondaryAction={{
          label: t("workspace.unsaved.leaveWithoutSaving"),
          onClick: handleLeaveWithoutSaving,
          variant: "danger",
          disabled: isSaving,
        }}
        primaryAction={{
          label: isSaving
            ? t("workspace.unsaved.saving")
            : t("workspace.unsaved.saveAndContinue"),
          onClick: handleSaveAndContinue,
          variant: "primary",
          disabled: isSaving,
        }}
      />
    </UnsavedChangesGuardContext.Provider>
  );
}

export function useUnsavedChangesGuard() {
  const context = useContext(UnsavedChangesGuardContext);
  if (!context) {
    throw new Error(
      "useUnsavedChangesGuard must be used within an UnsavedChangesGuardProvider.",
    );
  }
  return context;
}

export function GuardedLink({ onClick, to, ...props }: LinkProps) {
  const navigate = useNavigate();
  const guard = useContext(UnsavedChangesGuardContext);

  return (
    <Link
      {...props}
      to={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !guard) return;
        event.preventDefault();
        guard.requestNavigation(() => {
          void navigate(to);
        });
      }}
    />
  );
}
