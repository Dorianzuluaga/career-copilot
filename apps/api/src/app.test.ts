import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./services/auth.service.js", () => ({
  SESSION_COOKIE_NAME: "career_copilot_session",
  SESSION_MAX_AGE_MS: 604_800_000,
  AuthenticationError: class AuthenticationError extends Error {},
  authenticateWithGoogle: vi.fn(),
  getAuthenticatedUser: vi.fn(),
  getSessionCookieOptions: () => {
    const production = process.env.NODE_ENV === "production";
    return {
      httpOnly: true,
      sameSite: production ? "none" : "lax",
      secure: production,
      path: "/",
    };
  },
  logout: vi.fn(),
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

vi.mock("./services/master-cv-photo.service.js", () => ({
  ProfilePhotoError: class ProfilePhotoError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  replaceMasterCvPhoto: vi.fn(),
  updateMasterCvPhotoPosition: vi.fn(),
  removeMasterCvPhoto: vi.fn(),
  getMasterCvPhoto: vi.fn(),
  getOptimizedCvPhoto: vi.fn(),
}));

vi.mock("./services/master-cv-extraction.service.js", () => ({
  extractMasterCv: vi.fn(),
}));

vi.mock("./services/application.service.js", () => ({
  ApplicationError: class ApplicationError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  addApplication: vi.fn(),
  getApplication: vi.fn(),
  listApplications: vi.fn(),
  removeApplication: vi.fn(),
}));

vi.mock("./services/job-offer.service.js", () => ({
  JobOfferError: class JobOfferError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  addJobOffer: vi.fn(),
}));

vi.mock("./services/job-analysis.service.js", () => ({
  JobAnalysisError: class JobAnalysisError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  analyzeJobOffer: vi.fn(),
}));

vi.mock("./services/profile-comparison.service.js", () => ({
  ProfileComparisonError: class ProfileComparisonError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  compareProfiles: vi.fn(),
  getProfileComparison: vi.fn(),
}));

vi.mock("./services/profile-match-presentation.service.js", () => ({
  ProfileMatchPresentationError: class ProfileMatchPresentationError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  presentProfileMatch: vi.fn(),
}));

vi.mock("./services/optimized-cv.service.js", () => ({
  OptimizedCvError: class OptimizedCvError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  generateOptimizedCv: vi.fn(),
  getOptimizedCv: vi.fn(),
  saveOptimizedCv: vi.fn(),
  readOptimizedCvPhoto: vi.fn(),
}));

vi.mock("./services/cover-letter.service.js", () => ({
  CoverLetterError: class CoverLetterError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  generateCoverLetter: vi.fn(),
  getCoverLetter: vi.fn(),
  saveCoverLetter: vi.fn(),
}));

vi.mock("./services/export.service.js", () => ({
  ExportError: class ExportError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
    ) {
      super(message);
    }
  },
  validateExportDocumentType: vi.fn((value: unknown) => {
    if (value === "optimized-cv" || value === "cover-letter") {
      return value;
    }
    const error = new Error(
      'document must be "optimized-cv" or "cover-letter".',
    ) as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }),
  validatePresentationLanguage: vi.fn((value: unknown) => {
    if (value === "es" || value === "en" || value === "fr") {
      return value;
    }
    const error = new Error(
      'presentationLanguage must be one of "es", "en", or "fr".',
    ) as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }),
  exportApplicationDocument: vi.fn(),
  previewExportDocument: vi.fn(),
}));

import { app } from "./app.js";
import {
  addApplication,
  ApplicationError,
  getApplication,
  listApplications,
  removeApplication,
} from "./services/application.service.js";
import {
  authenticateWithGoogle,
  AuthenticationError,
  getAuthenticatedUser,
  logout,
} from "./services/auth.service.js";
import {
  CoverLetterError,
  generateCoverLetter,
  getCoverLetter,
  saveCoverLetter,
} from "./services/cover-letter.service.js";
import {
  analyzeJobOffer,
  JobAnalysisError,
} from "./services/job-analysis.service.js";
import { addJobOffer, JobOfferError } from "./services/job-offer.service.js";
import { extractMasterCv } from "./services/master-cv-extraction.service.js";
import {
  getMasterCvPhoto,
  replaceMasterCvPhoto,
  removeMasterCvPhoto,
  updateMasterCvPhotoPosition,
} from "./services/master-cv-photo.service.js";
import { addMasterCv, getMasterCv } from "./services/master-cv.service.js";
import {
  generateOptimizedCv,
  getOptimizedCv,
  OptimizedCvError,
  readOptimizedCvPhoto,
  saveOptimizedCv,
} from "./services/optimized-cv.service.js";
import {
  compareProfiles,
  getProfileComparison,
  ProfileComparisonError,
} from "./services/profile-comparison.service.js";
import {
  presentProfileMatch,
  ProfileMatchPresentationError,
} from "./services/profile-match-presentation.service.js";
import {
  exportApplicationDocument,
  ExportError,
  previewExportDocument,
} from "./services/export.service.js";

