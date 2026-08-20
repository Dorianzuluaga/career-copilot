import { describe, expect, it } from "vitest";
import { catalogs, spanishMessages, type TranslationKey } from "./messages";
import { interpolate, translate } from "./translate";

function collectKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    return prefix ? [prefix] : [];
  }
  if (typeof value !== "object" || value === null) {
    return [];
  }

  return Object.entries(value).flatMap(([key, nested]) =>
    collectKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

describe("translate", () => {
  it("returns the interface string for the selected language", () => {
    expect(translate("es", "languageSelector.label")).toBe("Idioma");
    expect(translate("en", "languageSelector.label")).toBe("Language");
    expect(translate("fr", "languageSelector.label")).toBe("Langue");
    expect(translate("es", "nav.dashboard")).toBe("Panel");
    expect(translate("en", "nav.dashboard")).toBe("Dashboard");
    expect(translate("fr", "nav.dashboard")).toBe("Tableau de bord");
    expect(translate("es", "nav.masterCv")).toBe("CV Maestro");
    expect(translate("en", "nav.masterCv")).toBe("Master CV");
    expect(translate("fr", "nav.masterCv")).toBe("CV maître");
    expect(translate("es", "nav.profile")).toBe("Perfil");
    expect(translate("en", "nav.profile")).toBe("Profile");
    expect(translate("fr", "nav.profile")).toBe("Profil");
    expect(translate("es", "nav.main")).toBe("Principal");
    expect(translate("en", "nav.main")).toBe("Main");
    expect(translate("fr", "nav.main")).toBe("Principal");
    expect(translate("es", "nav.account")).toBe("Cuenta");
    expect(translate("en", "nav.account")).toBe("Account");
    expect(translate("fr", "nav.account")).toBe("Compte");
    expect(translate("es", "dashboard.title")).toBe("Panel de candidaturas");
    expect(translate("en", "dashboard.title")).toBe("Application dashboard");
    expect(translate("fr", "dashboard.title")).toBe("Tableau de candidatures");
    expect(translate("es", "dashboard.newApplication")).toBe(
      "Nueva candidatura",
    );
    expect(translate("en", "dashboard.newApplication")).toBe("New Application");
    expect(translate("fr", "dashboard.newApplication")).toBe(
      "Nouvelle candidature",
    );
    expect(translate("es", "dashboard.open")).toBe("Abrir");
    expect(translate("en", "dashboard.open")).toBe("Open");
    expect(translate("fr", "dashboard.open")).toBe("Ouvrir");
    expect(translate("es", "masterCv.onboarding.title")).toBe(
      "¿Ya tienes un CV?",
    );
    expect(translate("en", "masterCv.onboarding.title")).toBe(
      "Do you already have a CV?",
    );
    expect(translate("fr", "masterCv.onboarding.title")).toBe(
      "Avez-vous déjà un CV ?",
    );
    expect(translate("es", "masterCv.editor.title")).toBe(
      "Edita tu CV Maestro",
    );
    expect(translate("en", "masterCv.editor.title")).toBe(
      "Edit your Master CV",
    );
    expect(translate("fr", "masterCv.editor.title")).toBe(
      "Modifier votre CV maître",
    );
    expect(translate("es", "masterCv.form.personalProjects")).toBe(
      "Proyectos personales",
    );
    expect(translate("en", "masterCv.form.personalProjects")).toBe(
      "Personal projects",
    );
    expect(translate("fr", "masterCv.form.personalProjects")).toBe(
      "Projets personnels",
    );
    expect(translate("es", "masterCv.import.action")).toBe(
      "Importar CV existente",
    );
    expect(translate("en", "masterCv.import.action")).toBe(
      "Import Existing CV",
    );
    expect(translate("fr", "masterCv.import.action")).toBe(
      "Importer un CV existant",
    );
    expect(translate("es", "workspace.sections.jobAnalysis")).toBe(
      "Análisis del puesto",
    );
    expect(translate("en", "workspace.sections.jobAnalysis")).toBe(
      "Job Analysis",
    );
    expect(translate("fr", "workspace.sections.jobAnalysis")).toBe(
      "Analyse du poste",
    );
    expect(translate("es", "workspace.locked")).toBe("Bloqueada");
    expect(translate("en", "workspace.locked")).toBe("Locked");
    expect(translate("fr", "workspace.locked")).toBe("Verrouillée");
    expect(translate("es", "workspace.unsaved.saveAndContinue")).toBe(
      "Guardar y continuar",
    );
    expect(translate("en", "workspace.unsaved.saveAndContinue")).toBe(
      "Save and Continue",
    );
    expect(translate("fr", "workspace.unsaved.saveAndContinue")).toBe(
      "Enregistrer et continuer",
    );
    expect(translate("es", "jobAnalysis.page.title")).toBe(
      "Analiza una descripción de puesto",
    );
    expect(translate("en", "jobAnalysis.page.title")).toBe(
      "Analyze a job description",
    );
    expect(translate("fr", "jobAnalysis.page.title")).toBe(
      "Analyser une description de poste",
    );
    expect(translate("es", "jobAnalysis.form.analyze")).toBe("Analizar puesto");
    expect(translate("en", "jobAnalysis.form.analyze")).toBe("Analyze job");
    expect(translate("fr", "jobAnalysis.form.analyze")).toBe(
      "Analyser le poste",
    );
    expect(translate("es", "jobAnalysis.result.requiredSkills")).toBe(
      "Competencias requeridas",
    );
    expect(translate("en", "jobAnalysis.result.requiredSkills")).toBe(
      "Required skills",
    );
    expect(translate("fr", "jobAnalysis.result.requiredSkills")).toBe(
      "Compétences requises",
    );
    expect(translate("es", "profileMatch.title")).toBe(
      "Coincidencia de perfil",
    );
    expect(translate("en", "profileMatch.title")).toBe("Profile Match");
    expect(translate("fr", "profileMatch.title")).toBe(
      "Correspondance du profil",
    );
    expect(translate("es", "profileMatch.compare")).toBe("Comparar perfil");
    expect(translate("en", "profileMatch.compare")).toBe("Compare profile");
    expect(translate("fr", "profileMatch.compare")).toBe("Comparer le profil");
    expect(translate("es", "profileMatch.matchingSkills")).toBe(
      "Competencias coincidentes",
    );
    expect(translate("en", "profileMatch.matchingSkills")).toBe(
      "Matching Skills",
    );
    expect(translate("fr", "profileMatch.matchingSkills")).toBe(
      "Compétences correspondantes",
    );
    expect(translate("es", "optimizedCv.generate")).toBe(
      "Generar CV optimizado",
    );
    expect(translate("en", "optimizedCv.generate")).toBe(
      "Generate Optimized CV",
    );
    expect(translate("fr", "optimizedCv.generate")).toBe(
      "Générer le CV optimisé",
    );
    expect(translate("es", "optimizedCv.personalProjects")).toBe(
      "Proyectos personales",
    );
    expect(translate("en", "optimizedCv.personalProjects")).toBe(
      "Personal projects",
    );
    expect(translate("fr", "optimizedCv.personalProjects")).toBe(
      "Projets personnels",
    );
    expect(translate("es", "coverLetter.generate")).toBe(
      "Generar carta de presentación",
    );
    expect(translate("en", "coverLetter.generate")).toBe(
      "Generate Cover Letter",
    );
    expect(translate("fr", "coverLetter.generate")).toBe(
      "Générer la lettre de motivation",
    );
    expect(translate("es", "coverLetter.continueToExport")).toBe(
      "Continuar a la exportación",
    );
    expect(translate("en", "coverLetter.continueToExport")).toBe(
      "Continue to Export",
    );
    expect(translate("fr", "coverLetter.continueToExport")).toBe(
      "Continuer vers l'exportation",
    );
    expect(translate("es", "export.title")).toBe("Exportación");
    expect(translate("en", "export.title")).toBe("Export");
    expect(translate("fr", "export.title")).toBe("Exportation");
    expect(translate("es", "export.download")).toBe("Descargar");
    expect(translate("en", "export.download")).toBe("Download");
    expect(translate("fr", "export.download")).toBe("Télécharger");
    expect(translate("es", "export.documentsToDownload")).toBe(
      "Documentos a descargar",
    );
    expect(translate("en", "export.documentsToDownload")).toBe(
      "Documents to download",
    );
    expect(translate("fr", "export.documentsToDownload")).toBe(
      "Documents à télécharger",
    );
  });

  it("interpolates values in interface strings", () => {
    expect(interpolate("Hola, {name}", { name: "Taylor" })).toBe(
      "Hola, Taylor",
    );
    expect(interpolate("Hola, {name}")).toBe("Hola, {name}");
    expect(
      translate("en", "dashboard.deleteConfirm", {
        jobTitle: "Engineer",
        company: "Acme",
      }),
    ).toBe("Delete the application for Engineer at Acme?");
    expect(translate("es", "dashboard.created", { date: "20/8/2026" })).toBe(
      "Creada el 20/8/2026",
    );
    expect(
      translate("es", "workspace.completedSections", {
        sections: "Análisis del puesto",
      }),
    ).toBe("Secciones completadas: Análisis del puesto");
    expect(
      translate("en", "masterCv.form.moveUpAria", { label: "experience" }),
    ).toBe("Move experience up");
    expect(
      translate("es", "masterCv.toast.experienceStartDate", { position: 1 }),
    ).toBe("Fecha de inicio de la experiencia 1");
    expect(translate("en", "jobAnalysis.result.version", { version: 1 })).toBe(
      "Version 1",
    );
    expect(translate("es", "jobAnalysis.result.version", { version: 2 })).toBe(
      "Versión 2",
    );
    expect(translate("en", "profileMatch.scoreAria", { score: 72 })).toBe(
      "ATS match score: 72%",
    );
    expect(translate("es", "profileMatch.scoreAria", { score: 72 })).toBe(
      "Puntuación de coincidencia ATS: 72%",
    );
    expect(
      translate("en", "optimizedCv.experienceDescriptionAria", {
        position: 1,
      }),
    ).toBe("Experience description 1");
    expect(
      translate("es", "optimizedCv.personalProjectDescriptionAria", {
        position: 2,
      }),
    ).toBe("Descripción del proyecto personal 2");
  });

  it("falls back to the key when a message is missing", () => {
    expect(translate("en", "missing.key" as TranslationKey)).toBe(
      "missing.key",
    );
  });

  it("keeps catalogs aligned so screens can share one component tree", () => {
    const expectedKeys = collectKeys(spanishMessages);
    const requiredKeys: TranslationKey[] = [
      "languageSelector.label",
      "nav.dashboard",
      "nav.masterCv",
      "nav.profile",
      "nav.main",
      "nav.account",
      "dashboard.title",
      "dashboard.description",
      "dashboard.editMasterCv",
      "dashboard.newApplication",
      "dashboard.unexpectedError",
      "dashboard.tryAgain",
      "dashboard.loading",
      "dashboard.emptyTitle",
      "dashboard.emptyDescription",
      "dashboard.deleteConfirm",
      "dashboard.fallbackJobTitle",
      "dashboard.fallbackCompany",
      "dashboard.companyUnknown",
      "dashboard.untitledOpportunity",
      "dashboard.created",
      "dashboard.open",
      "dashboard.delete",
      "dashboard.deleting",
      "masterCv.kicker",
      "masterCv.onboarding.loading",
      "masterCv.onboarding.title",
      "masterCv.onboarding.description",
      "masterCv.onboarding.uploadTitle",
      "masterCv.onboarding.uploadDescription",
      "masterCv.onboarding.manualTitle",
      "masterCv.onboarding.manualDescription",
      "masterCv.onboarding.back",
      "masterCv.onboarding.uploadHeading",
      "masterCv.onboarding.uploadHint",
      "masterCv.onboarding.fileLabel",
      "masterCv.onboarding.extracting",
      "masterCv.onboarding.uploadAndExtract",
      "masterCv.onboarding.retry",
      "masterCv.onboarding.completeManually",
      "masterCv.onboarding.reviewKicker",
      "masterCv.onboarding.reviewTitle",
      "masterCv.onboarding.reviewDescription",
      "masterCv.onboarding.save",
      "masterCv.onboarding.extractFailed",
      "masterCv.onboarding.saveFailed",
      "masterCv.editor.loading",
      "masterCv.editor.kicker",
      "masterCv.editor.title",
      "masterCv.editor.description",
      "masterCv.editor.save",
      "masterCv.editor.saved",
      "masterCv.editor.loadFailed",
      "masterCv.editor.saveFailed",
      "masterCv.import.action",
      "masterCv.import.importing",
      "masterCv.import.confirm",
      "masterCv.import.extractFailed",
      "masterCv.import.fileLabel",
      "masterCv.form.add",
      "masterCv.form.moveUp",
      "masterCv.form.moveDown",
      "masterCv.form.moveUpAria",
      "masterCv.form.moveDownAria",
      "masterCv.form.saving",
      "masterCv.form.personalInformation",
      "masterCv.form.fullName",
      "masterCv.form.email",
      "masterCv.form.phone",
      "masterCv.form.location",
      "masterCv.form.linkedin",
      "masterCv.form.portfolio",
      "masterCv.form.professionalSummary",
      "masterCv.form.experience",
      "masterCv.form.experienceItem",
      "masterCv.form.jobTitle",
      "masterCv.form.company",
      "masterCv.form.startDate",
      "masterCv.form.endDate",
      "masterCv.form.currentRole",
      "masterCv.form.description",
      "masterCv.form.removeExperience",
      "masterCv.form.education",
      "masterCv.form.educationItem",
      "masterCv.form.institution",
      "masterCv.form.degree",
      "masterCv.form.fieldOfStudy",
      "masterCv.form.removeEducation",
      "masterCv.form.personalProjects",
      "masterCv.form.personalProjectItem",
      "masterCv.form.projectName",
      "masterCv.form.projectUrl",
      "masterCv.form.briefDescription",
      "masterCv.form.technologies",
      "masterCv.form.removeProject",
      "masterCv.form.skills",
      "masterCv.form.skillsLabel",
      "masterCv.form.languages",
      "masterCv.form.language",
      "masterCv.form.proficiency",
      "masterCv.form.remove",
      "masterCv.form.certifications",
      "masterCv.form.certification",
      "masterCv.form.issuer",
      "masterCv.form.issueDate",
      "masterCv.form.credentialUrl",
      "masterCv.form.removeCertification",
      "masterCv.validation.fullNameRequired",
      "masterCv.validation.emailRequired",
      "masterCv.validation.emailInvalid",
      "masterCv.validation.phoneInvalid",
      "masterCv.validation.urlInvalid",
      "masterCv.validation.professionalSummaryRequired",
      "masterCv.validation.skillsRequired",
      "masterCv.validation.dateInvalid",
      "masterCv.toast.single",
      "masterCv.toast.multiple",
      "masterCv.toast.pair",
      "masterCv.toast.list",
      "masterCv.toast.more",
      "masterCv.toast.experienceStartDate",
      "masterCv.toast.experienceEndDate",
      "masterCv.toast.educationStartDate",
      "masterCv.toast.educationEndDate",
      "masterCv.toast.projectUrl",
      "masterCv.toast.certificationIssueDate",
      "masterCv.toast.certificationCredentialUrl",
      "workspace.contentAriaLabel",
      "workspace.sectionsAriaLabel",
      "workspace.kicker",
      "workspace.overviewDescription",
      "workspace.company",
      "workspace.jobTitle",
      "workspace.status",
      "workspace.created",
      "workspace.lastUpdated",
      "workspace.loading",
      "workspace.notFoundTitle",
      "workspace.notFoundDescription",
      "workspace.returnToDashboard",
      "workspace.unexpectedError",
      "workspace.current",
      "workspace.completed",
      "workspace.available",
      "workspace.locked",
      "workspace.completedSections",
      "workspace.completedNone",
      "workspace.nextStep",
      "workspace.sections.overview",
      "workspace.sections.jobAnalysis",
      "workspace.sections.profileMatch",
      "workspace.sections.optimizedCv",
      "workspace.sections.coverLetter",
      "workspace.sections.export",
      "workspace.unsaved.title",
      "workspace.unsaved.description",
      "workspace.unsaved.cancel",
      "workspace.unsaved.leaveWithoutSaving",
      "workspace.unsaved.saveAndContinue",
      "workspace.unsaved.saving",
      "jobAnalysis.page.kicker",
      "jobAnalysis.page.title",
      "jobAnalysis.page.description",
      "jobAnalysis.page.unexpectedError",
      "jobAnalysis.form.label",
      "jobAnalysis.form.placeholder",
      "jobAnalysis.form.help",
      "jobAnalysis.form.analysisFailed",
      "jobAnalysis.form.retryStoredHint",
      "jobAnalysis.form.reviewHint",
      "jobAnalysis.form.cancel",
      "jobAnalysis.form.analyzing",
      "jobAnalysis.form.retry",
      "jobAnalysis.form.analyze",
      "jobAnalysis.validation.required",
      "jobAnalysis.validation.tooShort",
      "jobAnalysis.validation.tooLong",
      "jobAnalysis.validation.plainText",
      "jobAnalysis.result.originalTitle",
      "jobAnalysis.result.notAvailable",
      "jobAnalysis.result.title",
      "jobAnalysis.result.version",
      "jobAnalysis.result.employmentType",
      "jobAnalysis.result.location",
      "jobAnalysis.result.experienceLevel",
      "jobAnalysis.result.education",
      "jobAnalysis.result.languages",
      "jobAnalysis.result.notProvided",
      "jobAnalysis.result.summary",
      "jobAnalysis.result.notIdentified",
      "jobAnalysis.result.requiredSkills",
      "jobAnalysis.result.responsibilities",
      "jobAnalysis.result.atsKeywords",
      "profileMatch.title",
      "profileMatch.description",
      "profileMatch.atsMatch",
      "profileMatch.scoreAria",
      "profileMatch.loading",
      "profileMatch.unexpectedError",
      "profileMatch.compare",
      "profileMatch.tryAgain",
      "profileMatch.returnToJobAnalysis",
      "profileMatch.matchingSkills",
      "profileMatch.missingSkills",
      "profileMatch.strengths",
      "profileMatch.weaknesses",
      "profileMatch.recommendation",
      "profileMatch.noneIdentified",
      "optimizedCv.title",
      "optimizedCv.kicker",
      "optimizedCv.generateDescription",
      "optimizedCv.generate",
      "optimizedCv.tryAgain",
      "optimizedCv.loading",
      "optimizedCv.reviewDescription",
      "optimizedCv.editDescription",
      "optimizedCv.edit",
      "optimizedCv.doneEditing",
      "optimizedCv.save",
      "optimizedCv.saving",
      "optimizedCv.saved",
      "optimizedCv.generateAgain",
      "optimizedCv.continueToCoverLetter",
      "optimizedCv.unexpectedError",
      "optimizedCv.saveFailed",
      "optimizedCv.editable",
      "optimizedCv.present",
      "optimizedCv.professionalSummary",
      "optimizedCv.experience",
      "optimizedCv.education",
      "optimizedCv.skills",
      "optimizedCv.languages",
      "optimizedCv.certifications",
      "optimizedCv.personalProjects",
      "optimizedCv.description",
      "optimizedCv.experienceDescriptionAria",
      "optimizedCv.personalProjectDescriptionAria",
      "optimizedCv.addPersonalProject",
      "optimizedCv.addProject",
      "optimizedCv.removeProject",
      "optimizedCv.noSkills",
      "optimizedCv.newSkill",
      "optimizedCv.addSkillPlaceholder",
      "optimizedCv.addSkill",
      "optimizedCv.removeSkill",
      "optimizedCv.enterSkill",
      "coverLetter.title",
      "coverLetter.kicker",
      "coverLetter.generateDescription",
      "coverLetter.generate",
      "coverLetter.tryAgain",
      "coverLetter.loading",
      "coverLetter.reviewDescription",
      "coverLetter.editDescription",
      "coverLetter.edit",
      "coverLetter.doneEditing",
      "coverLetter.save",
      "coverLetter.saving",
      "coverLetter.saved",
      "coverLetter.generateAgain",
      "coverLetter.continueToExport",
      "coverLetter.unexpectedError",
      "coverLetter.saveFailed",
      "coverLetter.requiresOptimizedCv",
      "coverLetter.greetingAria",
      "coverLetter.introductionAria",
      "coverLetter.professionalValueAria",
      "coverLetter.motivationAria",
      "coverLetter.closingAria",
      "coverLetter.validation.candidateNameRequired",
      "coverLetter.validation.dateRequired",
      "coverLetter.validation.signatureRequired",
      "coverLetter.fields.candidateName",
      "coverLetter.fields.date",
      "coverLetter.fields.signature",
      "export.kicker",
      "export.title",
      "export.description",
      "export.documentsToDownload",
      "export.optimizedCv",
      "export.coverLetter",
      "export.download",
      "export.downloading",
      "export.downloadFailed",
      "export.previewAria",
      "export.requiresDocuments",
    ];

    for (const requiredKey of requiredKeys) {
      expect(expectedKeys).toContain(requiredKey);
    }

    for (const catalog of Object.values(catalogs)) {
      expect(collectKeys(catalog)).toEqual(expectedKeys);
    }
  });
});
