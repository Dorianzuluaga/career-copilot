import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ApplicationCard } from "./components/ApplicationCard";
import { ApplicationCoverLetter } from "./components/ApplicationCoverLetter";
import {
  ApplicationExport,
  updateDocumentSelection,
} from "./components/ApplicationExport";
import { ApplicationForm } from "./components/ApplicationForm";
import { ApplicationJobAnalysis } from "./components/ApplicationJobAnalysis";
import {
  ApplicationOptimizedCv,
  availableMasterPersonalProjects,
  personalProjectFromMasterCv,
} from "./components/ApplicationOptimizedCv";
import { ApplicationOverview } from "./components/ApplicationOverview";
import { ApplicationProfileMatch } from "./components/ApplicationProfileMatch";
import { ApplicationWorkspace } from "./components/ApplicationWorkspace";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { jobDescriptionError } from "./components/JobAnalysisForm";
import {
  MasterCvForm,
  nullable,
  optionalFieldValue,
} from "./components/MasterCvForm";
import { MasterCvImport } from "./components/MasterCvImport";
import { ValidationToast } from "./components/ValidationToast";
import { AuthContext } from "./context/auth-context";
import { LocaleProvider } from "./context/LocaleProvider";
import { writeStoredLocale } from "./i18n/storage";
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
          signOut: () => Promise.resolve(),
        }}
      >
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

function renderWithLocale(ui: ReactNode) {
  return renderToStaticMarkup(<LocaleProvider>{ui}</LocaleProvider>);
}