const user = {
  id: "4e9c843b-5c3d-4e65-8514-7de898b2aca6",
  name: "Taylor Smith",
  email: "taylor@example.com",
  avatar: "https://example.com/avatar.png",
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
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

  it("sets SameSite=None and Secure on the session cookie in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(authenticateWithGoogle).mockResolvedValue({
      sessionId: "opaque-session-id",
      user,
    });

    const response = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "firebase-id-token" });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]?.[0]).toContain("SameSite=None");
    expect(response.headers["set-cookie"]?.[0]).toContain("Secure");
  });

  it("does not expose internal error details to the client", async () => {
    vi.mocked(authenticateWithGoogle).mockRejectedValue(
      new Error("database connection failed"),
    );

    const response = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "firebase-id-token" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal server error." });
    expect(JSON.stringify(response.body)).not.toContain("database connection");
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

  it("clears the application session on logout", async () => {
    vi.mocked(logout).mockResolvedValue();

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: false });
    expect(logout).toHaveBeenCalledWith("opaque-session-id");
    expect(response.headers["set-cookie"]?.[0]).toContain(
      "career_copilot_session=",
    );
    expect(response.headers["set-cookie"]?.[0]).toMatch(/Max-Age=0|Expires=/i);
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
        professionalTitle: null,
        email: "taylor@example.com",
        phone: null,
        location: null,
        linkedin: null,
        website: null,
      },
      professionalSummary: null,
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      personalProjects: [],
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
    expect(JSON.stringify(response.body)).not.toContain("photo");
  });

  it("requires authentication for Master CV photo routes", async () => {
    const responses = await Promise.all([
      request(app).put("/api/master-cv/photo"),
      request(app).patch("/api/master-cv/photo"),
      request(app).delete("/api/master-cv/photo"),
      request(app).get("/api/master-cv/photo"),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required." });
    }
    expect(replaceMasterCvPhoto).not.toHaveBeenCalled();
    expect(removeMasterCvPhoto).not.toHaveBeenCalled();
    expect(updateMasterCvPhotoPosition).not.toHaveBeenCalled();
    expect(getMasterCvPhoto).not.toHaveBeenCalled();
  });

  it("uploads a profile photo for the session user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(replaceMasterCvPhoto).mockResolvedValue({
      profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
      profilePhotoPositionX: 50,
      profilePhotoPositionY: 50,
    });

    const response = await request(app)
      .put("/api/master-cv/photo")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .attach("file", Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
      profilePhotoPositionX: 50,
      profilePhotoPositionY: 50,
    });
    expect(JSON.stringify(response.body)).not.toContain("https://");
    expect(replaceMasterCvPhoto).toHaveBeenCalledWith(
      user.id,
      "image/jpeg",
      expect.any(Buffer),
      undefined,
      undefined,
    );
  });

  it("updates a profile photo position for the session user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(updateMasterCvPhotoPosition).mockResolvedValue({
      profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
      profilePhotoPositionX: 25,
      profilePhotoPositionY: 75,
    });

    const response = await request(app)
      .patch("/api/master-cv/photo")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ positionX: 25, positionY: 75 });

    expect(response.status).toBe(200);
    expect(updateMasterCvPhotoPosition).toHaveBeenCalledWith(user.id, 25, 75);
    expect(response.body).toMatchObject({
      profilePhotoPositionX: 25,
      profilePhotoPositionY: 75,
    });
  });

  it("rejects a GIF profile photo", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

    const response = await request(app)
      .put("/api/master-cv/photo")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .attach("file", Buffer.from("GIF89a"), {
        filename: "photo.gif",
        contentType: "image/gif",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Only JPEG, PNG, and WEBP images are supported.",
    });
    expect(replaceMasterCvPhoto).not.toHaveBeenCalled();
  });
});

