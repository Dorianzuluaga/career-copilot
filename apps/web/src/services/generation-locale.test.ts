import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCoverLetter, saveCoverLetter } from "./cover-letter";
import { analyzeJobOffer } from "./job-analysis";
import { generateOptimizedCv, saveOptimizedCv } from "./optimized-cv";
import {
  compareProfile,
  getProfileMatchPresentation,
} from "./profile-comparison";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(() =>
    Promise.resolve(
      new Response("{}", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
});

describe("generation locale propagation", () => {
  it("sends the active UI locale in every generation request body", async () => {
    await analyzeJobOffer("application-id", "es");
    await compareProfile("application-id", "en");
    await getProfileMatchPresentation("application-id", "fr");
    await generateOptimizedCv("application-id", "fr");
    await generateCoverLetter("application-id", "es");

    expect(
      fetchMock.mock.calls.map(([, init]) => ({
        headers: init?.headers,
        body: init?.body,
      })),
    ).toEqual([
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "es" }),
      },
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "en" }),
      },
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "fr" }),
      },
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "fr" }),
      },
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "es" }),
      },
    ]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:3001/api/applications/application-id/job-analysis",
      "http://localhost:3001/api/applications/application-id/profile-comparison",
      "http://localhost:3001/api/applications/application-id/profile-comparison/presentation",
      "http://localhost:3001/api/applications/application-id/optimized-cv",
      "http://localhost:3001/api/applications/application-id/cover-letter",
    ]);
  });

  it("sends draft Working Language on save without substituting the current UI locale", async () => {
    const optimizedCv = {
      fullName: "Taylor Smith",
      professionalTitle: null,
      email: "taylor@example.com",
      phone: null,
      location: null,
      linkedin: null,
      website: null,
      professionalSummary: "Software engineer.",
      experience: [],
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
      personalProjects: [],
      workingLanguage: "fr" as const,
    };
    const coverLetter = {
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: null,
      date: "2026-09-04",
      companyName: null,
      greeting: "Bonjour,",
      introduction: "Introduction",
      professionalValue: "Valeur",
      motivation: "Motivation",
      closing: "Cordialement,",
      signature: "Taylor Smith",
      workingLanguage: "fr" as const,
    };

    await saveOptimizedCv("application-id", optimizedCv);
    await saveCoverLetter("application-id", coverLetter);

    expect(
      fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body))),
    ).toEqual([
      expect.objectContaining({ workingLanguage: "fr" }),
      expect.objectContaining({ workingLanguage: "fr" }),
    ]);
  });

  it("sends null Working Language for legacy documents instead of the current UI locale", async () => {
    const optimizedCv = {
      fullName: "Taylor Smith",
      professionalTitle: null,
      email: "taylor@example.com",
      phone: null,
      location: null,
      linkedin: null,
      website: null,
      professionalSummary: "Software engineer.",
      experience: [],
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
      personalProjects: [],
      workingLanguage: null,
    };
    const coverLetter = {
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: null,
      date: "2026-09-04",
      companyName: null,
      greeting: "Hello,",
      introduction: "Introduction",
      professionalValue: "Value",
      motivation: "Motivation",
      closing: "Regards,",
      signature: "Taylor Smith",
      workingLanguage: null,
    };

    await saveOptimizedCv("application-id", optimizedCv);
    await saveCoverLetter("application-id", coverLetter);

    expect(
      fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body))),
    ).toEqual([
      expect.objectContaining({ workingLanguage: null }),
      expect.objectContaining({ workingLanguage: null }),
    ]);
  });
});
