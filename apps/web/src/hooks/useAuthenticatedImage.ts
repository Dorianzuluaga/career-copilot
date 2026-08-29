import { useEffect, useState } from "react";

export type AuthenticatedImageState = {
  objectUrl: string | null;
  isLoading: boolean;
  hasError: boolean;
};

export function loadAuthenticatedImage(
  src: string,
  onLoad: (objectUrl: string) => void,
  onError: () => void,
): () => void {
  let cancelled = false;
  let created: string | null = null;

  void fetch(src, { credentials: "include" })
    .then((response) => {
      if (!response.ok) throw new Error("Photo request failed.");
      return response.blob();
    })
    .then((blob) => {
      if (cancelled) return;
      created = URL.createObjectURL(blob);
      onLoad(created);
    })
    .catch(() => {
      if (!cancelled) onError();
    });

  return () => {
    cancelled = true;
    if (created) URL.revokeObjectURL(created);
  };
}

export function useAuthenticatedImage(
  src: string | null,
): AuthenticatedImageState {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setObjectUrl(null);
    setHasError(false);
    if (!src) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return loadAuthenticatedImage(
      src,
      (created) => {
        setObjectUrl(created);
        setIsLoading(false);
      },
      () => {
        setObjectUrl(null);
        setIsLoading(false);
        setHasError(true);
      },
    );
  }, [src]);

  return { objectUrl, isLoading, hasError };
}
