import { describe, expect, it, vi } from "vitest";
import { createExportPreviewCache } from "../components/ApplicationExport";
import { translate } from "../i18n/translate";
import type { ProfileComparison } from "../types/profile-comparison";
import { ApiError } from "./api";
import {
  createProfileMatchPresentationCache,
  isCurrentProfileMatchPresentationScope,
  loadProfileMatchPresentation,
  profileMatchPresentationErrorMessage,
  readCachedProfileMatchPresentation,
  shouldInvalidateProfileMatchPresentationCache,
} from "./profile-match-presentation";

const applicationId = "application-id";

const spanishPresentation: ProfileComparison = {
  matchingSkills: ["TypeScript"],
  missingSkills: ["Docker"],
  strengths: ["Experiencia frontend relevante"],
  weaknesses: ["No se demuestra experiencia en la nube"],
  alignmentScore: 72,
  alignmentReasoning: "Razonamiento interno",
  recommendation: "Buena oportunidad. Adapta tu CV antes de postularte.",
  workingLanguage: "es",
};

const frenchPresentation: ProfileComparison = {
  ...spanishPresentation,
  strengths: ["Expérience frontend pertinente"],
  weaknesses: ["L'expérience cloud n'est pas démontrée"],
  recommendation: "Bonne opportunité. Adaptez votre CV avant de postuler.",
  alignmentReasoning: "Raisonnement interne",
};

const englishPresentation: ProfileComparison = {
  ...spanishPresentation,
  strengths: ["Relevant frontend experience"],
  weaknesses: ["Cloud experience is not demonstrated"],
  recommendation: "Good opportunity. Adapt your CV before applying.",
  alignmentReasoning: "Internal score reasoning",
};

const persistedGetPayload: ProfileComparison = {
  ...spanishPresentation,
  strengths: ["UNADAPTED GET NARRATIVE"],
};

