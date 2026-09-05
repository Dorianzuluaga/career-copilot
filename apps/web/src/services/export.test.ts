import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportApplicationDocument, previewExportDocument } from "./export";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("export request contract", () => {
  it("sends document and presentationLanguage for PDF export", async () => {
    fetchMock.mockResolvedValue(
      new Response("%PDF-1.4", {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="taylor-smith_cv.pdf"',
        },
      }),
    );

    const file = await exportApplicationDocument(
      "application-id",
      "optimized-cv",
      "fr",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/applications/application-id/export",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: "optimized-cv",
          presentationLanguage: "fr",
        }),
      },
    );
    expect(file.filename).toBe("taylor-smith_cv.pdf");
  });

  it("sends the selected Presentation Language for Export Preview", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          document: "cover-letter",
          presentationLanguage: "en",
          data: { greeting: "Hello,", workingLanguage: "es" },
          chrome: { formattedDate: "August 7, 2026" },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const preview = await previewExportDocument(
      "application-id",
      "cover-letter",
      "en",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/applications/application-id/export/preview",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: "cover-letter",
          presentationLanguage: "en",
        }),
      },
    );
    expect(preview).toEqual({
      document: "cover-letter",
      presentationLanguage: "en",
      data: { greeting: "Hello,", workingLanguage: "es" },
      chrome: { formattedDate: "August 7, 2026" },
    });
  });

  it("uses one Presentation Language for both package PDF requests", async () => {
    fetchMock.mockImplementation(
      () =>
        new Response("%PDF-1.4", {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="document.pdf"',
          },
        }),
    );

    await exportApplicationDocument("application-id", "optimized-cv", "es");
    await exportApplicationDocument("application-id", "cover-letter", "es");

    expect(
      fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body))),
    ).toEqual([
      { document: "optimized-cv", presentationLanguage: "es" },
      { document: "cover-letter", presentationLanguage: "es" },
    ]);
  });

  it("does not call generation endpoints during export or preview", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          document: "optimized-cv",
          presentationLanguage: "fr",
          data: { professionalSummary: "Saved" },
          chrome: {
            professionalSummary: "Résumé professionnel",
            experience: "Expérience",
            education: "Formation",
            skills: "Compétences",
            languages: "Langues",
            certifications: "Certifications",
            personalProjects: "Projets personnels",
            present: "Aujourd'hui",
            openProject: "Ouvrir le projet",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await previewExportDocument("application-id", "optimized-cv", "fr");
    fetchMock.mockResolvedValue(
      new Response("%PDF-1.4", {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="cv.pdf"',
        },
      }),
    );
    await exportApplicationDocument("application-id", "optimized-cv", "fr");

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:3001/api/applications/application-id/export/preview",
      "http://localhost:3001/api/applications/application-id/export",
    ]);
    expect(
      fetchMock.mock.calls.some(
        ([url]) =>
          String(url).includes("/optimized-cv") &&
          !String(url).includes("export"),
      ),
    ).toBe(false);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("/cover-letter"),
      ),
    ).toBe(false);
  });

});