describe("Job Analysis API", () => {
  it("protects every application endpoint", async () => {
    const responses = await Promise.all([
      request(app).post("/api/applications"),
      request(app).get("/api/applications"),
      request(app).get("/api/applications/application-id"),
      request(app).delete("/api/applications/application-id"),
      request(app).post("/api/applications/application-id/job-offer"),
      request(app).post("/api/applications/application-id/job-analysis"),
      request(app).post("/api/applications/application-id/profile-comparison"),
      request(app).post(
        "/api/applications/application-id/profile-comparison/presentation",
      ),
      request(app).get("/api/applications/application-id/profile-comparison"),
      request(app).post("/api/applications/application-id/optimized-cv"),
      request(app).get("/api/applications/application-id/optimized-cv"),
      request(app).get("/api/applications/application-id/optimized-cv/photo"),
      request(app).post("/api/applications/application-id/cover-letter"),
      request(app).get("/api/applications/application-id/cover-letter"),
      request(app).post("/api/applications/application-id/export"),
      request(app).post("/api/applications/application-id/export/preview"),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required." });
    }
    expect(addApplication).not.toHaveBeenCalled();
    expect(getApplication).not.toHaveBeenCalled();
    expect(listApplications).not.toHaveBeenCalled();
    expect(removeApplication).not.toHaveBeenCalled();
    expect(addJobOffer).not.toHaveBeenCalled();
    expect(analyzeJobOffer).not.toHaveBeenCalled();
    expect(compareProfiles).not.toHaveBeenCalled();
    expect(getProfileComparison).not.toHaveBeenCalled();
    expect(presentProfileMatch).not.toHaveBeenCalled();
    expect(generateOptimizedCv).not.toHaveBeenCalled();
    expect(readOptimizedCvPhoto).not.toHaveBeenCalled();
    expect(exportApplicationDocument).not.toHaveBeenCalled();
    expect(previewExportDocument).not.toHaveBeenCalled();
  });

  it.each([
    ["job-analysis", analyzeJobOffer],
    ["profile-comparison", compareProfiles],
    ["optimized-cv", generateOptimizedCv],
    ["cover-letter", generateCoverLetter],
  ] as const)(
    "rejects invalid locales before calling %s generation",
    async (endpoint, service) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

      for (const body of [{}, { locale: "de" }, { locale: 42 }]) {
        const response = await request(app)
          .post(`/api/applications/application-id/${endpoint}`)
          .set("Cookie", "career_copilot_session=opaque-session-id")
          .send(body);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: 'locale must be one of "es", "en", or "fr".',
        });
      }

      expect(service).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["job-analysis", analyzeJobOffer],
    ["profile-comparison", compareProfiles],
    ["optimized-cv", generateOptimizedCv],
    ["cover-letter", generateCoverLetter],
  ] as const)(
    "accepts every supported locale for %s generation",
    async (endpoint, service) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
      vi.mocked(service).mockResolvedValue(undefined as never);

      for (const locale of ["es", "en", "fr"] as const) {
        const response = await request(app)
          .post(`/api/applications/application-id/${endpoint}`)
          .set("Cookie", "career_copilot_session=opaque-session-id")
          .send({ locale });

        expect(response.status).toBe(200);
        expect(service).toHaveBeenCalledWith("application-id", user.id, locale);
      }
    },
  );

  it("creates an application for the authenticated user", async () => {
    const application = { id: "application-id", status: "NEW" };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(addApplication).mockResolvedValue(application as never);

    const response = await request(app)
      .post("/api/applications")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ application });
    expect(addApplication).toHaveBeenCalledWith(user.id);
  });

  it("lists the authenticated user's persisted applications", async () => {
    const applications = [
      {
        id: "application-id",
        status: "NEW",
        jobOffer: { title: "Software Engineer", company: "Acme" },
        jobAnalysis: null,
      },
    ];
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(listApplications).mockResolvedValue(applications as never);

    const response = await request(app)
      .get("/api/applications")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ applications });
    expect(listApplications).toHaveBeenCalledWith(user.id);
  });

  it("deletes an application owned by the authenticated user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(removeApplication).mockResolvedValue();

    const response = await request(app)
      .delete("/api/applications/application-id")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(removeApplication).toHaveBeenCalledWith("application-id", user.id);
  });

  it("saves the original job offer for an owned application", async () => {
    const input = { originalDescription: "a".repeat(300) };
    const jobOffer = { id: "job-offer-id", ...input };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(addJobOffer).mockResolvedValue(jobOffer as never);

    const response = await request(app)
      .post("/api/applications/application-id/job-offer")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send(input);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ jobOffer });
    expect(addJobOffer).toHaveBeenCalledWith("application-id", user.id, input);
  });

  it("returns validation errors without exposing internals", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(addJobOffer).mockRejectedValue(
      new JobOfferError("The job description is too short.", 400),
    );

    const response = await request(app)
      .post("/api/applications/application-id/job-offer")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ originalDescription: "short" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "The job description is too short.",
    });
  });

  it("returns and persists the structured analysis", async () => {
    const jobAnalysis = {
      title: "Software Engineer",
      company: null,
      requiredSkills: ["TypeScript"],
      responsibilities: ["Build APIs"],
      atsKeywords: ["TypeScript"],
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(analyzeJobOffer).mockResolvedValue(jobAnalysis as never);

    const response = await request(app)
      .post("/api/applications/application-id/job-analysis")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ locale: "fr" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ jobAnalysis });
    expect(analyzeJobOffer).toHaveBeenCalledWith(
      "application-id",
      user.id,
      "fr",
    );
  });

  it("returns the documented extraction error", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(analyzeJobOffer).mockRejectedValue(
      new JobAnalysisError("We couldn't analyze this job description.", 502),
    );

    const response = await request(app)
      .post("/api/applications/application-id/job-analysis")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ locale: "en" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      message: "We couldn't analyze this job description.",
    });
  });

  it("returns the complete profile comparison for the authenticated user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(compareProfiles).mockResolvedValue({
      matchingSkills: ["TypeScript", "REST APIs"],
      missingSkills: ["Docker", "AWS"],
      strengths: [
        "TypeScript experience directly supports the role's core requirement.",
      ],
      weaknesses: [
        "Docker is required by the role but is not demonstrated in the Master CV.",
      ],
      alignmentScore: 72,
      alignmentReasoning:
        "Relevant backend experience supports the role, but missing cloud skills limit readiness.",
      recommendation:
        "Good opportunity. Improve your CV before applying so the supported experience is clear.",
      workingLanguage: "es",
    });

    const response = await request(app)
      .post("/api/applications/application-id/profile-comparison")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ locale: "es" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      matchingSkills: ["TypeScript", "REST APIs"],
      missingSkills: ["Docker", "AWS"],
      strengths: [
        "TypeScript experience directly supports the role's core requirement.",
      ],
      weaknesses: [
        "Docker is required by the role but is not demonstrated in the Master CV.",
      ],
      alignmentScore: 72,
      alignmentReasoning:
        "Relevant backend experience supports the role, but missing cloud skills limit readiness.",
      recommendation:
        "Good opportunity. Improve your CV before applying so the supported experience is clear.",
      workingLanguage: "es",
    });
    expect(compareProfiles).toHaveBeenCalledWith(
      "application-id",
      user.id,
      "es",
    );
  });

  it.each(["Master CV not found.", "Job analysis not found."])(
    "returns 404 when a comparison input is missing: %s",
    async (message) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
      vi.mocked(compareProfiles).mockRejectedValue(
        new ProfileComparisonError(message, 404),
      );

      const response = await request(app)
        .post("/api/applications/application-id/profile-comparison")
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send({ locale: "en" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message });
    },
  );

  it("returns the saved Profile Match for the authenticated user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getProfileComparison).mockResolvedValue({
      matchingSkills: ["TypeScript", "REST APIs"],
      missingSkills: ["Docker", "AWS"],
      strengths: [
        "TypeScript experience directly supports the role's core requirement.",
      ],
      weaknesses: [
        "Docker is required by the role but is not demonstrated in the Master CV.",
      ],
      alignmentScore: 72,
      alignmentReasoning:
        "Relevant backend experience supports the role, but missing cloud skills limit readiness.",
      recommendation:
        "Good opportunity. Improve your CV before applying so the supported experience is clear.",
      workingLanguage: "es",
    });

    const response = await request(app)
      .get("/api/applications/application-id/profile-comparison")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      matchingSkills: ["TypeScript", "REST APIs"],
      missingSkills: ["Docker", "AWS"],
      strengths: [
        "TypeScript experience directly supports the role's core requirement.",
      ],
      weaknesses: [
        "Docker is required by the role but is not demonstrated in the Master CV.",
      ],
      alignmentScore: 72,
      alignmentReasoning:
        "Relevant backend experience supports the role, but missing cloud skills limit readiness.",
      recommendation:
        "Good opportunity. Improve your CV before applying so the supported experience is clear.",
      workingLanguage: "es",
    });
    expect(getProfileComparison).toHaveBeenCalledWith(
      "application-id",
      user.id,
    );
  });

  it("returns persisted workingLanguage null for a legacy Profile Match", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getProfileComparison).mockResolvedValue({
      matchingSkills: ["TypeScript"],
      missingSkills: [],
      strengths: ["Relevant experience"],
      weaknesses: [],
      alignmentScore: 70,
      alignmentReasoning: "Core skills are supported.",
      recommendation: "Good opportunity.",
      workingLanguage: null,
    });

    const response = await request(app)
      .get("/api/applications/application-id/profile-comparison")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body.workingLanguage).toBeNull();
  });

  it("returns 404 when no saved Profile Match exists", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getProfileComparison).mockRejectedValue(
      new ProfileComparisonError("Profile Match not found.", 404),
    );

    const response = await request(app)
      .get("/api/applications/application-id/profile-comparison")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Profile Match not found." });
  });

  it("rejects invalid locales before preparing a Profile Match presentation", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

    for (const body of [{}, { locale: "de" }, { locale: 42 }]) {
      const response = await request(app)
        .post(
          "/api/applications/application-id/profile-comparison/presentation",
        )
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'locale must be one of "es", "en", or "fr".',
      });
    }

    expect(presentProfileMatch).not.toHaveBeenCalled();
    expect(compareProfiles).not.toHaveBeenCalled();
    expect(getProfileComparison).not.toHaveBeenCalled();
  });

  it.each(["es", "en", "fr"] as const)(
    "returns a Profile Match presentation for locale %s",
    async (locale) => {
      const presentation = {
        matchingSkills: ["TypeScript"],
        missingSkills: ["Docker"],
        strengths: ["TypeScript experience supports the role."],
        weaknesses: ["Docker is missing."],
        alignmentScore: 72,
        alignmentReasoning: "Relevant experience with a Docker gap.",
        recommendation: "Good opportunity.",
        workingLanguage: "es" as const,
      };
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
      vi.mocked(presentProfileMatch).mockResolvedValue(presentation);

      const response = await request(app)
        .post(
          "/api/applications/application-id/profile-comparison/presentation",
        )
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send({ locale });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(presentation);
      expect(presentProfileMatch).toHaveBeenCalledWith(
        "application-id",
        user.id,
        locale,
      );
      expect(compareProfiles).not.toHaveBeenCalled();
    },
  );

  it("returns 404 when presentation has no saved Profile Match", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(presentProfileMatch).mockRejectedValue(
      new ProfileMatchPresentationError("Profile Match not found.", 404),
    );

    const response = await request(app)
      .post("/api/applications/application-id/profile-comparison/presentation")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ locale: "fr" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Profile Match not found." });
  });

  it("returns 502 when Profile Match presentation adaptation fails", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(presentProfileMatch).mockRejectedValue(
      new ProfileMatchPresentationError(
        "We couldn't prepare this Profile Match in the selected language.",
        502,
      ),
    );

    const response = await request(app)
      .post("/api/applications/application-id/profile-comparison/presentation")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ locale: "en" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      message:
        "We couldn't prepare this Profile Match in the selected language.",
    });
    expect(compareProfiles).not.toHaveBeenCalled();
  });

  it("returns the generated Optimized CV for the authenticated user", async () => {
    const optimizedCv = {
      fullName: "Taylor Smith",
      professionalTitle: null,
      email: "taylor@example.com",
      phone: null,
      location: null,
      linkedin: null,
      website: null,
      professionalSummary: "TypeScript engineer building APIs.",
      experience: [
        {
          jobTitle: "Software Engineer",
          company: "Example",
          location: null,
          startDate: null,
          endDate: null,
          current: true,
          description: "Built TypeScript REST APIs.",
        },
      ],
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
      workingLanguage: "fr" as const,
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(generateOptimizedCv).mockResolvedValue(optimizedCv);

    const response = await request(app)
      .post("/api/applications/application-id/optimized-cv")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ locale: "fr" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ optimizedCv });
    expect(generateOptimizedCv).toHaveBeenCalledWith(
      "application-id",
      user.id,
      "fr",
    );
  });

  it.each(["Master CV not found.", "Job analysis not found."])(
    "returns 404 when Optimized CV generation input is missing: %s",
    async (message) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
      vi.mocked(generateOptimizedCv).mockRejectedValue(
        new OptimizedCvError(message, 404),
      );

      const response = await request(app)
        .post("/api/applications/application-id/optimized-cv")
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send({ locale: "en" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message });
    },
  );

  it("returns the saved Optimized CV for the authenticated user", async () => {
    const optimizedCv = {
      fullName: "Taylor Smith",
      professionalTitle: null,
      email: "taylor@example.com",
      phone: null,
      location: null,
      linkedin: null,
      website: null,
      professionalSummary: "TypeScript engineer building APIs.",
      experience: [
        {
          jobTitle: "Software Engineer",
          company: "Example",
          location: null,
          startDate: null,
          endDate: null,
          current: true,
          description: "Built TypeScript REST APIs.",
        },
      ],
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
      workingLanguage: null,
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getOptimizedCv).mockResolvedValue(optimizedCv);

    const response = await request(app)
      .get("/api/applications/application-id/optimized-cv")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ optimizedCv });
    expect(getOptimizedCv).toHaveBeenCalledWith("application-id", user.id);
  });

  it("returns 404 when no saved Optimized CV exists", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getOptimizedCv).mockRejectedValue(
      new OptimizedCvError("Optimized CV not found.", 404),
    );

    const response = await request(app)
      .get("/api/applications/application-id/optimized-cv")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Optimized CV not found." });
  });

  it("saves the Optimized CV for the authenticated user", async () => {
    const optimizedCv = {
      fullName: "Taylor Smith",
      professionalTitle: null,
      email: "taylor@example.com",
      phone: null,
      location: null,
      linkedin: null,
      website: null,
      professionalSummary: "TypeScript engineer building APIs.",
      experience: [
        {
          jobTitle: "Software Engineer",
          company: "Example",
          location: null,
          startDate: null,
          endDate: null,
          current: true,
          description: "Built TypeScript REST APIs.",
        },
      ],
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
      workingLanguage: "es" as const,
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(saveOptimizedCv).mockResolvedValue(optimizedCv);

    const response = await request(app)
      .put("/api/applications/application-id/optimized-cv")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send(optimizedCv);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ optimizedCv });
    expect(saveOptimizedCv).toHaveBeenCalledWith(
      "application-id",
      user.id,
      optimizedCv,
    );
  });

  it("returns 400 when Optimized CV save payload is invalid", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(saveOptimizedCv).mockRejectedValue(
      new OptimizedCvError("fullName is required.", 400),
    );

    const response = await request(app)
      .put("/api/applications/application-id/optimized-cv")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "fullName is required." });
  });

  it("returns the generated Cover Letter for the authenticated user", async () => {
    const coverLetter = {
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      date: "August 7, 2026",
      companyName: "Acme",
      greeting: "Dear Hiring Manager,",
      introduction:
        "I am writing to apply for the Software Engineer role at Acme.",
      professionalValue:
        "My experience building TypeScript APIs aligns with your requirements.",
      motivation:
        "I am interested in contributing to Acme's product engineering team.",
      closing:
        "Thank you for your consideration. I am available for an interview.",
      signature: "Taylor Smith",
      workingLanguage: "es" as const,
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(generateCoverLetter).mockResolvedValue(coverLetter);

    const response = await request(app)
      .post("/api/applications/application-id/cover-letter")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ locale: "es" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ coverLetter });
    expect(generateCoverLetter).toHaveBeenCalledWith(
      "application-id",
      user.id,
      "es",
    );
  });

  it.each([
    "Master CV not found.",
    "Job analysis not found.",
    "Optimized CV not found.",
  ])(
    "returns 404 when Cover Letter generation input is missing: %s",
    async (message) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
      vi.mocked(generateCoverLetter).mockRejectedValue(
        new CoverLetterError(message, 404),
      );

      const response = await request(app)
        .post("/api/applications/application-id/cover-letter")
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send({ locale: "en" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message });
    },
  );

  it("returns the saved Cover Letter for the authenticated user", async () => {
    const coverLetter = {
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      date: "August 7, 2026",
      companyName: "Acme",
      greeting: "Dear Hiring Manager,",
      introduction:
        "I am writing to apply for the Software Engineer role at Acme.",
      professionalValue:
        "My experience building TypeScript APIs aligns with your requirements.",
      motivation:
        "I am interested in contributing to Acme's product engineering team.",
      closing:
        "Thank you for your consideration. I am available for an interview.",
      signature: "Taylor Smith",
      workingLanguage: null,
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getCoverLetter).mockResolvedValue(coverLetter);

    const response = await request(app)
      .get("/api/applications/application-id/cover-letter")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ coverLetter });
    expect(getCoverLetter).toHaveBeenCalledWith("application-id", user.id);
  });

  it("returns 404 when no saved Cover Letter exists", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getCoverLetter).mockRejectedValue(
      new CoverLetterError("Cover Letter not found.", 404),
    );

    const response = await request(app)
      .get("/api/applications/application-id/cover-letter")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Cover Letter not found." });
  });

  it("saves the Cover Letter for the authenticated user", async () => {
    const coverLetter = {
      candidateName: "Taylor Smith",
      email: "taylor@example.com",
      phone: "+1 555 0100",
      date: "August 7, 2026",
      companyName: "Acme",
      greeting: "Dear Hiring Manager,",
      introduction:
        "I am writing to apply for the Software Engineer role at Acme.",
      professionalValue:
        "My experience building TypeScript APIs aligns with your requirements.",
      motivation:
        "I am interested in contributing to Acme's product engineering team.",
      closing:
        "Thank you for your consideration. I am available for an interview.",
      signature: "Taylor Smith",
      workingLanguage: "en" as const,
    };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(saveCoverLetter).mockResolvedValue(coverLetter);

    const response = await request(app)
      .put("/api/applications/application-id/cover-letter")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send(coverLetter);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ coverLetter });
    expect(saveCoverLetter).toHaveBeenCalledWith(
      "application-id",
      user.id,
      coverLetter,
    );
  });

  it("returns 400 when Cover Letter save payload is invalid", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(saveCoverLetter).mockRejectedValue(
      new CoverLetterError("candidateName is required.", 400),
    );

    const response = await request(app)
      .put("/api/applications/application-id/cover-letter")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "candidateName is required." });
  });

  it("does not reveal applications owned by another user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(getApplication).mockRejectedValue(
      new ApplicationError("Application not found.", 404),
    );

    const response = await request(app)
      .get("/api/applications/another-users-application")
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Application not found." });
    expect(getApplication).toHaveBeenCalledWith(
      "another-users-application",
      user.id,
    );
  });

  it("returns a downloadable PDF for a selected export document", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(exportApplicationDocument).mockResolvedValue({
      buffer: Buffer.from("%PDF-1.4 export"),
      filename: "juan-perez_cv.pdf",
      contentType: "application/pdf",
    });

    const response = await request(app)
      .post("/api/applications/application-id/export")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ document: "optimized-cv", presentationLanguage: "es" });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toBe(
      'attachment; filename="juan-perez_cv.pdf"',
    );
    expect(response.body.toString()).toContain("%PDF-1.4 export");
    expect(exportApplicationDocument).toHaveBeenCalledWith(
      "application-id",
      user.id,
      "optimized-cv",
      "es",
    );
    expect(generateOptimizedCv).not.toHaveBeenCalled();
    expect(generateCoverLetter).not.toHaveBeenCalled();
  });

  it.each(["es", "en", "fr"] as const)(
    "accepts presentationLanguage %s for PDF export",
    async (presentationLanguage) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
      vi.mocked(exportApplicationDocument).mockResolvedValue({
        buffer: Buffer.from("%PDF-1.4 export"),
        filename: "juan-perez_cv.pdf",
        contentType: "application/pdf",
      });

      const response = await request(app)
        .post("/api/applications/application-id/export")
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send({ document: "cover-letter", presentationLanguage });

      expect(response.status).toBe(200);
      expect(exportApplicationDocument).toHaveBeenCalledWith(
        "application-id",
        user.id,
        "cover-letter",
        presentationLanguage,
      );
    },
  );

  it("uses one Presentation Language for both package documents", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(exportApplicationDocument).mockResolvedValue({
      buffer: Buffer.from("%PDF-1.4 export"),
      filename: "juan-perez_cv.pdf",
      contentType: "application/pdf",
    });

    for (const document of ["optimized-cv", "cover-letter"] as const) {
      const response = await request(app)
        .post("/api/applications/application-id/export")
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send({ document, presentationLanguage: "fr" });

      expect(response.status).toBe(200);
    }

    expect(
      vi
        .mocked(exportApplicationDocument)
        .mock.calls.map((call) => [call[2], call[3]]),
    ).toEqual([
      ["optimized-cv", "fr"],
      ["cover-letter", "fr"],
    ]);
  });

  it.each([
    { document: "optimized-cv" },
    { document: "optimized-cv", presentationLanguage: "de" },
    { document: "optimized-cv", presentationLanguage: 42 },
  ])(
    "rejects invalid export presentationLanguage before preparing documents %j",
    async (body) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

      const response = await request(app)
        .post("/api/applications/application-id/export")
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'presentationLanguage must be one of "es", "en", or "fr".',
      });
      expect(exportApplicationDocument).not.toHaveBeenCalled();
      expect(previewExportDocument).not.toHaveBeenCalled();
    },
  );

  it("returns 400 when export prerequisites are missing", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(exportApplicationDocument).mockRejectedValue(
      new ExportError(
        "A saved Cover Letter is required for this document.",
        400,
      ),
    );

    const response = await request(app)
      .post("/api/applications/application-id/export")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ document: "cover-letter", presentationLanguage: "en" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "A saved Cover Letter is required for this document.",
    });
  });

  it("returns a presentation preview shell for the selected language", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(previewExportDocument).mockResolvedValue({
      document: "optimized-cv",
      presentationLanguage: "fr",
      data: {
        fullName: "Taylor Smith",
        professionalSummary: "Saved summary",
        workingLanguage: "es",
      } as never,
      chrome: {
        professionalSummary: "Résumé professionnel",
        experience: "Expérience",
        education: "Formation",
        skills: "Compétences",
        languages: "Langues",
        certifications: "Certifications",
        personalProjects: "Projets personnels",
        present: "Aujourd'hui",
        openProject: "Ouvrir le projet",
      },
    });

    const response = await request(app)
      .post("/api/applications/application-id/export/preview")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ document: "optimized-cv", presentationLanguage: "fr" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      document: "optimized-cv",
      presentationLanguage: "fr",
      data: {
        fullName: "Taylor Smith",
        professionalSummary: "Saved summary",
        workingLanguage: "es",
      },
      chrome: {
        professionalSummary: "Résumé professionnel",
        experience: "Expérience",
        education: "Formation",
        skills: "Compétences",
        languages: "Langues",
        certifications: "Certifications",
        personalProjects: "Projets personnels",
        present: "Aujourd'hui",
        openProject: "Ouvrir le projet",
      },
    });
    expect(previewExportDocument).toHaveBeenCalledWith(
      "application-id",
      user.id,
      "optimized-cv",
      "fr",
    );
    expect(exportApplicationDocument).not.toHaveBeenCalled();
    expect(generateOptimizedCv).not.toHaveBeenCalled();
    expect(generateCoverLetter).not.toHaveBeenCalled();
  });

  it.each([
    { document: "cover-letter" },
    { document: "cover-letter", presentationLanguage: "de" },
  ])(
    "rejects invalid preview presentationLanguage before preparing documents %j",
    async (body) => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

      const response = await request(app)
        .post("/api/applications/application-id/export/preview")
        .set("Cookie", "career_copilot_session=opaque-session-id")
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'presentationLanguage must be one of "es", "en", or "fr".',
      });
      expect(previewExportDocument).not.toHaveBeenCalled();
    },
  );

  it("returns 502 when export adaptation fails", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(exportApplicationDocument).mockRejectedValue(
      new ExportError(
        "We couldn't prepare this document in the selected presentation language.",
        502,
      ),
    );

    const response = await request(app)
      .post("/api/applications/application-id/export")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ document: "optimized-cv", presentationLanguage: "fr" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      message:
        "We couldn't prepare this document in the selected presentation language.",
    });
    expect(generateOptimizedCv).not.toHaveBeenCalled();
    expect(generateCoverLetter).not.toHaveBeenCalled();
  });

  it("returns 502 when preview adaptation fails", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(previewExportDocument).mockRejectedValue(
      new ExportError(
        "We couldn't prepare this document in the selected presentation language.",
        502,
      ),
    );

    const response = await request(app)
      .post("/api/applications/application-id/export/preview")
      .set("Cookie", "career_copilot_session=opaque-session-id")
      .send({ document: "cover-letter", presentationLanguage: "es" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      message:
        "We couldn't prepare this document in the selected presentation language.",
    });
    expect(exportApplicationDocument).not.toHaveBeenCalled();
  });
});

describe("production HTTP configuration", () => {
  it("reports a healthy process without exposing internals", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows credentialed requests from the configured frontend origin", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("does not reflect an unknown CORS origin", async () => {
    vi.stubEnv("FRONTEND_ORIGIN", "https://app.example.com");

    const response = await request(app)
      .get("/health")
      .set("Origin", "https://evil.example");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
