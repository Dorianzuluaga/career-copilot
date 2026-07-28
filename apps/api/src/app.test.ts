import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./services/auth.service.js", () => ({
  SESSION_COOKIE_NAME: "career_copilot_session",
  SESSION_MAX_AGE_MS: 604_800_000,
  AuthenticationError: class AuthenticationError extends Error {},
  authenticateWithGoogle: vi.fn(),
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("./services/master-cv.service.js", () => ({
  MasterCvError: class MasterCvError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  getMasterCv: vi.fn(),
  addMasterCv: vi.fn(),
  editMasterCv: vi.fn(),
}));

vi.mock("./services/master-cv-extraction.service.js", () => ({
  extractMasterCv: vi.fn(),
}));

import { app } from "./app.js";
import {
  authenticateWithGoogle,
  AuthenticationError,
  getAuthenticatedUser,
} from "./services/auth.service.js";
import { extractMasterCv } from "./services/master-cv-extraction.service.js";
import { addMasterCv, getMasterCv } from "./services/master-cv.service.js";

const user = {
  id: "4e9c843b-5c3d-4e65-8514-7de898b2aca6",
  name: "Taylor Smith",
  email: "taylor@example.com",
  avatar: "https://example.com/avatar.png",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authentication API", () => {
  it("creates a session cookie after Google authentication", async () => {
    vi.mocked(authenticateWithGoogle).mockResolvedValue({
      sessionId: "opaque-session-id",
      user,
    });

    const response = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "firebase-id-token" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: true, user });
    expect(response.headers["set-cookie"]?.[0]).toContain(
      "career_copilot_session=opaque-session-id",
    );
    expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(response.headers["set-cookie"]?.[0]).toContain("SameSite=Lax");
    expect(response.headers["set-cookie"]?.[0]).toContain("Max-Age=604800");
    expect(response.headers["set-cookie"]?.[0]).not.toContain("Secure");
  });

  it("returns the required response when Google authentication fails", async () => {
    vi.mocked(authenticateWithGoogle).mockRejectedValue(
      new AuthenticationError("Invalid token"),
    );

    const response = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "invalid-token" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      authenticated: false,
      message: "Authentication failed.",
    });
  });

  it("restores the user from an application session", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: true, user });
    expect(getAuthenticatedUser).toHaveBeenCalledWith("opaque-session-id");
  });

  it("rejects requests without an application session", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      authenticated: false,
      message: "Authentication failed.",
    });
  });
});

describe("Master CV API", () => {
  it("requires an authenticated session", async () => {
    const response = await request(app).get("/api/master-cv");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Authentication required." });
    expect(getMasterCv).not.toHaveBeenCalled();
  });

  it("gets the authenticated user's Master CV", async () => {
    const masterCv = { id: "master-cv-id", fullName: "Taylor Smith" };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getMasterCv).mockResolvedValue(masterCv as never);

    const response = await request(app)
      .get("/api/master-cv")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ masterCv });
    expect(getMasterCv).toHaveBeenCalledWith(user.id);
  });

  it("creates a Master CV for the session user", async () => {
    const input = { fullName: "Taylor Smith" };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(addMasterCv).mockResolvedValue({
      id: "master-cv-id",
      ...input,
    } as never);

    const response = await request(app)
      .post("/api/master-cv")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send(input);

    expect(response.status).toBe(201);
    expect(addMasterCv).toHaveBeenCalledWith(user.id, input);
  });

  it("rejects non-PDF uploads", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

    const response = await request(app)
      .post("/api/master-cv/upload")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .attach("file", Buffer.from("not a pdf"), {
        filename: "cv.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Only PDF files are supported.",
    });
  });

  it("extracts structured data from a PDF", async () => {
    const extraction = {
      personalInformation: {
        fullName: "Taylor Smith",
        email: "taylor@example.com",
        phone: null,
        location: null,
        linkedin: null,
        portfolio: null,
      },
      professionalSummary: null,
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(extractMasterCv).mockResolvedValue(extraction);

    const response = await request(app)
      .post("/api/master-cv/upload")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .attach("file", Buffer.from("%PDF-1.7 test"), {
        filename: "cv.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(extraction);
  });
});
