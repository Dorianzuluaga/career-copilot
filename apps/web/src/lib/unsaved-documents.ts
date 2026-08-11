import { deepEqual } from "./deepEqual";

export interface UnsavedDocumentDescriptor {
  id: string;
  label: string;
  section: string;
  working: unknown;
  saved: unknown;
}

export interface UnsavedDocument {
  id: string;
  label: string;
}

export function isDocumentDirty(working: unknown, saved: unknown): boolean {
  if (working === null || working === undefined) return false;
  return !deepEqual(working, saved);
}

export function getDirtyDocuments(
  documents: UnsavedDocumentDescriptor[],
): UnsavedDocument[] {
  return documents
    .filter((document) => isDocumentDirty(document.working, document.saved))
    .map(({ id, label }) => ({ id, label }));
}

/** Documents that block leaving a specific workspace section. */
export function getDocumentsBlockingSectionLeave(
  activeSection: string,
  documents: UnsavedDocumentDescriptor[],
): UnsavedDocument[] {
  return documents
    .filter(
      (document) =>
        document.section === activeSection &&
        isDocumentDirty(document.working, document.saved),
    )
    .map(({ id, label }) => ({ id, label }));
}

/** Documents that block leaving the Application Workspace entirely. */
export function getDocumentsBlockingWorkspaceExit(
  documents: UnsavedDocumentDescriptor[],
): UnsavedDocument[] {
  return getDirtyDocuments(documents);
}
