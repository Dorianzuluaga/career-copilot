import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcRoot = fileURLToPath(new URL("./", import.meta.url));

function readSource(fileName: string) {
  return readFileSync(path.join(srcRoot, fileName), "utf8");
}

describe("Profile Match presentation isolation", () => {
  it("keeps Optimized CV and Cover Letter on the persisted Profile Match loader", () => {
    const optimizedCv = readSource("optimized-cv.service.ts");
    const coverLetter = readSource("cover-letter.service.ts");

    expect(optimizedCv).toContain("getProfileComparison");
    expect(coverLetter).toContain("getProfileComparison");
    expect(optimizedCv).not.toContain("presentProfileMatch");
    expect(coverLetter).not.toContain("presentProfileMatch");
    expect(optimizedCv).not.toContain("profile-match-presentation");
    expect(coverLetter).not.toContain("profile-match-presentation");
    expect(optimizedCv).not.toContain("profile-match-adaptation");
    expect(coverLetter).not.toContain("profile-match-adaptation");
  });

  it("does not call generation, scoring, or repository writes from presentation", () => {
    const presentation = readSource("profile-match-presentation.service.ts");
    const adaptation = readSource("profile-match-adaptation.service.ts");

    for (const source of [presentation, adaptation]) {
      expect(source).not.toContain("identifyMatchingSkills");
      expect(source).not.toContain("identifyMissingSkills");
      expect(source).not.toContain("identifyStrengths");
      expect(source).not.toContain("identifyWeaknesses");
      expect(source).not.toContain("evaluateProfileAlignment");
      expect(source).not.toContain("generateRecommendation");
      expect(source).not.toContain("upsertProfileMatch");
      expect(source).not.toContain("generateOptimizedCv");
      expect(source).not.toContain("generateCoverLetter");
      expect(source).not.toContain("analyzeJobOffer");
      expect(source).not.toContain("export-adaptation");
      expect(source).not.toContain("document-localization");
      expect(source).not.toContain("generationLanguageInstruction");
    }

    expect(presentation).toContain("findProfileMatchByApplicationId");
    expect(presentation).not.toContain("getProfileComparison");
  });
});
