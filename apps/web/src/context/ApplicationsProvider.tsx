import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { Application, ApplicationInput } from "../types/application";
import {
  ApplicationsContext,
  type ApplicationsContextValue,
} from "./applications-context";

interface ApplicationsProviderProps {
  children: ReactNode;
}

export function ApplicationsProvider({ children }: ApplicationsProviderProps) {
  const [applications, setApplications] = useState<Application[]>([]);

  const createApplication = useCallback((input: ApplicationInput) => {
    const application: Application = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setApplications((currentApplications) => [
      application,
      ...currentApplications,
    ]);

    return application;
  }, []);

  const updateApplication = useCallback(
    (id: string, input: ApplicationInput) => {
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === id ? { ...application, ...input } : application,
        ),
      );
    },
    [],
  );

  const deleteApplication = useCallback((id: string) => {
    setApplications((currentApplications) =>
      currentApplications.filter((application) => application.id !== id),
    );
  }, []);

  const getApplication = useCallback(
    (id: string) => applications.find((application) => application.id === id),
    [applications],
  );

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      applications,
      createApplication,
      updateApplication,
      deleteApplication,
      getApplication,
    }),
    [
      applications,
      createApplication,
      deleteApplication,
      getApplication,
      updateApplication,
    ],
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}
