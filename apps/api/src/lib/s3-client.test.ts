import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { lastConfig } = vi.hoisted(() => ({
  lastConfig: { value: undefined as unknown },
}));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/client-s3")>();
  return {
    ...actual,
    S3Client: class {
      constructor(config: unknown) {
        lastConfig.value = config;
      }
    },
  };
});

function stubRailwayBucketEnvironment() {
  vi.stubEnv("BUCKET", "career-copilot-test-bucket");
  vi.stubEnv("ENDPOINT", "https://storage.railway.app");
  vi.stubEnv("REGION", "auto");
  vi.stubEnv("ACCESS_KEY_ID", "test-access-key-id");
  vi.stubEnv("SECRET_ACCESS_KEY", "test-secret-access-key");
  vi.stubEnv("FIREBASE_STORAGE_BUCKET", "");
}

describe("Railway Bucket S3 client", () => {
  beforeEach(() => {
    lastConfig.value = undefined;
    stubRailwayBucketEnvironment();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("configures the S3 client from Railway Bucket credentials", async () => {
    const { getS3Client, getS3BucketName } = await import("./s3-client.js");

    expect(getS3BucketName()).toBe("career-copilot-test-bucket");
    getS3Client();

    expect(lastConfig.value).toEqual({
      region: "auto",
      endpoint: "https://storage.railway.app",
      credentials: {
        accessKeyId: "test-access-key-id",
        secretAccessKey: "test-secret-access-key",
      },
    });
    expect(lastConfig.value).not.toHaveProperty("forcePathStyle");
    expect(JSON.stringify(lastConfig.value)).not.toContain("FIREBASE_STORAGE");
  });

  it("does not read FIREBASE_STORAGE_BUCKET or RAILWAY_BUCKET_NAME", async () => {
    vi.stubEnv("FIREBASE_STORAGE_BUCKET", "career-copilot-test.appspot.com");
    vi.stubEnv("RAILWAY_BUCKET_NAME", "display-name-only");

    const { getS3Client, getS3BucketName } = await import("./s3-client.js");

    expect(getS3BucketName()).toBe("career-copilot-test-bucket");
    getS3Client();

    expect(JSON.stringify(lastConfig.value)).not.toContain(
      "career-copilot-test.appspot.com",
    );
    expect(JSON.stringify(lastConfig.value)).not.toContain("display-name-only");
  });
});
