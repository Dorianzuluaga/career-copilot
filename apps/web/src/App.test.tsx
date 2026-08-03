import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import App from "./App";
import { ApplicationCard } from "./components/ApplicationCard";
import { ApplicationCoverLetter } from "./components/ApplicationCoverLetter";
import { ApplicationExport } from "./components/ApplicationExport";
import { ApplicationJobAnalysis } from "./components/ApplicationJobAnalysis";
import { ApplicationOptimizedCv } from "./components/ApplicationOptimizedCv";
import { ApplicationOverview } from "./components/ApplicationOverview";
import { ApplicationProfileMatch } from "./components/ApplicationProfileMatch";
import { ApplicationWorkspace } from "./components/ApplicationWorkspace";
import { jobDescriptionError } from "./components/JobAnalysisForm";
import { MasterCvForm } from "./components/MasterCvForm";
import { MasterCvImport } from "./components/MasterCvImport";
import { AuthContext } from "./context/auth-context";
import { masterCvInputFromExtraction } from "./services/master-cv";
import type { AuthenticatedUser } from "./types/auth";
import type { PersistedApplication } from "./types/job-analysis";

const authenticatedUser: AuthenticatedUser = {
  id: "user-id",
  name: "Taylor Smith",
  email: "taylor@example.com",
  avatar: null,
};

