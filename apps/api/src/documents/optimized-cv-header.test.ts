import { describe, expect, it } from "vitest";
import {
  buildOptimizedCvHeaderModel,
  getOptimizedCvHeaderStructure,
  OPTIMIZED_CV_HEADER_ICON_PATHS,
} from "./optimized-cv-header.js";

const fullHeader = {
  fullName: "Taylor Smith",
  professionalTitle: "Software Engineer",
  email: "taylor@example.com",
  phone: "+1 555 0100",
  location: "Berlin",
  linkedin: "https://linkedin.com/in/taylor",
  website: "https://example.com/very/long/portfolio-path",
};

describe("optimized CV header presence rules", () => {
  it("orders name, title, phone+email, location+LinkedIn, and website", () => {
    const model = buildOptimizedCvHeaderModel(fullHeader);

    expect(getOptimizedCvHeaderStructure(model)).toEqual([
      "fullName",
      "professionalTitle",
      "phoneEmail",
      "locationLinkedin",
      "website",
    ]);
    expect(model.phoneEmail.map((item) => item.kind)).toEqual([
      "phone",
      "email",
    ]);
    expect(model.locationLinkedin.map((item) => item.kind)).toEqual([
      "location",
      "linkedin",
    ]);
    expect(model.website?.value).toBe(fullHeader.website);
  });

  it("omits empty optional fields and does not reserve pair-row cells", () => {
    const requiredOnly = buildOptimizedCvHeaderModel({
      fullName: "Taylor Smith",
      professionalTitle: "   ",
      email: "taylor@example.com",
      phone: null,
      location: "",
      linkedin: null,
      website: null,
    });

    expect(getOptimizedCvHeaderStructure(requiredOnly)).toEqual([
      "fullName",
      "phoneEmail",
    ]);
    expect(requiredOnly.professionalTitle).toBeNull();
    expect(requiredOnly.phoneEmail).toEqual([
      { kind: "email", value: "taylor@example.com" },
    ]);
    expect(requiredOnly.locationLinkedin).toEqual([]);
    expect(requiredOnly.website).toBeNull();
  });

  it("keeps partial pair rows left-aligned with only the present item", () => {
    const model = buildOptimizedCvHeaderModel({
      fullName: "Taylor Smith",
      professionalTitle: null,
      email: "taylor@example.com",
      phone: null,
      location: "Berlin",
      linkedin: "  ",
      website: null,
    });

    expect(model.phoneEmail).toEqual([
      { kind: "email", value: "taylor@example.com" },
    ]);
    expect(model.locationLinkedin).toEqual([
      { kind: "location", value: "Berlin" },
    ]);
    expect(model.website).toBeNull();
  });

  it("preserves migrated website values and long URLs as stored", () => {
    const migrated = buildOptimizedCvHeaderModel({
      fullName: "Taylor Smith",
      email: "taylor@example.com",
      website: "https://example.com/old-portfolio",
    });

    expect(migrated.website).toEqual({
      kind: "website",
      value: "https://example.com/old-portfolio",
    });
    expect(OPTIMIZED_CV_HEADER_ICON_PATHS.website.length).toBeGreaterThan(0);
    expect(OPTIMIZED_CV_HEADER_ICON_PATHS.linkedin.length).toBeGreaterThan(0);
  });
});
