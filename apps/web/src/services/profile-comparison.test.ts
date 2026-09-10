import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileComparison } from "../types/profile-comparison";
import {
  compareProfile,
  getProfileComparison,
  getProfileMatchPresentation,
} from "./profile-comparison";

const fetchMock = vi.fn();

const presentation: ProfileComparison = {
  matchingSkills: ["TypeScript"],
  missingSkills: ["Docker"],
  strengths: ["Relevant frontend experience"],
  weaknesses: ["Cloud experience is not demonstrated"],
  alignmentScore: 72,
  alignmentReasoning: "Internal score reasoning",
  recommendation: "Good opportunity. Adapt your CV before applying.",
  workingLanguage: "es",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("profile match presentation client", () => {
  it("posts the active UI locale to the presentation endpoint", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(presentation), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      getProfileMatchPresentation("application-id", "fr"),
    ).resolves.toEqual(presentation);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/applications/application-id/profile-comparison/presentation",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "fr" }),
      },
    );
  });

  it("does not send presentationLanguage or call compare/GET on presentation", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(presentation), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await getProfileMatchPresentation("application-id", "en");

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain("/profile-comparison/presentation");
    expect(String(url)).not.toMatch(/\/profile-comparison$/);
    expect(init?.body).toBe(JSON.stringify({ locale: "en" }));
    expect(String(init?.body)).not.toContain("presentationLanguage");
  });

  it("returns null when no saved Profile Match exists", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Profile Match not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      getProfileMatchPresentation("application-id", "es"),
    ).resolves.toBeNull();
  });

  it("preserves HTTP 502 so the workspace can localize adaptation failures", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message:
            "We couldn't prepare this Profile Match in the selected language.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      getProfileMatchPresentation("application-id", "en"),
    ).rejects.toMatchObject({
      status: 502,
      message:
        "We couldn't prepare this Profile Match in the selected language.",
    });
  });

  it("preserves HTTP 400 for malformed stored Profile Match", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ message: "The saved Profile Match is invalid." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      getProfileMatchPresentation("application-id", "es"),
    ).rejects.toMatchObject({
      status: 400,
      message: "The saved Profile Match is invalid.",
    });
  });

  it("keeps compare and persisted GET on their existing endpoints", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(presentation), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await compareProfile("application-id", "es");
    await getProfileComparison("application-id");

    expect(
      fetchMock.mock.calls.map(([url, init]) => [url, init?.method]),
    ).toEqual([
      [
        "http://localhost:3001/api/applications/application-id/profile-comparison",
        "POST",
      ],
      [
        "http://localhost:3001/api/applications/application-id/profile-comparison",
        undefined,
      ],
    ]);
  });
});
