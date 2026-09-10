import type { Locale } from "../i18n/locales";
import type { TranslationKey } from "../i18n/messages";
import type { ProfileComparison } from "../types/profile-comparison";

export type ProfileMatchPresentationScope = {
  applicationId: string;
  locale: Locale;
};

export type ProfileMatchPresentationCache = {
  get(applicationId: string, locale: Locale): ProfileComparison | null;
  set(
    applicationId: string,
    locale: Locale,
    presentation: ProfileComparison,
  ): void;
  clear(): void;
};

export function createProfileMatchPresentationCache(): ProfileMatchPresentationCache {
  const entries = new Map<string, ProfileComparison>();

  function key(applicationId: string, locale: Locale): string {
    return `${applicationId}:${locale}`;
  }

  return {
    get(applicationId, locale) {
      return entries.get(key(applicationId, locale)) ?? null;
    },
    set(applicationId, locale, presentation) {
      entries.set(key(applicationId, locale), presentation);
    },
    clear() {
      entries.clear();
    },
  };
}

export function shouldInvalidateProfileMatchPresentationCache(
  previous: ProfileMatchPresentationScope | null,
  next: ProfileMatchPresentationScope,
): boolean {
  return previous !== null && previous.applicationId !== next.applicationId;
}

export function readCachedProfileMatchPresentation(
  cache: ProfileMatchPresentationCache,
  previousScope: ProfileMatchPresentationScope | null,
  scope: ProfileMatchPresentationScope,
): ProfileComparison | null {
  if (shouldInvalidateProfileMatchPresentationCache(previousScope, scope)) {
    cache.clear();
  }
  return cache.get(scope.applicationId, scope.locale);
}

export function isCurrentProfileMatchPresentationScope(
  requested: ProfileMatchPresentationScope,
  current: ProfileMatchPresentationScope,
): boolean {
  return (
    requested.applicationId === current.applicationId &&
    requested.locale === current.locale
  );
}

export function profileMatchPresentationErrorMessage(
  t: (key: TranslationKey) => string,
): string {
  return t("profileMatch.presentationFailed");
}

export async function loadProfileMatchPresentation({
  cache,
  previousScope,
  scope,
  fetchPresentation,
}: {
  cache: ProfileMatchPresentationCache;
  previousScope: ProfileMatchPresentationScope | null;
  scope: ProfileMatchPresentationScope;
  fetchPresentation: (
    applicationId: string,
    locale: Locale,
  ) => Promise<ProfileComparison | null>;
}): Promise<{
  presentation: ProfileComparison | null;
  scope: ProfileMatchPresentationScope;
}> {
  const cached = readCachedProfileMatchPresentation(
    cache,
    previousScope,
    scope,
  );
  if (cached) {
    return { presentation: cached, scope };
  }

  const presentation = await fetchPresentation(
    scope.applicationId,
    scope.locale,
  );
  if (presentation) {
    cache.set(scope.applicationId, scope.locale, presentation);
  }
  return { presentation, scope };
}