function renderWorkspace(ui: ReactNode) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <LocaleProvider>{ui}</LocaleProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the persisted dashboard loading state", () => {
    const markup = renderApp("/dashboard");

    expect(markup).toContain("Panel de candidaturas");
    expect(markup).toContain("Nueva candidatura");
    expect(markup).toContain("Editar CV Maestro");
    expect(markup).toContain("Cargando candidaturas");
  });

  it("renders Dashboard and Master CV in the sidebar and keeps Profile in the header", () => {
    const markup = renderApp("/dashboard");

    expect(markup).toContain(">Principal<");
    expect(markup).toContain(">Panel<");
    expect(markup).toContain(">CV Maestro<");
    expect(markup).toContain(">Perfil<");
    expect(markup).toContain('href="/dashboard"');
    expect(markup).toContain('href="/master-cv"');
    expect(markup).toContain('href="/profile"');
    expect(markup).toContain('aria-label="Principal"');
    expect(markup).toContain('aria-label="Cuenta"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).not.toContain("Export History");
    expect(markup).not.toContain("Upgrade to Pro");
    expect(markup).not.toContain("Help &amp; Support");
    expect(markup).not.toContain(">Settings<");
  });

  it("renders a language selector in the header next to Profile", () => {
    const markup = renderApp("/dashboard");

    expect(markup).toContain('aria-label="Idioma"');
    expect(markup).toContain("Español");
    expect(markup).toContain("English");
    expect(markup).toContain("Français");
    expect(markup).toContain('value="es"');
    expect(markup).toContain('value="en"');
    expect(markup).toContain('value="fr"');
    expect(markup).toContain(">Perfil<");
  });

  it.each([
    {
      locale: "en" as const,
      main: "Main",
      dashboard: "Dashboard",
      masterCv: "Master CV",
      profile: "Profile",
      account: "Account",
      language: "Language",
    },
    {
      locale: "fr" as const,
      main: "Principal",
      dashboard: "Tableau de bord",
      masterCv: "CV maître",
      profile: "Profil",
      account: "Compte",
      language: "Langue",
    },
  ])(
    "translates the navbar and sidebar when $locale is stored",
    ({ locale, main, dashboard, masterCv, profile, account, language }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      const markup = renderApp("/dashboard");

      expect(markup).toContain(`>${main}<`);
      expect(markup).toContain(`>${dashboard}<`);
      expect(markup).toContain(`>${masterCv}<`);
      expect(markup).toContain(`>${profile}<`);
      expect(markup).toContain(`aria-label="${main}"`);
      expect(markup).toContain(`aria-label="${account}"`);
      expect(markup).toContain(`aria-label="${language}"`);
    },
  );

  it.each([
    {
      locale: "en" as const,
      title: "Application dashboard",
      description: "Create and organize your job applications in one place.",
      editMasterCv: "Edit Master CV",
      newApplication: "New Application",
      loading: "Loading applications…",
    },
    {
      locale: "fr" as const,
      title: "Tableau de candidatures",
      description: "Créez et organisez vos candidatures au même endroit.",
      editMasterCv: "Modifier le CV maître",
      newApplication: "Nouvelle candidature",
      loading: "Chargement des candidatures…",
    },
  ])(
    "translates the dashboard when $locale is stored",
    ({ locale, title, description, editMasterCv, newApplication, loading }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      const markup = renderApp("/dashboard");

      expect(markup).toContain(title);
      expect(markup).toContain(description);
      expect(markup).toContain(editMasterCv);
      expect(markup).toContain(newApplication);
      expect(markup).toContain(loading);
    },
  );

  it("renders the Master CV editor loading state", () => {
    const markup = renderApp("/master-cv");

    expect(markup).toContain("Cargando tu CV Maestro");
    expect(markup).toContain("CV Maestro");
  });

  it("renders the Master CV onboarding loading state", () => {
    const markup = renderApp("/onboarding/master-cv");

    expect(markup).toContain("Cargando tu perfil");
  });

  it.each([
    {
      locale: "en" as const,
      editorLoading: "Loading your Master CV…",
      onboardingLoading: "Loading your profile…",
    },
    {
      locale: "fr" as const,
      editorLoading: "Chargement de votre CV maître…",
      onboardingLoading: "Chargement de votre profil…",
    },
  ])(
    "translates Master CV loading states when $locale is stored",
    ({ locale, editorLoading, onboardingLoading }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      expect(renderApp("/master-cv")).toContain(editorLoading);
      expect(renderApp("/onboarding/master-cv")).toContain(onboardingLoading);
    },
  );

  it("renders the read-only profile page for the authenticated user", () => {
    const markup = renderApp("/profile");

    expect(markup).toContain("Profile");
    expect(markup).toContain("Taylor Smith");
    expect(markup).toContain("taylor@example.com");
    expect(markup).toContain("Google");
    expect(markup).toContain("Log out");
    expect(markup).not.toContain("Member since");
    expect(markup).not.toContain("Edit Profile");
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
        <LocaleProvider>
          <ApplicationCard
            application={application}
            isDeleting={false}
            onDelete={() => Promise.resolve()}
          />
        </LocaleProvider>
      </MemoryRouter>,
    );

    expect(markup).toContain("/applications/application-id");
    expect(markup).toContain("Abrir");
    expect(markup).toContain("Eliminar");
    expect(markup).toContain("Empresa no identificada");
    expect(markup).toContain("Oportunidad sin título");
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
    const markup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status={application.status}
        activeSection="overview"
        isJobAnalysisCompleted={false}
        isProfileMatchCompleted={false}
        isOptimizedCvCompleted={false}
        isCoverLetterCompleted={false}
        onSectionChange={() => undefined}
      >
        <ApplicationOverview
          application={application}
          company="Example Company"
          title="Frontend Engineer"
        />
      </ApplicationWorkspace>,
    );

    expect(markup).toContain(
      "Contenido del espacio de trabajo de la candidatura",
    );
    expect(markup).toContain("Resumen");
    expect(markup).toContain("Example Company");
    expect(markup).toContain("Frontend Engineer");
    expect(markup).toContain("Última actualización");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Análisis del puesto");
    expect(markup).toContain("Coincidencia de perfil");
    expect(markup).toContain("CV optimizado");
    expect(markup).toContain("Carta de presentación");
    expect(markup).toContain("Exportación");
    expect(markup).toContain("Secciones completadas: Ninguna");
    expect(markup).toContain("Siguiente paso recomendado:");
    expect(markup).toContain("lg:grid-cols-6");
    expect(markup).toContain("min-w-0");
    expect(markup).toContain("lg:flex-col");
    expect(markup).toContain("wrap-break-word");
    expect(markup).toContain("lg:px-3");
    expect(markup).toContain("h-full");
    expect(markup.match(/<button[^>]*disabled=""/g)).toHaveLength(4);
    expect(markup).not.toContain("Coming Soon");
  });

  it.each([
    {
      locale: "en" as const,
      overview: "Overview",
      jobAnalysis: "Job Analysis",
      profileMatch: "Profile Match",
      optimizedCv: "Optimized CV",
      coverLetter: "Cover Letter",
      export: "Export",
      current: "Current",
      locked: "Locked",
      completedNone: "Completed sections: None",
      nextStep: "Next recommended step:",
      kicker: "Application workspace",
      lastUpdated: "Last updated",
      back: "Dashboard",
    },
    {
      locale: "fr" as const,
      overview: "Aperçu",
      jobAnalysis: "Analyse du poste",
      profileMatch: "Correspondance du profil",
      optimizedCv: "CV optimisé",
      coverLetter: "Lettre de motivation",
      export: "Exportation",
      current: "En cours",
      locked: "Verrouillée",
      completedNone: "Sections terminées : Aucune",
      nextStep: "Prochaine étape recommandée :",
      kicker: "Espace de travail de la candidature",
      lastUpdated: "Dernière mise à jour",
      back: "Tableau de bord",
    },
  ])(
    "translates the application workspace shell when $locale is stored",
    ({
      locale,
      overview,
      jobAnalysis,
      profileMatch,
      optimizedCv,
      coverLetter,
      export: exportLabel,
      current,
      locked,
      completedNone,
      nextStep,
      kicker,
      lastUpdated,
      back,
    }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      const application: PersistedApplication = {
        id: "application-id",
        userId: "user-id",
        status: "NEW",
        jobOffer: null,
        jobAnalysis: null,
        createdAt: "2026-07-28T12:00:00.000Z",
        updatedAt: "2026-07-29T12:00:00.000Z",
      };
      const markup = renderWorkspace(
        <ApplicationWorkspace
          company="Example Company"
          title="Frontend Engineer"
          status={application.status}
          activeSection="overview"
          isJobAnalysisCompleted={false}
          isProfileMatchCompleted={false}
          isOptimizedCvCompleted={false}
          isCoverLetterCompleted={false}
          onSectionChange={() => undefined}
        >
          <ApplicationOverview
            application={application}
            company="Example Company"
            title="Frontend Engineer"
          />
        </ApplicationWorkspace>,
      );

      expect(markup).toContain(overview);
      expect(markup).toContain(jobAnalysis);
      expect(markup).toContain(profileMatch);
      expect(markup).toContain(optimizedCv);
      expect(markup).toContain(coverLetter);
      expect(markup).toContain(exportLabel);
      expect(markup).toContain(current);
      expect(markup).toContain(locked);
      expect(markup).toContain(completedNone);
      expect(markup).toContain(nextStep);
      expect(markup).toContain(kicker);
      expect(markup).toContain(lastUpdated);
      expect(markup).toContain(back);
      expect(markup).toContain("Example Company");
      expect(markup).toContain("Frontend Engineer");
      expect(markup).toContain("NEW");
    },
  );

  it("renders the unsaved changes confirmation dialog actions", () => {
    const markup = renderToStaticMarkup(
      <ConfirmDialog
        open
        title="Unsaved changes"
        description={<p>You have unsaved changes.</p>}
        cancelAction={{ label: "Cancel", onClick: () => undefined }}
        secondaryAction={{
          label: "Leave Without Saving",
          onClick: () => undefined,
          variant: "danger",
        }}
        primaryAction={{
          label: "Save and Continue",
          onClick: () => undefined,
          variant: "primary",
        }}
      />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("Unsaved changes");
    expect(markup).toContain("You have unsaved changes.");
    expect(markup).toContain("Save and Continue");
    expect(markup).toContain("Leave Without Saving");
    expect(markup).toContain("Cancel");
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

    const markup = renderWithLocale(
      <ApplicationJobAnalysis application={application} />,
    );

    expect(markup).toContain("Descripción original de la oferta");
    expect(markup).toContain("Original job description");
    expect(markup).toContain("Análisis del puesto");
    expect(markup).toContain("Versión 1");
    expect(markup).toContain("Tipo de contrato");
    expect(markup).toContain("Full-time");
    expect(markup).toContain("Remote");
    expect(markup).toContain("TypeScript");
    expect(markup).toContain("Develop user interfaces");
    expect(markup).toContain("React");
    expect(markup).toContain("No indicado");
    expect(markup).not.toContain("Not provided");
  });

  it.each([
    {
      locale: "en" as const,
      originalTitle: "Original job description",
      analysisTitle: "Job analysis",
      version: "Version 1",
      employmentType: "Employment type",
      requiredSkills: "Required skills",
      notProvided: "Not provided",
    },
    {
      locale: "fr" as const,
      originalTitle: "Description originale de l&#x27;offre",
      analysisTitle: "Analyse du poste",
      version: "Version 1",
      employmentType: "Type de contrat",
      requiredSkills: "Compétences requises",
      notProvided: "Non renseigné",
    },
  ])(
    "translates Job Analysis results when $locale is stored",
    ({
      locale,
      originalTitle,
      analysisTitle,
      version,
      employmentType,
      requiredSkills,
      notProvided,
    }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

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

      const markup = renderWithLocale(
        <ApplicationJobAnalysis application={application} />,
      );

      expect(markup).toContain(originalTitle);
      expect(markup).toContain("Original job description");
      expect(markup).toContain(analysisTitle);
      expect(markup).toContain(version);
      expect(markup).toContain(employmentType);
      expect(markup).toContain(requiredSkills);
      expect(markup).toContain(notProvided);
      expect(markup).toContain("Full-time");
      expect(markup).toContain("TypeScript");
      expect(markup).toContain("Develop user interfaces");
      expect(markup).toContain("React");
      expect(markup).toContain("Build accessible web applications.");
    },
  );

  it("makes Profile Match available after Job Analysis is completed", () => {
    const markup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="job-analysis"
        isJobAnalysisCompleted
        isProfileMatchCompleted={false}
        isOptimizedCvCompleted={false}
        isCoverLetterCompleted={false}
        onSectionChange={() => undefined}
      >
        <p>Job analysis content</p>
      </ApplicationWorkspace>,
    );

    expect(markup).toContain("Secciones completadas: Análisis del puesto");
    expect(markup).toContain("Siguiente paso recomendado:");
    expect(markup).toContain("Coincidencia de perfil");
    expect(markup.match(/<button[^>]*disabled=""/g)).toHaveLength(3);
  });

  it("renders the complete profile comparison without internal reasoning", () => {
    const markup = renderWithLocale(
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

    expect(markup).toContain("Coincidencia ATS");
    expect(markup).toContain("72%");
    expect(markup).toContain("Puntuación de coincidencia ATS: 72%");
    expect(markup).toContain("Competencias coincidentes");
    expect(markup).toContain("TypeScript");
    expect(markup).toContain("Competencias faltantes");
    expect(markup).toContain("Docker");
    expect(markup).toContain("Fortalezas");
    expect(markup).toContain("Relevant frontend experience");
    expect(markup).toContain("Debilidades");
    expect(markup).toContain("Cloud experience is not demonstrated");
    expect(markup).toContain("Recomendación");
    expect(markup).toContain(
      "Good opportunity. Adapt your CV before applying.",
    );
    expect(markup).not.toContain("Internal score reasoning");
    expect(markup).not.toContain("Regenerate comparison");
  });

  it("renders Profile Match loading, empty, error, and empty-list states", () => {
    const loadingMarkup = renderWithLocale(
      <ApplicationProfileMatch
        comparison={null}
        errorMessage={null}
        isLoading
        onCompare={() => undefined}
        onReturnToJobAnalysis={() => undefined}
      />,
    );
    expect(loadingMarkup).toContain("Coincidencia de perfil");
    expect(loadingMarkup).toContain(
      "Comparando tu CV Maestro con este análisis del puesto…",
    );

    const emptyMarkup = renderWithLocale(
      <ApplicationProfileMatch
        comparison={null}
        errorMessage={null}
        isLoading={false}
        onCompare={() => undefined}
        onReturnToJobAnalysis={() => undefined}
      />,
    );
    expect(emptyMarkup).toContain(
      "Compara tu CV Maestro con el análisis del puesto completado.",
    );
    expect(emptyMarkup).toContain("Comparar perfil");
    expect(emptyMarkup).toContain("Volver al análisis del puesto");

    const errorMarkup = renderWithLocale(
      <ApplicationProfileMatch
        comparison={null}
        errorMessage="Profile Match not found."
        isLoading={false}
        onCompare={() => undefined}
        onReturnToJobAnalysis={() => undefined}
      />,
    );
    expect(errorMarkup).toContain("Profile Match not found.");
    expect(errorMarkup).toContain("Reintentar");

    const emptyListsMarkup = renderWithLocale(
      <ApplicationProfileMatch
        comparison={{
          matchingSkills: [],
          missingSkills: [],
          strengths: [],
          weaknesses: [],
          alignmentScore: 0,
          alignmentReasoning: "Internal score reasoning",
          recommendation: "AI recommendation stays as returned.",
        }}
        errorMessage={null}
        isLoading={false}
        onCompare={() => undefined}
        onReturnToJobAnalysis={() => undefined}
      />,
    );
    expect(emptyListsMarkup).toContain("Ninguna identificada");
    expect(emptyListsMarkup).toContain("AI recommendation stays as returned.");
    expect(emptyListsMarkup).not.toContain("Internal score reasoning");
  });

  it.each([
    {
      locale: "en" as const,
      title: "Profile Match",
      atsMatch: "ATS Match",
      scoreAria: "ATS match score: 72%",
      matchingSkills: "Matching Skills",
      missingSkills: "Missing Skills",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      recommendation: "Recommendation",
      noneIdentified: "None identified",
      loading: "Comparing your Master CV with this job analysis…",
      description: "Compare your Master CV with the completed job analysis.",
      compare: "Compare profile",
      tryAgain: "Try again",
      returnToJobAnalysis: "Return to Job Analysis",
    },
    {
      locale: "fr" as const,
      title: "Correspondance du profil",
      atsMatch: "Correspondance ATS",
      scoreAria: "Score de correspondance ATS : 72 %",
      matchingSkills: "Compétences correspondantes",
      missingSkills: "Compétences manquantes",
      strengths: "Points forts",
      weaknesses: "Points faibles",
      recommendation: "Recommandation",
      noneIdentified: "Aucune identifiée",
      loading: "Comparaison de votre CV maître avec cette analyse du poste…",
      description:
        "Comparez votre CV maître avec l&#x27;analyse du poste terminée.",
      compare: "Comparer le profil",
      tryAgain: "Réessayer",
      returnToJobAnalysis: "Retour à l&#x27;analyse du poste",
    },
  ])(
    "translates Profile Match when $locale is stored",
    ({
      locale,
      title,
      atsMatch,
      scoreAria,
      matchingSkills,
      missingSkills,
      strengths,
      weaknesses,
      recommendation,
      noneIdentified,
      loading,
      description,
      compare,
      tryAgain,
      returnToJobAnalysis,
    }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      const resultMarkup = renderWithLocale(
        <ApplicationProfileMatch
          comparison={{
            matchingSkills: ["TypeScript"],
            missingSkills: [],
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

      expect(resultMarkup).toContain(title);
      expect(resultMarkup).toContain(atsMatch);
      expect(resultMarkup).toContain(scoreAria);
      expect(resultMarkup).toContain("72%");
      expect(resultMarkup).toContain(matchingSkills);
      expect(resultMarkup).toContain("TypeScript");
      expect(resultMarkup).toContain(missingSkills);
      expect(resultMarkup).toContain(noneIdentified);
      expect(resultMarkup).toContain(strengths);
      expect(resultMarkup).toContain("Relevant frontend experience");
      expect(resultMarkup).toContain(weaknesses);
      expect(resultMarkup).toContain("Cloud experience is not demonstrated");
      expect(resultMarkup).toContain(recommendation);
      expect(resultMarkup).toContain(
        "Good opportunity. Adapt your CV before applying.",
      );
      expect(resultMarkup).toContain(returnToJobAnalysis);
      expect(resultMarkup).not.toContain("Internal score reasoning");

      const loadingMarkup = renderWithLocale(
        <ApplicationProfileMatch
          comparison={null}
          errorMessage={null}
          isLoading
          onCompare={() => undefined}
          onReturnToJobAnalysis={() => undefined}
        />,
      );
      expect(loadingMarkup).toContain(title);
      expect(loadingMarkup).toContain(loading);

      const emptyMarkup = renderWithLocale(
        <ApplicationProfileMatch
          comparison={null}
          errorMessage={null}
          isLoading={false}
          onCompare={() => undefined}
          onReturnToJobAnalysis={() => undefined}
        />,
      );
      expect(emptyMarkup).toContain(description);
      expect(emptyMarkup).toContain(compare);
      expect(emptyMarkup).toContain(returnToJobAnalysis);

      const errorMarkup = renderWithLocale(
        <ApplicationProfileMatch
          comparison={null}
          errorMessage="Profile Match not found."
          isLoading={false}
          onCompare={() => undefined}
          onReturnToJobAnalysis={() => undefined}
        />,
      );
      expect(errorMarkup).toContain("Profile Match not found.");
      expect(errorMarkup).toContain(tryAgain);
    },
  );

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

    const idleMarkup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="optimized-cv"
        isJobAnalysisCompleted
        isProfileMatchCompleted
        isOptimizedCvCompleted={false}
        isCoverLetterCompleted={false}
        onSectionChange={() => undefined}
      >
        <ApplicationOptimizedCv
          errorMessage={null}
          isLoading={false}
          onChange={() => undefined}
          onGenerate={() => undefined}
          optimizedCv={null}
        />
      </ApplicationWorkspace>,
    );

    expect(idleMarkup).toContain('aria-current="page"');
    expect(idleMarkup).toContain("CV optimizado");
    expect(idleMarkup).toContain("Generar CV optimizado");
    expect(idleMarkup).toContain(
      "Genera un CV optimizado adaptado a esta oferta",
    );
    expect(idleMarkup).toContain("Siguiente paso recomendado:");
    expect(idleMarkup).toContain("Carta de presentación");
    expect(idleMarkup).toContain("Bloqueada");
    expect(idleMarkup).not.toContain("Continuar a la carta de presentación");
    expect(idleMarkup).not.toContain("<textarea");
    expect(idleMarkup).not.toContain('type="text"');

    const loadingMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={null}
      />,
    );
    expect(loadingMarkup).toContain("Generando tu CV optimizado…");

    const reviewMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(reviewMarkup).toContain("Generar de nuevo");
    expect(reviewMarkup).toContain(">Editar<");
    expect(reviewMarkup).toContain(">Guardar<");
    expect(reviewMarkup).toContain("Revisa el documento generado");
    expect(reviewMarkup).toContain("<header");
    expect(reviewMarkup).toContain("<aside");
    expect(reviewMarkup).toContain("minmax(0,68fr)_minmax(0,32fr)");
    expect(reviewMarkup).toContain("Taylor Smith");
    expect(reviewMarkup).toContain("taylor@example.com");
    expect(reviewMarkup).toContain("Berlin");
    expect(reviewMarkup).toContain('data-field="fullName"');
    expect(reviewMarkup).toContain('data-field="email"');
    expect(reviewMarkup).toContain('data-field-group="experience.0"');
    expect(reviewMarkup).toContain("Resumen profesional");
    expect(reviewMarkup).toContain("text-justify");
    expect(reviewMarkup).toContain("TypeScript engineer building APIs.");
    expect(reviewMarkup).toContain("Experiencia");
    expect(reviewMarkup).toContain("Software Engineer");
    expect(reviewMarkup).toContain("Built REST APIs with TypeScript.");
    expect(reviewMarkup).toContain("Competencias");
    expect(reviewMarkup).toContain("TypeScript · Node.js");
    expect(reviewMarkup).toContain("Formación");
    expect(reviewMarkup).toContain("Idiomas");
    expect(reviewMarkup).toContain("Certificaciones");
    expect(reviewMarkup).not.toContain("Proyectos personales");
    expect(reviewMarkup).not.toContain("Información personal");
    expect(reviewMarkup).not.toContain("Not provided");
    expect(reviewMarkup).not.toContain("<textarea");
    expect(reviewMarkup).not.toContain('type="text"');
    expect(reviewMarkup).not.toContain("Terminar edición");
    expect(reviewMarkup).not.toContain("Editable");
    expect(reviewMarkup).not.toContain("Añadir competencia");
    expect(reviewMarkup).not.toContain("Guardando…");
    expect(reviewMarkup).not.toContain("CV optimizado guardado.");
    expect(reviewMarkup).not.toContain("Continuar a la carta de presentación");

    const editMarkup = renderWithLocale(
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
    expect(editMarkup).toContain("Terminar edición");
    expect(editMarkup).toContain("Generar de nuevo");
    expect(editMarkup).toContain(">Guardar<");
    expect(editMarkup).toContain("Editable");
    expect(editMarkup).toContain('aria-label="Resumen profesional"');
    expect(editMarkup).toContain("<textarea");
    expect(editMarkup).toContain("TypeScript engineer building APIs.");
    expect(editMarkup).toContain(
      'aria-label="Descripción de la experiencia 1"',
    );
    expect(editMarkup).toContain("Built REST APIs with TypeScript.");
    expect(editMarkup).toContain("Añadir competencia");
    expect(editMarkup).toContain("Eliminar");
    expect(editMarkup).toContain("Software Engineer");
    expect(editMarkup).toContain("2022-01");
    expect(editMarkup).toContain("Example University");
    expect(editMarkup).toContain("English");
    expect(editMarkup).toContain("AWS Certified");
    expect(editMarkup).not.toContain("Add experience");
    expect(editMarkup).not.toContain("Remove experience");
    expect(editMarkup).not.toContain("Añadir proyecto");
    expect(editMarkup).not.toContain("Eliminar proyecto");
    expect(editMarkup).not.toContain("application-specific notes");

    const savingMarkup = renderWithLocale(
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
    expect(savingMarkup).toContain("Guardando…");
    expect(savingMarkup).toContain('disabled=""');

    const savedMarkup = renderWithLocale(
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
    expect(savedMarkup).toContain("Continuar a la carta de presentación");

    const continueWorkflowMarkup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="optimized-cv"
        isJobAnalysisCompleted
        isProfileMatchCompleted
        isOptimizedCvCompleted
        isCoverLetterCompleted={false}
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
      </ApplicationWorkspace>,
    );
    expect(continueWorkflowMarkup).toContain(
      "Continuar a la carta de presentación",
    );
    expect(continueWorkflowMarkup).toContain(
      "Secciones completadas: Análisis del puesto, Coincidencia de perfil, CV optimizado",
    );
    expect(continueWorkflowMarkup).toContain("Siguiente paso recomendado:");
    expect(continueWorkflowMarkup).toContain("Carta de presentación");
    expect(
      continueWorkflowMarkup.match(/<button[^>]*disabled=""/g),
    ).toHaveLength(1);
    expect(continueWorkflowMarkup).toContain("Bloqueada");

    const saveErrorMarkup = renderWithLocale(
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

    const errorMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage="Unable to generate this Optimized CV."
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={null}
      />,
    );
    expect(errorMarkup).toContain("Unable to generate this Optimized CV.");
    expect(errorMarkup).toContain("Reintentar");
  });

  it("reviews and edits selected Personal Projects without exposing Master CV identity as editable", () => {
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
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
      personalProjects: [
        {
          name: "Career Copilot",
          description: "AI career assistant built with TypeScript.",
          technologies: "TypeScript, React",
          url: "https://example.com/career-copilot",
        },
      ],
    };

    const reviewMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(reviewMarkup).toContain("Proyectos personales");
    expect(reviewMarkup.indexOf("Proyectos personales")).toBeGreaterThan(
      reviewMarkup.indexOf("</aside>"),
    );
    expect(reviewMarkup).toContain("Career Copilot");
    expect(reviewMarkup).toContain(
      "AI career assistant built with TypeScript.",
    );
    expect(reviewMarkup).toContain("TypeScript, React");
    expect(reviewMarkup).toContain("https://example.com/career-copilot");
    expect(reviewMarkup).not.toContain("Eliminar proyecto");
    expect(reviewMarkup).not.toContain(
      'aria-label="Descripción del proyecto personal 1"',
    );

    const editMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(editMarkup).toContain("Proyectos personales");
    expect(editMarkup.indexOf("Proyectos personales")).toBeGreaterThan(
      editMarkup.indexOf("</aside>"),
    );
    expect(editMarkup).toContain("Editable");
    expect(editMarkup).toContain(
      'aria-label="Descripción del proyecto personal 1"',
    );
    expect(editMarkup).toContain("Career Copilot");
    expect(editMarkup).toContain("TypeScript, React");
    expect(editMarkup).toContain("https://example.com/career-copilot");
    expect(editMarkup).toContain("Eliminar proyecto");
    expect(editMarkup).toContain(
      "nombres, tecnologías y URL de los proyectos personales permanecen de solo lectura.",
    );
    expect(editMarkup).not.toContain("Añadir proyecto");
  });

  it("lets users add a Master CV Personal Project that the AI omitted", () => {
    const careerCopilot = {
      name: "Career Copilot",
      description: "AI career assistant built with TypeScript.",
      technologies: "TypeScript, React",
      url: "https://example.com/career-copilot",
    };
    const humidityProject = {
      name: "Humidity Project",
      description: "IoT humidity monitor.",
      technologies: "Python",
      url: null,
    };
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
      education: [],
      skills: ["TypeScript"],
      languages: [],
      certifications: [],
      personalProjects: [careerCopilot],
    };

    expect(
      availableMasterPersonalProjects(
        [careerCopilot, humidityProject],
        [careerCopilot],
      ),
    ).toEqual([humidityProject]);
    expect(
      availableMasterPersonalProjects(
        [careerCopilot, humidityProject],
        [careerCopilot, humidityProject],
      ),
    ).toEqual([]);
    expect(personalProjectFromMasterCv(humidityProject)).toEqual(
      humidityProject,
    );

    const reviewMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage={null}
        isLoading={false}
        masterCvPersonalProjects={[careerCopilot, humidityProject]}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(reviewMarkup).not.toContain("Añadir proyecto");
    expect(reviewMarkup).not.toContain("Humidity Project");

    const editMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        masterCvPersonalProjects={[careerCopilot, humidityProject]}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={sampleOptimizedCv}
      />,
    );
    expect(editMarkup).toContain("Añadir proyecto");
    expect(editMarkup).toContain('aria-label="Añadir un proyecto personal"');
    expect(editMarkup).toContain(">Humidity Project</option>");
    expect(editMarkup).not.toContain(">Career Copilot</option>");
    expect(editMarkup).toContain("Career Copilot");

    const emptySelectionMarkup = renderWithLocale(
      <ApplicationOptimizedCv
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        masterCvPersonalProjects={[humidityProject]}
        onChange={() => undefined}
        onGenerate={() => undefined}
        optimizedCv={{ ...sampleOptimizedCv, personalProjects: [] }}
      />,
    );
    expect(emptySelectionMarkup).toContain("Proyectos personales");
    expect(emptySelectionMarkup).toContain("Añadir proyecto");
    expect(emptySelectionMarkup).toContain(">Humidity Project</option>");
  });

  it.each([
    {
      locale: "en" as const,
      title: "Optimized CV",
      kicker: "Application document",
      generate: "Generate Optimized CV",
      generateDescription:
        "Generate an Optimized CV tailored to this job opportunity from your Master CV, Job Analysis, and Profile Match.",
      tryAgain: "Try again",
      loading: "Generating your Optimized CV…",
      reviewDescription: "Review the generated document",
      edit: "Edit",
      save: "Save",
      generateAgain: "Generate again",
      professionalSummary: "Professional summary",
      experience: "Experience",
      skills: "Skills",
      education: "Education",
      languages: "Languages",
      certifications: "Certifications",
      personalProjects: "Personal projects",
      doneEditing: "Done editing",
      editable: "Editable",
      experienceDescriptionAria: "Experience description 1",
      addSkill: "Add skill",
      addProject: "Add project",
      addPersonalProject: "Add a Personal Project",
      removeProject: "Remove project",
      personalProjectDescriptionAria: "Personal project description 1",
      continueToCoverLetter: "Continue to Cover Letter",
      saving: "Saving…",
    },
    {
      locale: "fr" as const,
      title: "CV optimisé",
      kicker: "Document de candidature",
      generate: "Générer le CV optimisé",
      generateDescription:
        "Générez un CV optimisé adapté à cette offre à partir de votre CV maître, de l&#x27;analyse du poste et de la correspondance du profil.",
      tryAgain: "Réessayer",
      loading: "Génération de votre CV optimisé…",
      reviewDescription: "Vérifiez le document généré",
      edit: "Modifier",
      save: "Enregistrer",
      generateAgain: "Générer à nouveau",
      professionalSummary: "Résumé professionnel",
      experience: "Expérience",
      skills: "Compétences",
      education: "Formation",
      languages: "Langues",
      certifications: "Certifications",
      personalProjects: "Projets personnels",
      doneEditing: "Terminer la modification",
      editable: "Modifiable",
      experienceDescriptionAria: "Description de l&#x27;expérience 1",
      addSkill: "Ajouter une compétence",
      addProject: "Ajouter un projet",
      addPersonalProject: "Ajouter un projet personnel",
      removeProject: "Supprimer le projet",
      personalProjectDescriptionAria: "Description du projet personnel 1",
      continueToCoverLetter: "Continuer vers la lettre de motivation",
      saving: "Enregistrement…",
    },
  ])(
    "translates Optimized CV when $locale is stored",
    ({
      locale,
      title,
      kicker,
      generate,
      generateDescription,
      tryAgain,
      loading,
      reviewDescription,
      edit,
      save,
      generateAgain,
      professionalSummary,
      experience,
      skills,
      education,
      languages,
      certifications,
      personalProjects,
      doneEditing,
      editable,
      experienceDescriptionAria,
      addSkill,
      addProject,
      addPersonalProject,
      removeProject,
      personalProjectDescriptionAria,
      continueToCoverLetter,
      saving,
    }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

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
        personalProjects: [
          {
            name: "Career Copilot",
            description: "AI career assistant built with TypeScript.",
            technologies: "TypeScript, React",
            url: "https://example.com/career-copilot",
          },
        ],
      };
      const omittedProject = {
        name: "Humidity Project",
        description: "IoT humidity monitor.",
        technologies: "Python",
        url: null,
      };

      const emptyMarkup = renderWithLocale(
        <ApplicationOptimizedCv
          errorMessage={null}
          isLoading={false}
          onChange={() => undefined}
          onGenerate={() => undefined}
          optimizedCv={null}
        />,
      );
      expect(emptyMarkup).toContain(title);
      expect(emptyMarkup).toContain(kicker);
      expect(emptyMarkup).toContain(generate);
      expect(emptyMarkup).toContain(generateDescription);

      const loadingMarkup = renderWithLocale(
        <ApplicationOptimizedCv
          errorMessage={null}
          isLoading
          onChange={() => undefined}
          onGenerate={() => undefined}
          optimizedCv={null}
        />,
      );
      expect(loadingMarkup).toContain(title);
      expect(loadingMarkup).toContain(loading);

      const errorMarkup = renderWithLocale(
        <ApplicationOptimizedCv
          errorMessage="Unable to generate this Optimized CV."
          isLoading={false}
          onChange={() => undefined}
          onGenerate={() => undefined}
          optimizedCv={null}
        />,
      );
      expect(errorMarkup).toContain("Unable to generate this Optimized CV.");
      expect(errorMarkup).toContain(tryAgain);

      const reviewMarkup = renderWithLocale(
        <ApplicationOptimizedCv
          errorMessage={null}
          isLoading={false}
          onChange={() => undefined}
          onContinueToCoverLetter={() => undefined}
          onGenerate={() => undefined}
          onSave={() => undefined}
          optimizedCv={sampleOptimizedCv}
        />,
      );
      expect(reviewMarkup).toContain(title);
      expect(reviewMarkup).toContain(reviewDescription);
      expect(reviewMarkup).toContain(`>${edit}<`);
      expect(reviewMarkup).toContain(`>${save}<`);
      expect(reviewMarkup).toContain(generateAgain);
      expect(reviewMarkup).toContain(continueToCoverLetter);
      expect(reviewMarkup).toContain(professionalSummary);
      expect(reviewMarkup).toContain("TypeScript engineer building APIs.");
      expect(reviewMarkup).toContain(experience);
      expect(reviewMarkup).toContain("Built REST APIs with TypeScript.");
      expect(reviewMarkup).toContain(skills);
      expect(reviewMarkup).toContain("TypeScript · Node.js");
      expect(reviewMarkup).toContain(education);
      expect(reviewMarkup).toContain(languages);
      expect(reviewMarkup).toContain(certifications);
      expect(reviewMarkup).toContain(personalProjects);
      expect(reviewMarkup).toContain("Career Copilot");
      expect(reviewMarkup).not.toContain(doneEditing);
      expect(reviewMarkup).not.toContain(editable);

      const editMarkup = renderWithLocale(
        <ApplicationOptimizedCv
          errorMessage={null}
          initialIsEditing
          isLoading={false}
          masterCvPersonalProjects={[
            sampleOptimizedCv.personalProjects[0],
            omittedProject,
          ]}
          onChange={() => undefined}
          onGenerate={() => undefined}
          onSave={() => undefined}
          optimizedCv={sampleOptimizedCv}
        />,
      );
      expect(editMarkup).toContain(doneEditing);
      expect(editMarkup).toContain(editable);
      expect(editMarkup).toContain(`aria-label="${professionalSummary}"`);
      expect(editMarkup).toContain(`aria-label="${experienceDescriptionAria}"`);
      expect(editMarkup).toContain(addSkill);
      expect(editMarkup).toContain(addProject);
      expect(editMarkup).toContain(`aria-label="${addPersonalProject}"`);
      expect(editMarkup).toContain(removeProject);
      expect(editMarkup).toContain(
        `aria-label="${personalProjectDescriptionAria}"`,
      );
      expect(editMarkup).toContain(">Humidity Project</option>");
      expect(editMarkup).toContain("Career Copilot");

      const savingMarkup = renderWithLocale(
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
      expect(savingMarkup).toContain(saving);
    },
  );

  it("supports Cover Letter generation after a saved Optimized CV", () => {
    const sampleCoverLetter = {
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
    };

    const idleMarkup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="cover-letter"
        isJobAnalysisCompleted
        isProfileMatchCompleted
        isOptimizedCvCompleted
        isCoverLetterCompleted={false}
        onSectionChange={() => undefined}
      >
        <ApplicationCoverLetter
          coverLetter={null}
          errorMessage={null}
          isLoading={false}
          onChange={() => undefined}
          onGenerate={() => undefined}
        />
      </ApplicationWorkspace>,
    );

    expect(idleMarkup).toContain('aria-current="page"');
    expect(idleMarkup).toContain("Carta de presentación");
    expect(idleMarkup).toContain("Generar carta de presentación");
    expect(idleMarkup).toContain(
      "Genera una carta de presentación adaptada a esta oferta",
    );
    expect(idleMarkup).toContain(
      "Secciones completadas: Análisis del puesto, Coincidencia de perfil, CV optimizado",
    );
    expect(idleMarkup).toContain("Siguiente paso recomendado:");
    expect(idleMarkup.match(/<button[^>]*disabled=""/g)).toHaveLength(1);
    expect(idleMarkup).toContain("Bloqueada");
    expect(idleMarkup).not.toContain("Continuar a la exportación");
    expect(idleMarkup).not.toContain("Download");
    expect(idleMarkup).not.toContain("Live preview");
    expect(idleMarkup).not.toContain("Dear Hiring Manager,");
    expect(idleMarkup).not.toContain("<textarea");

    const loadingMarkup = renderWithLocale(
      <ApplicationCoverLetter
        coverLetter={null}
        errorMessage={null}
        isLoading
        onChange={() => undefined}
        onGenerate={() => undefined}
      />,
    );
    expect(loadingMarkup).toContain("Generando tu carta de presentación…");

    const reviewMarkup = renderWithLocale(
      <ApplicationCoverLetter
        coverLetter={sampleCoverLetter}
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
      />,
    );
    expect(reviewMarkup).toContain("Revisa el documento generado.");
    expect(reviewMarkup).toContain(
      "Entra en el modo de edición para actualizar el texto de la carta.",
    );
    expect(reviewMarkup).toContain(">Editar<");
    expect(reviewMarkup).toContain("Generar de nuevo");
    expect(reviewMarkup).toContain("Taylor Smith");
    expect(reviewMarkup).toContain("taylor@example.com");
    expect(reviewMarkup).toContain("+1 555 0100");
    expect(reviewMarkup).toContain("August 7, 2026");
    expect(reviewMarkup).toContain('data-field="phone"');
    expect(reviewMarkup).toContain('data-field="email"');
    expect(reviewMarkup).toContain('data-field="date"');
    expect(reviewMarkup).toContain("Acme");
    expect(reviewMarkup).toContain("Dear Hiring Manager,");
    expect(reviewMarkup).toContain(
      "I am writing to apply for the Software Engineer role at Acme.",
    );
    expect(reviewMarkup).toContain(
      "My experience building TypeScript APIs aligns with your requirements.",
    );
    expect(reviewMarkup).toContain(
      "I am interested in contributing to Acme&#x27;s product engineering team.",
    );
    expect(reviewMarkup).toContain(
      "Thank you for your consideration. I am available for an interview.",
    );
    expect(reviewMarkup).not.toContain("Professional Value");
    expect(reviewMarkup).not.toContain("Introduction");
    expect(reviewMarkup).not.toContain("Motivation");
    expect(reviewMarkup).not.toContain("<textarea");
    expect(reviewMarkup).not.toContain("<input");
    expect(reviewMarkup).not.toContain("Terminar edición");
    expect(reviewMarkup).not.toContain(">Guardar<");
    expect(reviewMarkup).not.toContain("Guardando…");
    expect(reviewMarkup).not.toContain("Carta de presentación guardada.");
    expect(reviewMarkup).not.toContain("Continuar a la exportación");

    const editMarkup = renderWithLocale(
      <ApplicationCoverLetter
        coverLetter={sampleCoverLetter}
        errorMessage={null}
        initialIsEditing
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
      />,
    );
    expect(editMarkup).toContain("Terminar edición");
    expect(editMarkup).toContain("Generar de nuevo");
    expect(editMarkup).toContain(">Guardar<");
    expect(editMarkup).toContain(
      "Edita el texto específico de la candidatura. Los datos del encabezado y la firma permanecen de solo lectura.",
    );
    expect(editMarkup).toContain("<textarea");
    expect(editMarkup).toContain('aria-label="Saludo"');
    expect(editMarkup).toContain('aria-label="Introducción"');
    expect(editMarkup).toContain('aria-label="Valor profesional"');
    expect(editMarkup).toContain('aria-label="Motivación"');
    expect(editMarkup).toContain('aria-label="Cierre"');
    expect(editMarkup).toContain("Dear Hiring Manager,");
    expect(editMarkup).toContain(
      "I am writing to apply for the Software Engineer role at Acme.",
    );
    expect(editMarkup).toContain(
      "My experience building TypeScript APIs aligns with your requirements.",
    );
    expect(editMarkup).toContain(
      "I am interested in contributing to Acme&#x27;s product engineering team.",
    );
    expect(editMarkup).toContain(
      "Thank you for your consideration. I am available for an interview.",
    );
    expect(editMarkup).toContain("Taylor Smith");
    expect(editMarkup).toContain("taylor@example.com");
    expect(editMarkup).toContain("+1 555 0100");
    expect(editMarkup).toContain("August 7, 2026");
    expect(editMarkup).toContain("Acme");
    expect(editMarkup).not.toContain("Professional Value");
    expect(editMarkup).not.toContain(">Editar<");
    expect(editMarkup).not.toContain("Continuar a la exportación");
    expect(editMarkup).not.toContain('aria-label="Candidate name"');
    expect(editMarkup).not.toContain('aria-label="Nombre del candidato"');
    expect(editMarkup).not.toContain('aria-label="Signature"');
    expect(editMarkup).not.toContain('aria-label="Firma"');

    const savingMarkup = renderWithLocale(
      <ApplicationCoverLetter
        coverLetter={sampleCoverLetter}
        errorMessage={null}
        isLoading={false}
        isSaving
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
      />,
    );
    expect(savingMarkup).toContain("Guardando…");
    expect(savingMarkup).toContain('disabled=""');

    const savedMarkup = renderWithLocale(
      <ApplicationCoverLetter
        coverLetter={sampleCoverLetter}
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onContinueToExport={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        savedMessage="Cover Letter saved."
      />,
    );
    expect(savedMarkup).toContain("Cover Letter saved.");
    expect(savedMarkup).toContain('role="status"');
    expect(savedMarkup).toContain("Continuar a la exportación");

    const continueWorkflowMarkup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="cover-letter"
        isJobAnalysisCompleted
        isProfileMatchCompleted
        isOptimizedCvCompleted
        isCoverLetterCompleted
        onSectionChange={() => undefined}
      >
        <ApplicationCoverLetter
          coverLetter={sampleCoverLetter}
          errorMessage={null}
          isLoading={false}
          onChange={() => undefined}
          onContinueToExport={() => undefined}
          onGenerate={() => undefined}
          onSave={() => undefined}
        />
      </ApplicationWorkspace>,
    );
    expect(continueWorkflowMarkup).toContain("Continuar a la exportación");
    expect(continueWorkflowMarkup).toContain(
      "Secciones completadas: Análisis del puesto, Coincidencia de perfil, CV optimizado, Carta de presentación",
    );
    expect(continueWorkflowMarkup).toContain("Siguiente paso recomendado:");
    expect(continueWorkflowMarkup).toContain("Exportación");
    expect(continueWorkflowMarkup).not.toContain("Bloqueada");

    const saveErrorMarkup = renderWithLocale(
      <ApplicationCoverLetter
        coverLetter={sampleCoverLetter}
        errorMessage={null}
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
        onSave={() => undefined}
        saveErrorMessage="Unable to save this Cover Letter."
      />,
    );
    expect(saveErrorMarkup).toContain("Unable to save this Cover Letter.");
    expect(saveErrorMarkup).toContain('role="alert"');

    const errorMarkup = renderWithLocale(
      <ApplicationCoverLetter
        coverLetter={null}
        errorMessage="Save an Optimized CV before generating a Cover Letter."
        isLoading={false}
        onChange={() => undefined}
        onGenerate={() => undefined}
      />,
    );
    expect(errorMarkup).toContain(
      "Save an Optimized CV before generating a Cover Letter.",
    );
    expect(errorMarkup).toContain("Reintentar");
  });

  it.each([
    {
      locale: "en" as const,
      title: "Cover Letter",
      kicker: "Application document",
      generate: "Generate Cover Letter",
      generateDescription:
        "Generate a Cover Letter tailored to this job opportunity from your Master CV, Job Analysis, Profile Match, and saved Optimized CV.",
      tryAgain: "Try again",
      loading: "Generating your Cover Letter…",
      reviewDescription: "Review the generated document",
      edit: "Edit",
      save: "Save",
      generateAgain: "Generate again",
      doneEditing: "Done editing",
      editDescription:
        "Edit the application-specific letter text. Header details and signature remain read-only.",
      greetingAria: "Greeting",
      introductionAria: "Introduction",
      professionalValueAria: "Professional value",
      motivationAria: "Motivation",
      closingAria: "Closing",
      continueToExport: "Continue to Export",
      saving: "Saving…",
    },
    {
      locale: "fr" as const,
      title: "Lettre de motivation",
      kicker: "Document de candidature",
      generate: "Générer la lettre de motivation",
      generateDescription:
        "Générez une lettre de motivation adaptée à cette offre à partir de votre CV maître, de l&#x27;analyse du poste, de la correspondance du profil et du CV optimisé enregistré.",
      tryAgain: "Réessayer",
      loading: "Génération de votre lettre de motivation…",
      reviewDescription: "Vérifiez le document généré",
      edit: "Modifier",
      save: "Enregistrer",
      generateAgain: "Générer à nouveau",
      doneEditing: "Terminer la modification",
      editDescription:
        "Modifiez le texte spécifique à la candidature. Les informations de l&#x27;en-tête et la signature restent en lecture seule.",
      greetingAria: "Salutation",
      introductionAria: "Introduction",
      professionalValueAria: "Valeur professionnelle",
      motivationAria: "Motivation",
      closingAria: "Clôture",
      continueToExport: "Continuer vers l&#x27;exportation",
      saving: "Enregistrement…",
    },
  ])(
    "translates Cover Letter when $locale is stored",
    ({
      locale,
      title,
      kicker,
      generate,
      generateDescription,
      tryAgain,
      loading,
      reviewDescription,
      edit,
      save,
      generateAgain,
      doneEditing,
      editDescription,
      greetingAria,
      introductionAria,
      professionalValueAria,
      motivationAria,
      closingAria,
      continueToExport,
      saving,
    }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      const sampleCoverLetter = {
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
      };

      const emptyMarkup = renderWithLocale(
        <ApplicationCoverLetter
          coverLetter={null}
          errorMessage={null}
          isLoading={false}
          onChange={() => undefined}
          onGenerate={() => undefined}
        />,
      );
      expect(emptyMarkup).toContain(title);
      expect(emptyMarkup).toContain(kicker);
      expect(emptyMarkup).toContain(generate);
      expect(emptyMarkup).toContain(generateDescription);

      const loadingMarkup = renderWithLocale(
        <ApplicationCoverLetter
          coverLetter={null}
          errorMessage={null}
          isLoading
          onChange={() => undefined}
          onGenerate={() => undefined}
        />,
      );
      expect(loadingMarkup).toContain(title);
      expect(loadingMarkup).toContain(loading);

      const errorMarkup = renderWithLocale(
        <ApplicationCoverLetter
          coverLetter={null}
          errorMessage="Save an Optimized CV before generating a Cover Letter."
          isLoading={false}
          onChange={() => undefined}
          onGenerate={() => undefined}
        />,
      );
      expect(errorMarkup).toContain(
        "Save an Optimized CV before generating a Cover Letter.",
      );
      expect(errorMarkup).toContain(tryAgain);

      const reviewMarkup = renderWithLocale(
        <ApplicationCoverLetter
          coverLetter={sampleCoverLetter}
          errorMessage={null}
          isLoading={false}
          onChange={() => undefined}
          onContinueToExport={() => undefined}
          onGenerate={() => undefined}
          onSave={() => undefined}
        />,
      );
      expect(reviewMarkup).toContain(title);
      expect(reviewMarkup).toContain(reviewDescription);
      expect(reviewMarkup).toContain(`>${edit}<`);
      expect(reviewMarkup).toContain(`>${save}<`);
      expect(reviewMarkup).toContain(generateAgain);
      expect(reviewMarkup).toContain(continueToExport);
      expect(reviewMarkup).toContain("Dear Hiring Manager,");
      expect(reviewMarkup).toContain("Taylor Smith");
      expect(reviewMarkup).toContain("Acme");
      expect(reviewMarkup).not.toContain(doneEditing);

      const editMarkup = renderWithLocale(
        <ApplicationCoverLetter
          coverLetter={sampleCoverLetter}
          errorMessage={null}
          initialIsEditing
          isLoading={false}
          onChange={() => undefined}
          onGenerate={() => undefined}
          onSave={() => undefined}
        />,
      );
      expect(editMarkup).toContain(doneEditing);
      expect(editMarkup).toContain(generateAgain);
      expect(editMarkup).toContain(`>${save}<`);
      expect(editMarkup).toContain(editDescription);
      expect(editMarkup).toContain(`aria-label="${greetingAria}"`);
      expect(editMarkup).toContain(`aria-label="${introductionAria}"`);
      expect(editMarkup).toContain(`aria-label="${professionalValueAria}"`);
      expect(editMarkup).toContain(`aria-label="${motivationAria}"`);
      expect(editMarkup).toContain(`aria-label="${closingAria}"`);
      expect(editMarkup).toContain("Dear Hiring Manager,");
      expect(editMarkup).toContain("Taylor Smith");
      expect(editMarkup).not.toContain(`>${edit}<`);

      const savingMarkup = renderWithLocale(
        <ApplicationCoverLetter
          coverLetter={sampleCoverLetter}
          errorMessage={null}
          isLoading={false}
          isSaving
          onChange={() => undefined}
          onGenerate={() => undefined}
          onSave={() => undefined}
        />,
      );
      expect(savingMarkup).toContain(saving);
    },
  );

  it("keeps Cover Letter locked until a saved Optimized CV exists", () => {
    const markup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="optimized-cv"
        isJobAnalysisCompleted
        isProfileMatchCompleted
        isOptimizedCvCompleted={false}
        isCoverLetterCompleted={false}
        onSectionChange={() => undefined}
      >
        <p>Optimized CV content</p>
      </ApplicationWorkspace>,
    );

    expect(markup).toContain(
      "Secciones completadas: Análisis del puesto, Coincidencia de perfil",
    );
    expect(markup).toContain("Siguiente paso recomendado:");
    expect(markup).toContain("CV optimizado");
    expect(markup.match(/<button[^>]*disabled=""/g)).toHaveLength(2);
    expect(markup).toContain("Bloqueada");
  });

  it("keeps Export locked until a saved Cover Letter exists", () => {
    const markup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="cover-letter"
        isJobAnalysisCompleted
        isProfileMatchCompleted
        isOptimizedCvCompleted
        isCoverLetterCompleted={false}
        onSectionChange={() => undefined}
      >
        <p>Cover Letter content</p>
      </ApplicationWorkspace>,
    );

    expect(markup).toContain(
      "Secciones completadas: Análisis del puesto, Coincidencia de perfil, CV optimizado",
    );
    expect(markup).toContain("Siguiente paso recomendado:");
    expect(markup).toContain("Carta de presentación");
    expect(markup.match(/<button[^>]*disabled=""/g)).toHaveLength(1);
    expect(markup).toContain("Bloqueada");
  });

  it("previews saved application documents in Export without editing controls", () => {
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
      personalProjects: [
        {
          name: "Career Copilot",
          description: "AI career assistant built with TypeScript.",
          technologies: "TypeScript, React",
          url: "https://example.com/career-copilot",
        },
      ],
    };
    const sampleCoverLetter = {
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
    };

    const markup = renderWorkspace(
      <ApplicationWorkspace
        company="Example Company"
        title="Frontend Engineer"
        status="NEW"
        activeSection="export"
        isJobAnalysisCompleted
        isProfileMatchCompleted
        isOptimizedCvCompleted
        isCoverLetterCompleted
        onSectionChange={() => undefined}
      >
        <ApplicationExport
          applicationId="application-id"
          coverLetter={sampleCoverLetter}
          optimizedCv={sampleOptimizedCv}
        />
      </ApplicationWorkspace>,
    );

    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Exportación");
    expect(markup).toContain("Documentos de candidatura");
    expect(markup).toContain(
      "Secciones completadas: Análisis del puesto, Coincidencia de perfil, CV optimizado, Carta de presentación",
    );
    expect(markup).toContain("Siguiente paso recomendado:");
    expect(markup).toContain(
      "Previsualiza los últimos documentos de candidatura guardados y elige cuáles se descargarán.",
    );
    expect(markup).toContain("Documentos a descargar");
    expect(markup).toContain(
      '<label class="flex items-center gap-2 text-sm font-medium text-ink"><input type="checkbox" checked=""',
    );
    expect(markup).toContain(">CV optimizado</label>");
    expect(markup).toContain(">Carta de presentación</label>");
    expect(markup).toContain(">Descargar</button>");
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Vista previa del documento"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('aria-label="CV optimizado"');
    expect(markup).toContain("<header");
    expect(markup).toContain("<aside");
    expect(markup).toContain("minmax(0,68fr)_minmax(0,32fr)");
    expect(markup).toContain("Taylor Smith");
    expect(markup).toContain("TypeScript engineer building APIs.");
    expect(markup).toContain("text-justify");
    expect(markup).toContain("Built REST APIs with TypeScript.");
    expect(markup).toContain("TypeScript · Node.js");
    expect(markup).toContain("Proyectos personales");
    expect(markup.indexOf("Proyectos personales")).toBeGreaterThan(
      markup.indexOf("</aside>"),
    );
    expect(markup).toContain("Career Copilot");
    expect(markup).not.toContain("Personal information");
    expect(markup).not.toContain("Información personal");
    expect(markup).not.toContain('aria-label="Carta de presentación"');
    expect(markup).not.toContain("Dear Hiring Manager,");
    expect(markup).not.toContain(">Edit<");
    expect(markup).not.toContain(">Editar<");
    expect(markup).not.toContain(">Save<");
    expect(markup).not.toContain(">Guardar<");
    expect(markup).not.toContain("Generate again");
    expect(markup).not.toContain("Generar de nuevo");
    expect(markup).not.toContain("<textarea");
    expect(markup).not.toContain("Export progress");
    expect(markup).not.toContain(
      "No exportable documents are currently available.",
    );
    expect(markup).not.toContain(
      "Se necesita un CV optimizado y una carta de presentación guardados",
    );
  });

  it("shows a prerequisite empty state when Export documents are missing", () => {
    const markup = renderWithLocale(
      <ApplicationExport
        applicationId="application-id"
        coverLetter={null}
        optimizedCv={null}
      />,
    );

    expect(markup).toContain("Exportación");
    expect(markup).toContain("Documentos de candidatura");
    expect(markup).toContain(
      "Se necesita un CV optimizado y una carta de presentación guardados antes de previsualizar los documentos.",
    );
    expect(markup).not.toContain(">Descargar<");
    expect(markup).not.toContain('role="tablist"');
    expect(markup).not.toContain("Taylor Smith");
  });

  it.each([
    {
      locale: "en" as const,
      title: "Export",
      kicker: "Application documents",
      description:
        "Preview the latest saved application documents and choose which ones will be downloaded.",
      documentsToDownload: "Documents to download",
      optimizedCv: "Optimized CV",
      coverLetter: "Cover Letter",
      download: "Download",
      previewAria: "Document preview",
      requiresDocuments:
        "Saved Optimized CV and Cover Letter are required before documents can be previewed.",
    },
    {
      locale: "fr" as const,
      title: "Exportation",
      kicker: "Documents de candidature",
      description:
        "Prévisualisez les derniers documents de candidature enregistrés et choisissez ceux qui seront téléchargés.",
      documentsToDownload: "Documents à télécharger",
      optimizedCv: "CV optimisé",
      coverLetter: "Lettre de motivation",
      download: "Télécharger",
      previewAria: "Aperçu du document",
      requiresDocuments:
        "Un CV optimisé et une lettre de motivation enregistrés sont requis avant de prévisualiser les documents.",
    },
  ])(
    "translates Export when $locale is stored",
    ({
      locale,
      title,
      kicker,
      description,
      documentsToDownload,
      optimizedCv,
      coverLetter,
      download,
      previewAria,
      requiresDocuments,
    }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

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
            company: "Acme",
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
        personalProjects: [
          {
            name: "Career Copilot",
            description: "AI career assistant built with TypeScript.",
            technologies: "TypeScript, React",
            url: "https://example.com/career-copilot",
          },
        ],
      };
      const sampleCoverLetter = {
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
      };

      const emptyMarkup = renderWithLocale(
        <ApplicationExport
          applicationId="application-id"
          coverLetter={null}
          optimizedCv={null}
        />,
      );
      expect(emptyMarkup).toContain(title);
      expect(emptyMarkup).toContain(kicker);
      expect(emptyMarkup).toContain(description);
      expect(emptyMarkup).toContain(requiresDocuments);
      expect(emptyMarkup).not.toContain(`>${download}<`);

      const previewMarkup = renderWithLocale(
        <ApplicationExport
          applicationId="application-id"
          coverLetter={sampleCoverLetter}
          optimizedCv={sampleOptimizedCv}
        />,
      );
      expect(previewMarkup).toContain(title);
      expect(previewMarkup).toContain(kicker);
      expect(previewMarkup).toContain(description);
      expect(previewMarkup).toContain(documentsToDownload);
      expect(previewMarkup).toContain(`>${optimizedCv}</label>`);
      expect(previewMarkup).toContain(`>${coverLetter}</label>`);
      expect(previewMarkup).toContain(`>${download}</button>`);
      expect(previewMarkup).toContain(`aria-label="${previewAria}"`);
      expect(previewMarkup).toContain(`aria-label="${optimizedCv}"`);
      expect(previewMarkup).toContain("Taylor Smith");
      expect(previewMarkup).toContain("TypeScript engineer building APIs.");
      expect(previewMarkup).toContain("Career Copilot");
      expect(previewMarkup).not.toContain(`aria-label="${coverLetter}"`);
      expect(previewMarkup).not.toContain("Dear Hiring Manager,");
      expect(previewMarkup).not.toContain(requiresDocuments);
    },
  );

  it("keeps at least one export document selected", () => {
    const bothSelected = { optimizedCv: true, coverLetter: true };

    expect(updateDocumentSelection(bothSelected, "optimizedCv", false)).toEqual(
      {
        optimizedCv: false,
        coverLetter: true,
      },
    );
    expect(
      updateDocumentSelection(
        { optimizedCv: false, coverLetter: true },
        "coverLetter",
        false,
      ),
    ).toEqual({
      optimizedCv: false,
      coverLetter: true,
    });
    expect(
      updateDocumentSelection(
        { optimizedCv: true, coverLetter: false },
        "optimizedCv",
        false,
      ),
    ).toEqual({
      optimizedCv: true,
      coverLetter: false,
    });
    expect(
      updateDocumentSelection(
        { optimizedCv: false, coverLetter: true },
        "optimizedCv",
        true,
      ),
    ).toEqual({
      optimizedCv: true,
      coverLetter: true,
    });
  });

  it("renders Google sign in", () => {
    const markup = renderApp("/login", null);

    expect(markup).toContain("Welcome");
    expect(markup).toContain("Continue with Google");
  });

  it("renders the job analysis form", () => {
    const markup = renderApp("/applications/new");

    expect(markup).toContain("Analiza una descripción de puesto");
    expect(markup).toContain("Solo texto plano");
    expect(markup).toMatch(
      /<textarea[^>]*id="jobDescription"[^>]*required[^>]*>/,
    );
    expect(markup).toContain("Analizar puesto");
    expect(markup).toContain("Cancelar");
    expect(markup).toContain("La descripción del puesto es obligatoria.");
  });

  it("validates job description boundaries", () => {
    expect(jobDescriptionError("")).toBe("jobAnalysis.validation.required");
    expect(jobDescriptionError("a".repeat(299))).toBe(
      "jobAnalysis.validation.tooShort",
    );
    expect(jobDescriptionError("a".repeat(300))).toBeNull();
    expect(jobDescriptionError("a".repeat(25_000))).toBeNull();
    expect(jobDescriptionError("a".repeat(25_001))).toBe(
      "jobAnalysis.validation.tooLong",
    );
    expect(jobDescriptionError("Role details ".repeat(30))).toBeNull();
    expect(jobDescriptionError(`${"a".repeat(300)}\u0000`)).toBe(
      "jobAnalysis.validation.plainText",
    );
  });

  it.each([
    {
      locale: "en" as const,
      kicker: "New application",
      title: "Analyze a job description",
      description:
        "Paste the complete offer. Career Copilot will extract only information present in the source and create your application workspace.",
      label: "Job description",
      help: "Plain text only. Enter between 300 and 25,000 characters.",
      placeholder: "Paste the complete job description here…",
      required: "Job description is required.",
      analyze: "Analyze job",
      cancel: "Cancel",
    },
    {
      locale: "fr" as const,
      kicker: "Nouvelle candidature",
      title: "Analyser une description de poste",
      description:
        "Collez l&#x27;offre complète. Career Copilot n&#x27;extraira que les informations présentes dans la source et créera votre espace de travail de candidature.",
      label: "Description du poste",
      help: "Texte brut uniquement. Saisissez entre 300 et 25 000 caractères.",
      placeholder: "Collez ici la description complète du poste…",
      required: "La description du poste est obligatoire.",
      analyze: "Analyser le poste",
      cancel: "Annuler",
    },
  ])(
    "translates the Job Analysis form when $locale is stored",
    ({
      locale,
      kicker,
      title,
      description,
      label,
      help,
      placeholder,
      required,
      analyze,
      cancel,
    }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      const markup = renderApp("/applications/new");

      expect(markup).toContain(kicker);
      expect(markup).toContain(title);
      expect(markup).toContain(description);
      expect(markup).toContain(label);
      expect(markup).toContain(help);
      expect(markup).toContain(placeholder);
      expect(markup).toContain(required);
      expect(markup).toContain(analyze);
      expect(markup).toContain(cancel);
    },
  );

  it("renders application form fields without relying only on native validation", () => {
    const markup = renderToStaticMarkup(
      <ApplicationForm
        submitLabel="Save"
        onSubmit={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(markup).toContain("noValidate");
    expect(markup).toContain("Company name");
    expect(markup).toContain("Job title");
    expect(markup).toContain("Job URL");
    expect(markup).toContain("Job Description");
    expect(markup).toContain('id="jobUrl"');
    expect(markup).toContain('data-field="jobUrl"');
    expect(markup).toContain('data-field="companyName"');
  });

  it("renders a validation toast that identifies unsaved invalid fields", () => {
    const markup = renderToStaticMarkup(
      <ValidationToast message="Changes could not be saved. Phone has a validation error." />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("cc-toast");
    expect(markup).toContain(
      "Changes could not be saved. Phone has a validation error.",
    );
  });

  it("renders every Master CV section", () => {
    const markup = renderWithLocale(
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

    expect(markup).toContain("Información personal");
    expect(markup).toContain("Resumen profesional");
    expect(markup).toContain("Experiencia");
    expect(markup).toContain("Formación");
    expect(markup).toContain("Proyectos personales");
    expect(markup).toContain("Competencias");
    expect(markup).toContain("Idiomas");
    expect(markup).toContain("Certificaciones");
    expect(markup).toContain("Save Master CV");
    expect(markup).toContain("noValidate");
    expect(markup).toContain('data-field="phone"');
    expect(markup).toContain('data-field="fullName"');
  });

  it.each([
    {
      locale: "en" as const,
      personalInformation: "Personal information",
      personalProjects: "Personal projects",
      importAction: "Import Existing CV",
    },
    {
      locale: "fr" as const,
      personalInformation: "Informations personnelles",
      personalProjects: "Projets personnels",
      importAction: "Importer un CV existant",
    },
  ])(
    "translates Master CV form chrome when $locale is stored",
    ({ locale, personalInformation, personalProjects, importAction }) => {
      const storage = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
        clear() {
          storage.clear();
        },
      });
      writeStoredLocale(locale);

      const formMarkup = renderWithLocale(
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
      const importMarkup = renderWithLocale(
        <MasterCvImport onImport={() => undefined} />,
      );

      expect(formMarkup).toContain(personalInformation);
      expect(formMarkup).toContain(personalProjects);
      expect(importMarkup).toContain(importAction);
    },
  );

  it("renders the existing CV import action", () => {
    const markup = renderWithLocale(
      <MasterCvImport onImport={() => undefined} />,
    );

    expect(markup).toContain("Importar CV existente");
    expect(markup).toContain('aria-label="Importar un archivo PDF de CV"');
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
      personalProjects: [],
    });

    expect(input.fullName).toBe("Taylor Smith");
    expect(input.email).toBe("");
    expect(input.professionalSummary).toBe("");
    expect(input.location).toBe("Berlin");
    expect(input.skills).toEqual(["TypeScript"]);
    expect(input.personalProjects).toEqual([]);
  });

  it("renders personal project fields and independent collection ordering", () => {
    const markup = renderWithLocale(
      <MasterCvForm
        initialValue={{
          fullName: "Taylor Smith",
          email: "taylor@example.com",
          phone: null,
          location: null,
          linkedin: null,
          portfolio: null,
          professionalSummary: "Software engineer",
          experience: [
            {
              jobTitle: "Editor",
              company: "BigTrail Magazine",
              location: null,
              startDate: null,
              endDate: null,
              current: false,
              description: null,
            },
            {
              jobTitle: "Engineer",
              company: "TechNova Solutions",
              location: null,
              startDate: null,
              endDate: null,
              current: true,
              description: null,
            },
          ],
          education: [
            {
              institution: "School",
              degree: "DAW",
              fieldOfStudy: null,
              startDate: null,
              endDate: null,
              description: null,
            },
            {
              institution: "Bootcamp",
              degree: "Full-Stack AI",
              fieldOfStudy: null,
              startDate: null,
              endDate: null,
              description: null,
            },
          ],
          skills: ["TypeScript"],
          languages: [],
          certifications: [],
          personalProjects: [
            {
              name: "Career Copilot",
              description: "AI career assistant",
              technologies: "TypeScript",
              url: null,
            },
            {
              name: "AI Developer Copilot",
              description: "Developer assistant",
              technologies: null,
              url: null,
            },
          ],
        }}
        submitLabel="Save changes"
        isSaving={false}
        errorMessage={null}
        onSubmit={() => Promise.resolve()}
      />,
    );

    expect(markup).toContain("Proyectos personales");
    expect(markup).toContain("Nombre del proyecto");
    expect(markup).toContain("Breve descripción");
    expect(markup).toContain("Tecnologías");
    expect(markup).toContain("URL del proyecto");
    expect(markup).toContain("Career Copilot");
    expect(markup).toContain("BigTrail Magazine");
    expect(markup).toContain("AI Developer Copilot");
    expect(markup).toContain("AI career assistant");
    expect(markup).toContain("Eliminar proyecto");
    expect(markup).toContain('aria-label="Subir experiencia"');
    expect(markup).toContain('aria-label="Bajar experiencia"');
    expect(markup).toContain('aria-label="Subir formación"');
    expect(markup).toContain('aria-label="Bajar formación"');
    expect(markup).toContain('aria-label="Subir proyecto personal"');
    expect(markup).toContain('aria-label="Bajar proyecto personal"');
  });

  it("keeps spaces and punctuation in Master CV fields while editing", () => {
    expect(optionalFieldValue("Product Manager ")).toBe("Product Manager ");
    expect(optionalFieldValue("New York")).toBe("New York");
    expect(optionalFieldValue("C++ / TypeScript")).toBe("C++ / TypeScript");
    expect(optionalFieldValue("Hello, world!")).toBe("Hello, world!");
    expect(optionalFieldValue("123 456")).toBe("123 456");
    expect(optionalFieldValue("")).toBe(null);
  });

  it("trims Master CV optional fields only when submitting", () => {
    expect(nullable("Product Manager ")).toBe("Product Manager");
    expect(nullable("  New York  ")).toBe("New York");
    expect(nullable("   ")).toBe(null);
  });
});
