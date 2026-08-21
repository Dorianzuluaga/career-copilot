import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const host = "0.0.0.0";
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

if (!Number.isFinite(port) || port <= 0) {
  throw new Error("PORT must be a positive number.");
}

const distDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);

try {
  const stats = await fs.stat(distDirectory);
  if (!stats.isDirectory()) {
    throw new Error("not a directory");
  }
} catch {
  throw new Error(
    `Production frontend build is missing at ${distDirectory}. Run npm run build --workspace=web before npm run start --workspace=web.`,
  );
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function toSafeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const normalized = path.posix.normalize(decoded);

  if (!normalized.startsWith("/")) {
    return null;
  }

  const absolute = path.resolve(distDirectory, normalized.slice(1));

  if (
    absolute !== distDirectory &&
    !absolute.startsWith(distDirectory + path.sep)
  ) {
    return null;
  }

  return absolute;
}

async function readFile(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "EISDIR")
    ) {
      return null;
    }

    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const filePath = toSafeFilePath(request.url ?? "/");

    if (filePath === null) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Bad request.");
      return;
    }

    let resolvedPath = filePath;
    let body = await readFile(resolvedPath);

    if (body === null) {
      const directoryIndex = path.join(filePath, "index.html");
      body = await readFile(directoryIndex);
      resolvedPath = directoryIndex;
    }

    const isAssetRequest = path.extname(filePath) !== "";

    if (body === null && !isAssetRequest) {
      resolvedPath = path.join(distDirectory, "index.html");
      body = await readFile(resolvedPath);
    }

    if (body === null) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found.");
      return;
    }

    response.writeHead(200, {
      "Content-Type":
        mimeTypes.get(path.extname(resolvedPath).toLowerCase()) ??
        "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal server error.");
  }
});

server.listen(port, host, () => {
  console.log(
    `Serving production frontend from ${distDirectory} on ${host}:${port}`,
  );
});
