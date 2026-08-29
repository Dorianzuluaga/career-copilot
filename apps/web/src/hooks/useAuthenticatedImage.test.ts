import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAuthenticatedImage } from "./useAuthenticatedImage";

describe("authenticated image loading", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads with the session cookie and revokes the object URL on cleanup", async () => {
    const blob = new Blob(["photo"], { type: "image/jpeg" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    });
    const createObjectURL = vi.fn().mockReturnValue("blob:profile-photo");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const onLoad = vi.fn();

    const cleanup = loadAuthenticatedImage(
      "/api/master-cv/photo?v=asset",
      onLoad,
      vi.fn(),
    );
    await vi.waitFor(() =>
      expect(onLoad).toHaveBeenCalledWith("blob:profile-photo"),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/master-cv/photo?v=asset",
      { credentials: "include" },
    );
    cleanup();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:profile-photo");
  });

  it("reports failed authenticated reads without creating an object URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        blob: vi.fn(),
      }),
    );
    const createObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL: vi.fn(),
    });
    const onError = vi.fn();

    loadAuthenticatedImage("/api/photo", vi.fn(), onError);
    await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce());
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
