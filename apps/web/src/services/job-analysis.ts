import type {
  JobAnalysis,
  JobOffer,
  PersistedApplication,
} from "../types/job-analysis";
import { apiUrl, readResponse } from "./api";

export async function createApplication(): Promise<{ id: string }> {
  const response = await fetch(`${apiUrl}/api/applications`, {
    method: "POST",
    credentials: "include",
  });
  const body = await readResponse<{ application: { id: string } }>(response);
  return body.application;
}

export async function listApplications(): Promise<PersistedApplication[]> {
  const response = await fetch(`${apiUrl}/api/applications`, {
    credentials: "include",
  });
  const body = await readResponse<{ applications: PersistedApplication[] }>(
    response,
  );
  return body.applications;
}

export async function deleteApplication(applicationId: string): Promise<void> {
  const response = await fetch(`${apiUrl}/api/applications/${applicationId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    await readResponse<never>(response);
  }
}

export async function saveJobOffer(
  applicationId: string,
  originalDescription: string,
): Promise<JobOffer> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/job-offer`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalDescription }),
    },
  );
  const body = await readResponse<{ jobOffer: JobOffer }>(response);
  return body.jobOffer;
}

export async function analyzeJobOffer(
  applicationId: string,
): Promise<JobAnalysis> {
  const response = await fetch(
    `${apiUrl}/api/applications/${applicationId}/job-analysis`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const body = await readResponse<{ jobAnalysis: JobAnalysis }>(response);
  return body.jobAnalysis;
}

export async function getApplication(
  applicationId: string,
): Promise<PersistedApplication> {
  const response = await fetch(`${apiUrl}/api/applications/${applicationId}`, {
    credentials: "include",
  });
  const body = await readResponse<{ application: PersistedApplication }>(
    response,
  );
  return body.application;
}
