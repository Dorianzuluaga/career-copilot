import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | undefined;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getS3BucketName(): string {
  return requiredEnv("BUCKET");
}

export function getS3Client(): S3Client {
  client ??= new S3Client({
    region: requiredEnv("REGION"),
    endpoint: requiredEnv("ENDPOINT"),
    credentials: {
      accessKeyId: requiredEnv("ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("SECRET_ACCESS_KEY"),
    },
  });
  return client;
}
