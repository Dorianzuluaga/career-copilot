import { afterEach, describe, expect, it, vi } from "vitest";
import {
  updateMasterCvPhotoPosition,
  uploadMasterCvPhoto,
} from "./master-cv";

const photoResponse = {
  profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
  profilePhotoPositionX: 25,
  profilePhotoPositionY: 75,
};

describe("Master CV photo API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads the original file and paired position metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(photoResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["jpeg"], "photo.jpg", { type: "image/jpeg" });

    await expect(uploadMasterCvPhoto(file, 25, 75)).resolves.toEqual(
      photoResponse,
    );
    const request = fetchMock.mock.calls[0];
    expect(request[1]).toMatchObject({
      method: "PUT",
      credentials: "include",
    });
    const body = request[1]?.body as FormData;
    expect(body.get("file")).toBe(file);
    expect(body.get("positionX")).toBe("25");
    expect(body.get("positionY")).toBe("75");
  });

  it("saves position without uploading image bytes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(photoResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateMasterCvPhotoPosition(25, 75)).resolves.toEqual(
      photoResponse,
    );
    const request = fetchMock.mock.calls[0];
    expect(request[1]).toMatchObject({
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({ positionX: 25, positionY: 75 }),
    });
  });
});