describe("profile match presentation cache", () => {
  it("requests presentation for the current UI locale on first load", async () => {
    const cache = createProfileMatchPresentationCache();
    const fetchPresentation = vi.fn().mockResolvedValue(frenchPresentation);

    const result = await loadProfileMatchPresentation({
      cache,
      previousScope: null,
      scope: { applicationId, locale: "fr" },
      fetchPresentation,
    });

    expect(fetchPresentation).toHaveBeenCalledTimes(1);
    expect(fetchPresentation).toHaveBeenCalledWith(applicationId, "fr");
    expect(result.presentation).toEqual(frenchPresentation);
    expect(cache.get(applicationId, "fr")).toEqual(frenchPresentation);
  });

  it("does not cache a missing Profile Match", async () => {
    const cache = createProfileMatchPresentationCache();
    const fetchPresentation = vi.fn().mockResolvedValue(null);

    const result = await loadProfileMatchPresentation({
      cache,
      previousScope: null,
      scope: { applicationId, locale: "fr" },
      fetchPresentation,
    });

    expect(result.presentation).toBeNull();
    expect(cache.get(applicationId, "fr")).toBeNull();
  });

  it("does not display the persisted GET payload as the presentation", async () => {
    const cache = createProfileMatchPresentationCache();
    const fetchPresentation = vi.fn().mockResolvedValue(englishPresentation);

    expect(cache.get(applicationId, "en")).toBeNull();

    const result = await loadProfileMatchPresentation({
      cache,
      previousScope: null,
      scope: { applicationId, locale: "en" },
      fetchPresentation,
    });

    expect(result.presentation).toEqual(englishPresentation);
    expect(result.presentation).not.toEqual(persistedGetPayload);
    expect(result.presentation?.strengths).not.toContain(
      "UNADAPTED GET NARRATIVE",
    );
  });

  it("reuses a cached locale when switching back without calling presentation again", async () => {
    const cache = createProfileMatchPresentationCache();
    const fetchPresentation = vi
      .fn()
      .mockResolvedValueOnce(spanishPresentation)
      .mockResolvedValueOnce(frenchPresentation);

    const first = await loadProfileMatchPresentation({
      cache,
      previousScope: null,
      scope: { applicationId, locale: "es" },
      fetchPresentation,
    });
    const second = await loadProfileMatchPresentation({
      cache,
      previousScope: first.scope,
      scope: { applicationId, locale: "fr" },
      fetchPresentation,
    });
    const third = await loadProfileMatchPresentation({
      cache,
      previousScope: second.scope,
      scope: { applicationId, locale: "fr" },
      fetchPresentation,
    });

    expect(fetchPresentation).toHaveBeenCalledTimes(2);
    expect(fetchPresentation.mock.calls).toEqual([
      [applicationId, "es"],
      [applicationId, "fr"],
    ]);
    expect(third.presentation).toBe(frenchPresentation);
  });

  it("does not call compare or regeneration when loading presentation", async () => {
    const cache = createProfileMatchPresentationCache();
    const fetchPresentation = vi.fn().mockResolvedValue(frenchPresentation);

    await loadProfileMatchPresentation({
      cache,
      previousScope: null,
      scope: { applicationId, locale: "fr" },
      fetchPresentation,
    });

    expect(fetchPresentation).toHaveBeenCalledTimes(1);
    expect(fetchPresentation).toHaveBeenCalledWith(applicationId, "fr");
  });

  it("does not cache a failed presentation and retries from the persisted source", async () => {
    const cache = createProfileMatchPresentationCache();
    const fetchPresentation = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiError(
          "We couldn't prepare this Profile Match in the selected language.",
          502,
        ),
      )
      .mockResolvedValueOnce(frenchPresentation);

    await expect(
      loadProfileMatchPresentation({
        cache,
        previousScope: null,
        scope: { applicationId, locale: "fr" },
        fetchPresentation,
      }),
    ).rejects.toMatchObject({ status: 502 });
    expect(cache.get(applicationId, "fr")).toBeNull();

    const retry = await loadProfileMatchPresentation({
      cache,
      previousScope: { applicationId, locale: "fr" },
      scope: { applicationId, locale: "fr" },
      fetchPresentation,
    });

    expect(fetchPresentation).toHaveBeenCalledTimes(2);
    expect(retry.presentation).toEqual(frenchPresentation);
  });

  it("stores a successful compare response as the cache entry for that locale", async () => {
    const cache = createProfileMatchPresentationCache();
    cache.set(applicationId, "es", spanishPresentation);
    const fetchPresentation = vi.fn();

    const result = await loadProfileMatchPresentation({
      cache,
      previousScope: null,
      scope: { applicationId, locale: "es" },
      fetchPresentation,
    });

    expect(fetchPresentation).not.toHaveBeenCalled();
    expect(result.presentation).toBe(spanishPresentation);
  });

  it("does not reuse a previous language as the current presentation", () => {
    const cache = createProfileMatchPresentationCache();
    cache.set(applicationId, "es", spanishPresentation);

    expect(
      shouldInvalidateProfileMatchPresentationCache(
        { applicationId, locale: "es" },
        { applicationId, locale: "fr" },
      ),
    ).toBe(false);
    expect(
      readCachedProfileMatchPresentation(
        cache,
        { applicationId, locale: "es" },
        { applicationId, locale: "fr" },
      ),
    ).toBeNull();
    expect(cache.get(applicationId, "es")).toEqual(spanishPresentation);
  });

  it("clears cached presentations when the application changes", () => {
    const cache = createProfileMatchPresentationCache();
    cache.set(applicationId, "fr", frenchPresentation);

    expect(
      shouldInvalidateProfileMatchPresentationCache(
        { applicationId, locale: "fr" },
        { applicationId: "other-application", locale: "fr" },
      ),
    ).toBe(true);
    expect(
      readCachedProfileMatchPresentation(
        cache,
        { applicationId, locale: "fr" },
        { applicationId: "other-application", locale: "fr" },
      ),
    ).toBeNull();
    expect(cache.get(applicationId, "fr")).toBeNull();
  });

  it("keeps workspace-scoped cache instances isolated from each other", () => {
    const first = createProfileMatchPresentationCache();
    const second = createProfileMatchPresentationCache();
    first.set(applicationId, "fr", frenchPresentation);

    expect(first.get(applicationId, "fr")).toEqual(frenchPresentation);
    expect(second.get(applicationId, "fr")).toBeNull();
  });

  it("does not affect the Export preview cache", () => {
    const presentationCache = createProfileMatchPresentationCache();
    const exportCache = createExportPreviewCache();
    const preview = {
      document: "optimized-cv" as const,
      presentationLanguage: "fr" as const,
      data: {
        fullName: "Taylor Smith",
        professionalTitle: null,
        email: "taylor@example.com",
        phone: null,
        location: null,
        linkedin: null,
        website: null,
        professionalSummary: "Engineer",
        experience: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
        personalProjects: [],
        workingLanguage: "es" as const,
      },
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
    };

    exportCache.set(applicationId, "optimized-cv", "fr", preview);
    presentationCache.set(applicationId, "fr", frenchPresentation);
    presentationCache.clear();

    expect(presentationCache.get(applicationId, "fr")).toBeNull();
    expect(exportCache.get(applicationId, "optimized-cv", "fr")).toEqual(
      preview,
    );
  });

  it("ignores stale presentation responses after a newer locale is requested", () => {
    expect(
      isCurrentProfileMatchPresentationScope(
        { applicationId, locale: "fr" },
        { applicationId, locale: "en" },
      ),
    ).toBe(false);
    expect(
      isCurrentProfileMatchPresentationScope(
        { applicationId, locale: "en" },
        { applicationId, locale: "en" },
      ),
    ).toBe(true);
  });

  it("keeps both successful locale entries when an earlier request resolves late", async () => {
    const cache = createProfileMatchPresentationCache();
    let resolveFrench: (value: ProfileComparison) => void = () => undefined;
    const frenchPending = new Promise<ProfileComparison>((resolve) => {
      resolveFrench = resolve;
    });
    const fetchPresentation = vi.fn(
      (_applicationId: string, locale: "es" | "en" | "fr") => {
        if (locale === "fr") {
          return frenchPending;
        }
        return Promise.resolve(englishPresentation);
      },
    );

    const frenchLoad = loadProfileMatchPresentation({
      cache,
      previousScope: null,
      scope: { applicationId, locale: "fr" },
      fetchPresentation,
    });
    const englishLoad = loadProfileMatchPresentation({
      cache,
      previousScope: { applicationId, locale: "fr" },
      scope: { applicationId, locale: "en" },
      fetchPresentation,
    });

    const english = await englishLoad;
    resolveFrench(frenchPresentation);
    const french = await frenchLoad;

    expect(english.presentation).toEqual(englishPresentation);
    expect(french.presentation).toEqual(frenchPresentation);
    expect(
      isCurrentProfileMatchPresentationScope(french.scope, {
        applicationId,
        locale: "en",
      }),
    ).toBe(false);
    expect(cache.get(applicationId, "en")).toEqual(englishPresentation);
    expect(cache.get(applicationId, "fr")).toEqual(frenchPresentation);
  });

  it.each(["es", "en", "fr"] as const)(
    "maps presentation failures to localized copy for %s without the API message",
    (locale) => {
      const apiMessage =
        "We couldn't prepare this Profile Match in the selected language.";
      const localized = profileMatchPresentationErrorMessage((key) =>
        translate(locale, key),
      );

      expect(localized).toBe(
        translate(locale, "profileMatch.presentationFailed"),
      );
      if (locale !== "en") {
        expect(localized).not.toBe(apiMessage);
      }
    },
  );
});