function renderApp(
  path: string,
  user: AuthenticatedUser | null = authenticatedUser,
) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider
        value={{
          user,
          isLoading: false,
          signIn: () => Promise.resolve(),
        }}
      >
        <App />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("renders the persisted dashboard loading state", () => {
    const markup = renderApp("/dashboard");

    expect(markup).toContain("Application dashboard");
    expect(markup).toContain("New Application");
    expect(markup).toContain("Loading applications");
  });

  it("renders persisted application actions without metadata editing", () => {
    const application: PersistedApplication = {
      id: "application-id",
      userId: "user-id",
      status: "NEW",
      jobOffer: null,
      jobAnalysis: null,
      createdAt: "2026-07-28T12:00:00.000Z",
      updatedAt: "2026-07-28T12:00:00.000Z",
    };
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationCard
          application={application}
          isDeleting={false}
          onDelete={() => Promise.resolve()}
        />
      </MemoryRouter>,
    );

    expect(markup).toContain("/applications/application-id");
    expect(markup).toContain("Open");
    expect(markup).toContain("Delete");
    expect(markup).not.toContain("Edit");
  });

  it("renders Overview and Job Analysis as available workspace sections", () => {
    const application: PersistedApplication = {
      id: "application-id",
      userId: "user-id",
      status: "NEW",
      jobOffer: null,
      jobAnalysis: null,
      createdAt: "2026-07-28T12:00:00.000Z",
      updatedAt: "2026-07-29T12:00:00.000Z",
    };
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status={application.status}
          activeSection="overview"
          isJobAnalysisCompleted={false}
          isProfileMatchCompleted={false}
          isOptimizedCvCompleted={false}
          onSectionChange={() => undefined}
        >
          <ApplicationOverview
            application={application}
            company="Example Company"
            title="Frontend Engineer"
          />
        </ApplicationWorkspace>
      </MemoryRouter>,
    );

    expect(markup).toContain("Application workspace content");
    expect(markup).toContain("Overview");
    expect(markup).toContain("Example Company");
    expect(markup).toContain("Frontend Engineer");
    expect(markup).toContain("Last updated");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Job Analysis");
    expect(markup).toContain("Profile Match");
    expect(markup).toContain("Optimized CV");
    expect(markup).toContain("Cover Letter");
    expect(markup).toContain("Export");
    expect(markup).toContain("Completed sections: None");
    expect(markup).toContain("Next recommended step:");
    expect(markup.match(/<button[^>]*disabled=""/g)).toHaveLength(4);
    expect(markup).not.toContain("Coming Soon");
  });

  it("renders the existing structured analysis inside the workspace section", () => {
    const application: PersistedApplication = {
      id: "application-id",
      userId: "user-id",
      status: "NEW",
      jobOffer: {
        id: "offer-id",
        applicationId: "application-id",
        title: null,
        company: null,
        originalDescription: "Original job description",
        createdAt: "2026-07-28T12:00:00.000Z",
        updatedAt: "2026-07-28T12:00:00.000Z",
      },
      jobAnalysis: {
        id: "analysis-id",
        applicationId: "application-id",
        title: "Frontend Engineer",
        company: "Example Company",
        employmentType: "Full-time",
        location: "Remote",
        experienceLevel: "Senior",
        education: null,
        languages: ["English"],
        summary: "Build accessible web applications.",
        requiredSkills: ["TypeScript"],
        responsibilities: ["Develop user interfaces"],
        atsKeywords: ["React"],
        analysisVersion: 1,
        createdAt: "2026-07-28T12:00:00.000Z",
        updatedAt: "2026-07-28T12:00:00.000Z",
      },
      createdAt: "2026-07-28T12:00:00.000Z",
      updatedAt: "2026-07-29T12:00:00.000Z",
    };

    const markup = renderToStaticMarkup(
      <ApplicationJobAnalysis application={application} />,
    );

    expect(markup).toContain("Original job description");
    expect(markup).toContain("Job analysis");
    expect(markup).toContain("Version 1");
    expect(markup).toContain("Full-time");
    expect(markup).toContain("Remote");
    expect(markup).toContain("TypeScript");
    expect(markup).toContain("Develop user interfaces");
    expect(markup).toContain("React");
  });

  it("makes Profile Match available after Job Analysis is completed", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status="NEW"
          activeSection="job-analysis"
          isJobAnalysisCompleted
          isProfileMatchCompleted={false}
          isOptimizedCvCompleted={false}
          onSectionChange={() => undefined}
        >
          <p>Job analysis content</p>
        </ApplicationWorkspace>
      </MemoryRouter>,
    );

    expect(markup).toContain("Completed sections: Job Analysis");
    expect(markup).toContain("Next recommended step:");
    expect(markup).toContain("Profile Match");
    expect(markup.match(/<button[^>]*disabled=""/g)).toHaveLength(3);
  });

  it("renders the complete profile comparison without internal reasoning", () => {
    const markup = renderToStaticMarkup(
      <ApplicationProfileMatch
        comparison={{
          matchingSkills: ["TypeScript"],
          missingSkills: ["Docker"],
          strengths: ["Relevant frontend experience"],
          weaknesses: ["Cloud experience is not demonstrated"],
          alignmentScore: 72,
          alignmentReasoning: "Internal score reasoning",
          recommendation: "Good opportunity. Adapt your CV before applying.",
        }}
        errorMessage={null}
        isLoading={false}
        onCompare={() => undefined}
        onReturnToJobAnalysis={() => undefined}
      />,
    );

    expect(markup).toContain("ATS Match");
    expect(markup).toContain("72%");
    expect(markup).toContain("Matching Skills");
    expect(markup).toContain("TypeScript");
    expect(markup).toContain("Missing Skills");
    expect(markup).toContain("Docker");
    expect(markup).toContain("Strengths");
    expect(markup).toContain("Relevant frontend experience");
    expect(markup).toContain("Weaknesses");
    expect(markup).toContain("Cloud experience is not demonstrated");
    expect(markup).toContain("Recommendation");
    expect(markup).toContain(
      "Good opportunity. Adapt your CV before applying.",
    );
    expect(markup).not.toContain("Internal score reasoning");
    expect(markup).not.toContain("Regenerate comparison");
  });

  it("presents the Optimized CV generation and review workflow after Profile Match", () => {
    const sampleOptimizedCv = {
      fullName: "Taylor Smith",
      email: "taylor@example.com",
      phone: null,
      location: "Berlin",
      linkedin: null,
      portfolio: null,
      professionalSummary: "TypeScript engineer building APIs.",
      experience: [
        {
          jobTitle: "Software Engineer",
          company: "Example",
          location: null,
          startDate: "2022-01",
          endDate: null,
          current: true,
          description: "Built REST APIs with TypeScript.",
        },
      ],
      education: [
        {
          institution: "Example University",
          degree: "BSc",
          fieldOfStudy: "Computer Science",
          startDate: "2018-09",
          endDate: "2021-06",
          description: "Focus on distributed systems.",
        },
      ],
      skills: ["TypeScript", "Node.js"],
      languages: [{ name: "English", proficiency: "Fluent" }],
      certifications: [
        {
          name: "AWS Certified",
          issuer: "Amazon",
          issueDate: "2023-01",
          credentialUrl: null,
        },
      ],
    };

    const idleMarkup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status="NEW"
          activeSection="optimized-cv"
          isJobAnalysisCompleted
          isProfileMatchCompleted
          isOptimizedCvCompleted={false}
          onSectionChange={() => undefined}
        >
          <ApplicationOptimizedCv
            errorMessage={null}
            isLoading={false}
            onChange={() => undefined}
            onGenerate={() => undefined}
            optimizedCv={null}
          />
        </ApplicationWorkspace>
      </MemoryRouter>,
    );

    expect(idleMarkup).toContain('aria-current="page"');
    expect(idleMarkup).toContain("Optimized CV");
    expect(idleMarkup).toContain("Generate Optimized CV");
    expect(idleMarkup).toContain(
      "Generate an Optimized CV tailored to this job opportunity",
    );
    expect(idleMarkup).toContain("Next recommended step:");
    expect(idleMarkup).toContain("Optimized CV");
    expect(idleMarkup).toContain("Cover Letter");
    expect(idleMarkup).toContain("Locked");
    expect(idleMarkup).not.toContain("Continue to Cover Letter");
    expect(idleMarkup).not.toContain("<textarea");
    expect(idleMarkup).not.toContain('type="text"');

    const loadingMarkup = renderToStaticMarkup(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={null}
      />,
    );
    expect(loadingMarkup).toContain("Generating your Optimized CV…");

    const reviewMarkup = renderToStaticMarkup(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(reviewMarkup).toContain("Generate again");
    expect(reviewMarkup).toContain(">Edit<");
    expect(reviewMarkup).toContain(">Save<");
    expect(reviewMarkup).toContain("Review the generated document");
    expect(reviewMarkup).toContain("Personal information");
    expect(reviewMarkup).toContain("Taylor Smith");
    expect(reviewMarkup).toContain("taylor@example.com");
    expect(reviewMarkup).toContain("Berlin");
    expect(reviewMarkup).toContain("Professional summary");
    expect(reviewMarkup).toContain("TypeScript engineer building APIs.");
    expect(reviewMarkup).toContain("Experience");
    expect(reviewMarkup).toContain("Software Engineer");
    expect(reviewMarkup).toContain("Built REST APIs with TypeScript.");
    expect(reviewMarkup).toContain("Skills");
    expect(reviewMarkup).toContain("TypeScript");
    expect(reviewMarkup).toContain("Node.js");
    expect(reviewMarkup).toContain("Education");
    expect(reviewMarkup).toContain("Languages");
    expect(reviewMarkup).toContain("Certifications");
    expect(reviewMarkup).not.toContain("Not provided");
    expect(reviewMarkup).not.toContain("<textarea");
    expect(reviewMarkup).not.toContain('type="text"');
    expect(reviewMarkup).not.toContain("Done editing");
    expect(reviewMarkup).not.toContain("Editable");
    expect(reviewMarkup).not.toContain("Add skill");
    expect(reviewMarkup).not.toContain("Saving…");
    expect(reviewMarkup).not.toContain("Optimized CV saved.");
    expect(reviewMarkup).not.toContain("Continue to Cover Letter");

    const editMarkup = renderToStaticMarkup(
      <ApplicationOptimizedCv
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(editMarkup).toContain("Done editing");
    expect(editMarkup).toContain("Generate again");
    expect(editMarkup).toContain(">Save<");
    expect(editMarkup).toContain("Editable");
    expect(editMarkup).toContain('aria-label="Professional summary"');
    expect(editMarkup).toContain("<textarea");
    expect(editMarkup).toContain("TypeScript engineer building APIs.");
    expect(editMarkup).toContain('aria-label="Experience description 1"');
    expect(editMarkup).toContain("Built REST APIs with TypeScript.");
    expect(editMarkup).toContain("Add skill");
    expect(editMarkup).toContain("Remove");
    expect(editMarkup).toContain("Software Engineer");
    expect(editMarkup).toContain("2022-01");
    expect(editMarkup).toContain("Example University");
    expect(editMarkup).toContain("English");
    expect(editMarkup).toContain("AWS Certified");
    expect(editMarkup).not.toContain("Add experience");
    expect(editMarkup).not.toContain("Remove experience");
    expect(editMarkup).not.toContain("application-specific notes");

    const savingMarkup = renderToStaticMarkup(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        isSaving
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(savingMarkup).toContain("Saving…");
    expect(savingMarkup).toContain('disabled=""');

    const savedMarkup = renderToStaticMarkup(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onContinueToCoverLetter={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={sampleOptimizedCv}
        savedMessage="Optimized CV saved."
      />,
    );
    expect(savedMarkup).toContain("Optimized CV saved.");
    expect(savedMarkup).toContain('role="status"');
    expect(savedMarkup).toContain("Continue to Cover Letter");

    const continueWorkflowMarkup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status="NEW"
          activeSection="optimized-cv"
          isJobAnalysisCompleted
          isProfileMatchCompleted
          isOptimizedCvCompleted
          onSectionChange={() => undefined}
        >
          <ApplicationOptimizedCv
            errorMessage={null}
            isLoading={false}
            onChange={() => undefined}
            onContinueToCoverLetter={() => undefined}
            onGenerate={() => undefined}
            onSave={() => undefined}
            optimizedCv={sampleOptimizedCv}
          />
        </ApplicationWorkspace>
      </MemoryRouter>,
    );
    expect(continueWorkflowMarkup).toContain("Continue to Cover Letter");
    expect(continueWorkflowMarkup).toContain(
      "Completed sections: Job Analysis, Profile Match, Optimized CV",
    );
    expect(continueWorkflowMarkup).toContain("Next recommended step:");
    expect(continueWorkflowMarkup).toContain("Cover Letter");
    expect(continueWorkflowMarkup).not.toContain("Locked");

    const saveErrorMarkup = renderToStaticMarkup(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={sampleOptimizedCv}
        saveErrorMessage="Unable to save this Optimized CV."
      />,
    );
    expect(saveErrorMarkup).toContain("Unable to save this Optimized CV.");
    expect(saveErrorMarkup).toContain('role="alert"');

    const errorMarkup = renderToStaticMarkup(
      <ApplicationOptimizedCv
        errorMessage="Unable to generate this Optimized CV."
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={null}
      />,
    );
    expect(errorMarkup).toContain("Unable to generate this Optimized CV.");
    expect(errorMarkup).toContain("Try again");
  });

  it("makes the Cover Letter placeholder available after a saved Optimized CV", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status="NEW"
          activeSection="cover-letter"
          isJobAnalysisCompleted
          isProfileMatchCompleted
          isOptimizedCvCompleted
          onSectionChange={() => undefined}
        >
          <ApplicationCoverLetter />
        </ApplicationWorkspace>
      </MemoryRouter>,
    );

    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Cover Letter");
    expect(markup).toContain("No cover letter has been generated yet.");
    expect(markup).toContain(
      "Cover Letter generation will be implemented in a future Epic.",
    );
    expect(markup).toContain(
      "Completed sections: Job Analysis, Profile Match, Optimized CV",
    );
    expect(markup).not.toContain('disabled=""');
    expect(markup).not.toContain("Download");
    expect(markup).not.toContain("Live preview");
  });

  it("keeps Cover Letter locked until a saved Optimized CV exists", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status="NEW"
          activeSection="optimized-cv"
          isJobAnalysisCompleted
          isProfileMatchCompleted
          isOptimizedCvCompleted={false}
          onSectionChange={() => undefined}
        >
          <p>Optimized CV content</p>
        </ApplicationWorkspace>
      </MemoryRouter>,
    );

    expect(markup).toContain("Completed sections: Job Analysis, Profile Match");
    expect(markup).toContain("Next recommended step:");
    expect(markup).toContain("Optimized CV");
    expect(markup.match(/<button[^>]*disabled=""/g)).toHaveLength(2);
    expect(markup).toContain("Locked");
  });

  it("makes the Export placeholder available with Cover Letter", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status="NEW"
          activeSection="export"
          isJobAnalysisCompleted
          isProfileMatchCompleted
          isOptimizedCvCompleted
          onSectionChange={() => undefined}
        >
          <ApplicationExport />
        </ApplicationWorkspace>
      </MemoryRouter>,
    );

    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Export");
    expect(markup).toContain(
      "No exportable documents are currently available.",
    );
    expect(markup).toContain(
      "PDF generation and document export will be implemented in a future Epic.",
    );
    expect(markup).not.toContain('disabled=""');
    expect(markup).not.toContain("Download");
    expect(markup).not.toContain("Export progress");
  });

  it("renders Google sign in", () => {
    const markup = renderApp("/login", null);

    expect(markup).toContain("Welcome");
    expect(markup).toContain("Continue with Google");
  });

  it("renders the job analysis form", () => {
    const markup = renderApp("/applications/new");

    expect(markup).toContain("Analyze a job description");
    expect(markup).toContain("Plain text only");
    expect(markup).toMatch(
      /<textarea[^>]*id="jobDescription"[^>]*required[^>]*>/,
    );
    expect(markup).toContain("Analyze job");
    expect(markup).toContain("Cancel");
  });

  it("validates job description boundaries", () => {
    expect(jobDescriptionError("")).toBe("Job description is required.");
    expect(jobDescriptionError("a".repeat(299))).toBe(
      "The job description is too short.",
    );
    expect(jobDescriptionError("a".repeat(300))).toBeNull();
    expect(jobDescriptionError("a".repeat(25_000))).toBeNull();
    expect(jobDescriptionError("a".repeat(25_001))).toBe(
      "The job description exceeds the maximum allowed length.",
    );
  });

  it("renders every Master CV section", () => {
    const markup = renderToStaticMarkup(
      <MasterCvForm
        initialValue={{
          fullName: "",
          email: "",
          phone: null,
          location: null,
          linkedin: null,
          portfolio: null,
          professionalSummary: "",
          experience: [],
          education: [],
          skills: [],
          languages: [],
          certifications: [],
        }}
        submitLabel="Save Master CV"
        isSaving={false}
        errorMessage={null}
        onSubmit={() => Promise.resolve()}
      />,
    );

    expect(markup).toContain("Personal information");
    expect(markup).toContain("Professional summary");
    expect(markup).toContain("Experience");
    expect(markup).toContain("Education");
    expect(markup).toContain("Skills");
    expect(markup).toContain("Languages");
    expect(markup).toContain("Certifications");
    expect(markup).toContain("Save Master CV");
  });

  it("renders the existing CV import action", () => {
    const markup = renderToStaticMarkup(
      <MasterCvImport onImport={() => undefined} />,
    );

    expect(markup).toContain("Import Existing CV");
    expect(markup).toMatch(
      /<input[^>]*type="file"[^>]*accept="application\/pdf,.pdf"/,
    );
  });

  it("maps extracted CV data into editable form values", () => {
    const input = masterCvInputFromExtraction({
      personalInformation: {
        fullName: "Taylor Smith",
        email: null,
        phone: null,
        location: "Berlin",
        linkedin: null,
        portfolio: null,
      },
      professionalSummary: null,
      experience: [],
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
    });

    expect(input.fullName).toBe("Taylor Smith");
    expect(input.email).toBe("");
    expect(input.professionalSummary).toBe("");
    expect(input.location).toBe("Berlin");
    expect(input.skills).toEqual(["TypeScript"]);
  });
});
