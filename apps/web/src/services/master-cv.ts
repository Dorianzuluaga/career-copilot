import type {
  MasterCv,
  MasterCvExtraction,
  MasterCvInput,
} from "../types/master-cv";
import { apiUrl, readResponse } from "./api";
export { ApiError } from "./api";

export function masterCvInputFromExtraction(
  extraction: MasterCvExtraction,
): MasterCvInput {
  return {
    fullName: extraction.personalInformation.fullName ?? "",
    email: extraction.personalInformation.email ?? "",
    phone: extraction.personalInformation.phone,
    location: extraction.personalInformation.location,
    linkedin: extraction.personalInformation.linkedin,
    portfolio: extraction.personalInformation.portfolio,
    professionalSummary: extraction.professionalSummary ?? "",
    experience: extraction.experience,
    education: extraction.education,
    skills: extraction.skills,
    languages: extraction.languages,
    certifications: extraction.certifications,
    personalProjects: extraction.personalProjects,
  };
}

export async function getMasterCv(): Promise<MasterCv | null> {
  const response = await fetch(`${apiUrl}/api/master-cv`, {
    credentials: "include",
  });
  if (response.status === 404) return null;
  const body = await readResponse<{ masterCv: MasterCv }>(response);
  return body.masterCv;
}

export async function createMasterCv(input: MasterCvInput): Promise<MasterCv> {
  const response = await fetch(`${apiUrl}/api/master-cv`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readResponse<{ masterCv: MasterCv }>(response);
  return body.masterCv;
}

export async function updateMasterCv(input: MasterCvInput): Promise<MasterCv> {
  const response = await fetch(`${apiUrl}/api/master-cv`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readResponse<{ masterCv: MasterCv }>(response);
  return body.masterCv;
}

export async function uploadMasterCv(file: File): Promise<MasterCvExtraction> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${apiUrl}/api/master-cv/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return readResponse<MasterCvExtraction>(response);
}
