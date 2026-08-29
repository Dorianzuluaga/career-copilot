import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getS3BucketName, getS3Client } from "../lib/s3-client.js";

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const name = "name" in error ? String(error.name) : "";
  const metadata =
    "$metadata" in error &&
    error.$metadata &&
    typeof error.$metadata === "object"
      ? error.$metadata
      : undefined;
  const status =
    metadata && "httpStatusCode" in metadata
      ? Number(metadata.httpStatusCode)
      : undefined;

  return name === "NotFound" || name === "NoSuchKey" || status === 404;
}

export async function writeProfilePhotoObject(
  objectKey: string,
  bytes: Buffer,
  contentType: string,
): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getS3BucketName(),
      Key: objectKey,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "private, no-store",
    }),
  );
}

export async function readProfilePhotoObject(objectKey: string): Promise<Buffer> {
  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: getS3BucketName(),
      Key: objectKey,
    }),
  );

  if (!response.Body) {
    throw new Error("Profile photo object is empty.");
  }

  return Buffer.from(await response.Body.transformToByteArray());
}

export async function copyProfilePhotoObject(
  sourceKey: string,
  destinationKey: string,
): Promise<void> {
  const bucket = getS3BucketName();
  await getS3Client().send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${sourceKey}`,
      Key: destinationKey,
    }),
  );
}

export async function deleteProfilePhotoObject(objectKey: string): Promise<void> {
  try {
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: getS3BucketName(),
        Key: objectKey,
      }),
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }
    throw error;
  }
}

export async function profilePhotoObjectExists(objectKey: string): Promise<boolean> {
  try {
    await getS3Client().send(
      new HeadObjectCommand({
        Bucket: getS3BucketName(),
        Key: objectKey,
      }),
    );
    return true;
  } catch (error) {
    if (isNotFoundError(error)) {
      return false;
    }
    throw error;
  }
}

export async function deleteUnreferencedProfilePhotoObjects(
  prefix: string,
  keepKeys: Iterable<string | null | undefined>,
): Promise<void> {
  const keep = new Set(
    [...keepKeys].filter((key): key is string => typeof key === "string" && key.length > 0),
  );
  const bucket = getS3BucketName();
  const client = getS3Client();
  const keysToDelete: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key && !keep.has(object.Key)) {
        keysToDelete.push(object.Key);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  await Promise.all(keysToDelete.map((key) => deleteProfilePhotoObject(key)));
}

export async function deleteProfilePhotoObjectBestEffort(
  objectKey: string | null | undefined,
): Promise<void> {
  if (!objectKey) {
    return;
  }
  try {
    await deleteProfilePhotoObject(objectKey);
  } catch {
    try {
      await deleteProfilePhotoObject(objectKey);
    } catch {
      // Previous object is an orphan. The new key remains the source of truth.
    }
  }
}
