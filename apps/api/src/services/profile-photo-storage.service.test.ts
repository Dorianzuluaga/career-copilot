import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const { send } = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/client-s3")>();
  return {
    ...actual,
    S3Client: class {
      send = send;
    },
  };
});

function stubRailwayBucketEnvironment() {
  vi.stubEnv("BUCKET", "career-copilot-test-bucket");
  vi.stubEnv("ENDPOINT", "https://storage.railway.app");
  vi.stubEnv("REGION", "auto");
  vi.stubEnv("ACCESS_KEY_ID", "test-access-key-id");
  vi.stubEnv("SECRET_ACCESS_KEY", "test-secret-access-key");
}

const objectKey = "users/4e9c843b-5c3d-4e65-8514-7de898b2aca6/master-cv/profile-photo/7e9c843b-5c3d-4e65-8514-7de898b2aca6";
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);

describe("profile photo Railway Bucket storage", () => {
  beforeEach(() => {
    send.mockReset();
    stubRailwayBucketEnvironment();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("writes a private object by key, not a public URL", async () => {
    send.mockResolvedValue({});
    const { writeProfilePhotoObject } = await import(
      "./profile-photo-storage.service.js"
    );

    await writeProfilePhotoObject(objectKey, jpeg, "image/jpeg");

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toEqual({
      Bucket: "career-copilot-test-bucket",
      Key: objectKey,
      Body: jpeg,
      ContentType: "image/jpeg",
      CacheControl: "private, no-store",
    });
    expect(command.input).not.toHaveProperty("ACL");
    expect(JSON.stringify(command.input)).not.toContain("https://");
  });

  it("reads object bytes from the private bucket", async () => {
    send.mockResolvedValue({
      Body: {
        transformToByteArray: async () => Uint8Array.from(jpeg),
      },
    });
    const { readProfilePhotoObject } = await import(
      "./profile-photo-storage.service.js"
    );

    await expect(readProfilePhotoObject(objectKey)).resolves.toEqual(jpeg);

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetObjectCommand);
    expect(command.input).toEqual({
      Bucket: "career-copilot-test-bucket",
      Key: objectKey,
    });
  });

  it("copies to a new key inside the same private bucket", async () => {
    send.mockResolvedValue({});
    const destinationKey =
      "users/4e9c843b-5c3d-4e65-8514-7de898b2aca6/applications/8e9c843b-5c3d-4e65-8514-7de898b2aca6/optimized-cv/profile-photo/11111111-1111-4111-8111-111111111111";
    const { copyProfilePhotoObject } = await import(
      "./profile-photo-storage.service.js"
    );

    await copyProfilePhotoObject(objectKey, destinationKey);

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(CopyObjectCommand);
    expect(command.input).toEqual({
      Bucket: "career-copilot-test-bucket",
      CopySource: `career-copilot-test-bucket/${objectKey}`,
      Key: destinationKey,
    });
    expect(command.input.CopySource).not.toMatch(/^https?:\/\//);
  });

  it("treats a missing object as not found", async () => {
    send.mockRejectedValue(
      Object.assign(new Error("Not Found"), {
        name: "NotFound",
        $metadata: { httpStatusCode: 404 },
      }),
    );
    const { profilePhotoObjectExists, deleteProfilePhotoObject } = await import(
      "./profile-photo-storage.service.js"
    );

    await expect(profilePhotoObjectExists(objectKey)).resolves.toBe(false);
    await expect(deleteProfilePhotoObject(objectKey)).resolves.toBeUndefined();

    expect(send.mock.calls[0][0]).toBeInstanceOf(HeadObjectCommand);
    expect(send.mock.calls[1][0]).toBeInstanceOf(DeleteObjectCommand);
  });

  it("deletes unreferenced objects under a prefix and keeps referenced keys", async () => {
    const keepKey = `${objectKey}-keep`;
    const orphanKey = `${objectKey}-orphan`;
    send
      .mockResolvedValueOnce({
        Contents: [{ Key: keepKey }, { Key: orphanKey }],
        IsTruncated: false,
      })
      .mockResolvedValueOnce({});

    const { deleteUnreferencedProfilePhotoObjects } = await import(
      "./profile-photo-storage.service.js"
    );

    await deleteUnreferencedProfilePhotoObjects(
      "users/4e9c843b-5c3d-4e65-8514-7de898b2aca6/master-cv/profile-photo/",
      [keepKey],
    );

    expect(send.mock.calls[0][0]).toBeInstanceOf(ListObjectsV2Command);
    expect(send.mock.calls[0][0].input).toEqual({
      Bucket: "career-copilot-test-bucket",
      Prefix:
        "users/4e9c843b-5c3d-4e65-8514-7de898b2aca6/master-cv/profile-photo/",
    });
    expect(send.mock.calls[1][0]).toBeInstanceOf(DeleteObjectCommand);
    expect(send.mock.calls[1][0].input.Key).toBe(orphanKey);
    expect(send.mock.calls.map((call) => call[0].input.Key)).not.toContain(
      keepKey,
    );
  });
});
