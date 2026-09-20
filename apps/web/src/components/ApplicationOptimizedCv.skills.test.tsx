import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import { writeStoredLocale } from "../i18n/storage";
import type { OptimizedCv } from "../types/optimized-cv";
import { OptimizedCvDocument } from "./ApplicationOptimizedCv";

const groupedCv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: null,
  email: "taylor@example.com",
  phone: null,
  location: "Berlin",
  linkedin: null,
  website: null,
  professionalSummary: "Engineer building APIs.",
  experience: [
    {
      jobTitle: "Software Engineer",
      company: "Acme",
      location: null,
      startDate: "2022-01",
      endDate: null,
      current: true,
      description: "Built REST APIs.",
    },
  ],
  education: [],
  skills: [
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "Flask",
    "Excel",
  ],
  skillGroups: [
    {
      category: "Frontend",
      skills: ["React", "TypeScript", "JavaScript"],
    },
    {
      category: "Backend",
      skills: ["Node.js", "Python", "Flask"],
    },
  ],
  languages: [],
  certifications: [],
  personalProjects: [],
  workingLanguage: "en",
};

const legacyCv: OptimizedCv = {
  ...groupedCv,
  skills: ["TypeScript", "Node.js"],
  skillGroups: undefined,
};

function renderDocument(cv: OptimizedCv, isEditing = false) {
  return renderToStaticMarkup(
    <LocaleProvider>
      <OptimizedCvDocument cv={cv} isEditing={isEditing} />
    </LocaleProvider>,
  );
}

function countOccurrences(markup: string, value: string): number {
  return markup.split(value).length - 1;
}

describe("Optimized CV preview Skills presentation", () => {
  beforeEach(() => {
    writeStoredLocale("es");
  });
  it("renders grouped categories, sourceSkill values, and document order", () => {
    const markup = renderDocument(groupedCv);

    expect(markup).toContain("Frontend");
    expect(markup).toContain("Backend");
    expect(markup).toContain("React · TypeScript · JavaScript");
    expect(markup).toContain("Node.js · Python · Flask");
    expect(markup).toContain("Excel");
    expect(markup.indexOf("Frontend")).toBeLessThan(markup.indexOf("Backend"));
    expect(markup.indexOf("Frontend")).toBeLessThan(markup.indexOf("React"));
    expect(markup.indexOf("Backend")).toBeLessThan(markup.indexOf("Node.js"));
    expect(markup.indexOf("React · TypeScript · JavaScript")).toBeLessThan(
      markup.indexOf("Node.js · Python · Flask"),
    );
  });

  it("renders every grouped skill exactly once and never renders internal skill aliases", () => {
    const markup = renderDocument(groupedCv);
    const groupedSkills = groupedCv.skillGroups?.flatMap(
      (group) => group.skills,
    );

    expect(groupedSkills).toEqual([
      "React",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Python",
      "Flask",
    ]);
    for (const skill of groupedSkills ?? []) {
      expect(countOccurrences(markup, skill)).toBe(1);
    }
    expect(countOccurrences(markup, "Excel")).toBe(1);
    expect(markup).not.toContain("React.js");
    expect(markup).not.toContain("Typescript Language");
    expect(markup).not.toContain("CanonicalFlask");
  });

  it("renders legacy flat skills exactly as before", () => {
    const markup = renderDocument(legacyCv);

    expect(markup).toContain("TypeScript · Node.js");
    expect(markup).not.toContain("Frontend");
    expect(markup).not.toContain("Backend");
  });

  it("keeps the flat add/remove editor and does not show category grouping while editing", () => {
    const markup = renderDocument(groupedCv, true);

    expect(markup).toContain("Añadir competencia");
    expect(markup).toContain("React");
    expect(markup).toContain("Excel");
    expect(markup).not.toContain("React · TypeScript · JavaScript");
    expect(markup).not.toContain("Frontend");
    expect(markup).not.toContain("Backend");
  });
});
