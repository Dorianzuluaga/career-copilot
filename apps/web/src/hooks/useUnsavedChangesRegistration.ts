import { useEffect, useRef } from "react";
import {
  useUnsavedChangesGuard,
  type UnsavedChangesGuardRegistration,
} from "../context/UnsavedChangesGuardProvider";

/** Registers workspace-level unsaved-document protection while mounted. */
export function useUnsavedChangesRegistration(
  registration: UnsavedChangesGuardRegistration,
) {
  const { register, unregister } = useUnsavedChangesGuard();
  const registrationRef = useRef(registration);
  registrationRef.current = registration;

  useEffect(() => {
    register({
      getBlockingDocuments: () =>
        registrationRef.current.getBlockingDocuments(),
      saveDocuments: (documents) =>
        registrationRef.current.saveDocuments(documents),
      discardDocuments: (documents) =>
        registrationRef.current.discardDocuments(documents),
    });
    return () => {
      unregister();
    };
  }, [register, unregister]);
}
