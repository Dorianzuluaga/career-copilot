import { createContext } from "react";
import type { Application, ApplicationInput } from "../types/application";

export interface ApplicationsContextValue {
  applications: Application[];
  createApplication: (input: ApplicationInput) => Application;
  updateApplication: (id: string, input: ApplicationInput) => void;
  deleteApplication: (id: string) => void;
  getApplication: (id: string) => Application | undefined;
}

export const ApplicationsContext =
  createContext<ApplicationsContextValue | null>(null);
