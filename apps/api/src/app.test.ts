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
} from "./services/auth.service.js";
import {
  analyzeJobOffer,
  JobAnalysisError,
} from "./services/job-analysis.service.js";
import { addJobOffer, JobOfferError } from "./services/job-offer.service.js";
import { extractMasterCv } from "./services/master-cv-extraction.service.js";
import { addMasterCv, getMasterCv } from "./services/master-cv.service.js";
import {
  compareProfiles,
  ProfileComparisonError,
} from "./services/profile-comparison.service.js";

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
  });

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
      .set("Cookie", "career_copilot_session=opaque-session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ jobAnalysis });
    expect(analyzeJobOffer).toHaveBeenCalledWith("application-id", user.id);
  });

  it("returns the documented extraction error", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(analyzeJobOffer).mockRejectedValue(
      new JobAnalysisError("We couldn't analyze this job description.", 502),
    );

    const response = await request(app)
      .post("/api/applications/application-id/job-analysis")
      .set("Cookie", "career_copilot_session=opaque-session-id");

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
    });

    const response = await request(app)
      .post("/api/applications/application-id/profile-comparison")
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
    });
    expect(compareProfiles).toHaveBeenCalledWith("application-id", user.id);
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
        .set("Cookie", "career_copilot_session=opaque-session-id");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message });
    },
  );

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
});
