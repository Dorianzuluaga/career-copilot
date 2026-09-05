import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import type { OptimizedCv } from "../types/optimized-cv";
import { OptimizedCvDocument } from "./ApplicationOptimizedCv";

vi.mock("../hooks/useAuthenticatedImage", () => ({
  useAuthenticatedImage: () => ({
    objectUrl: "blob:profile-photo",
    isLoading: false,
    hasError: false,
  }),
}));

const cv: OptimizedCv = {
  fullName: "Taylor Smith",
  professionalTitle: "Software Engineer",
  email: "taylor@example.com",
  phone: null,
  location: null,
  linkedin: null,
  website: null,
  professionalSummary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  personalProjects: [],
  profilePhotoAssetId: "7e9c843b-5c3d-4e65-8514-7de898b2aca6",
  profilePhotoPositionX: 25,
  profilePhotoPositionY: 75,
  workingLanguage: null,
};

describe("Optimized CV preview photo presentation", () => {
  it("converts the PDF dimensions to CSS pixels and preserves focal position", () => {
    const markup = renderToStaticMarkup(
      <LocaleProvider>
        <OptimizedCvDocument cv={cv} applicationId="application-id" />
      </LocaleProvider>,
    );

    expect(markup).toContain('data-cv-header-photo=""');
    expect(markup).toContain("width:112px");
    expect(markup).toContain("height:112px");
    expect(markup).toContain("margin-right:70.66666666666666px");
    expect(markup).toContain("object-position:25% 75%");
    expect(markup).not.toContain("data-cv-header-photo-feather");
    expect(markup).not.toContain("data-cv-header-photo-vignette");
    expect(markup).toContain(
      "mask-image:radial-gradient(circle closest-side at center, rgb(0 0 0 / 1) 125%, rgb(0 0 0 / 0.95) 130%, rgb(0 0 0 / 0.010000000000000009) 100%)",
    );
    expect(markup).not.toContain("background:radial-gradient");
    expect(markup.indexOf("data-cv-header-identity")).toBeLessThan(
      markup.indexOf("data-cv-header-photo"),
    );
  });
});
