import { describe, expect, it } from "vitest";
import {
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "./field-validation.js";

describe("isValidEmail", () => {
  it("accepts common email addresses", () => {
    expect(isValidEmail("taylor@example.com")).toBe(true);
    expect(isValidEmail("  user.name+tag@example.co.uk  ")).toBe(true);
  });

  it("rejects clearly invalid values", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("user@localhost")).toBe(false);
    expect(isValidEmail("user@example.")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts optional plus, digits, and formatting characters", () => {
    expect(isValidPhone("+1 555 0100")).toBe(true);
    expect(isValidPhone("(555) 123-4567")).toBe(true);
    expect(isValidPhone("+44 20 7946 0958")).toBe(true);
  });

  it("rejects clearly invalid values", () => {
    expect(isValidPhone("hello")).toBe(false);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("++5550100")).toBe(false);
    expect(isValidPhone("555-ABCD")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("accepts common HTTP URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("https://example.com/career-copilot")).toBe(true);
    expect(isValidUrl("http://jobs.example.com/role?id=1")).toBe(true);
    expect(isValidUrl("linkedin.com/in/taylor")).toBe(true);
  });

  it("rejects clearly invalid values", () => {
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });
});

describe("isValidDate", () => {
  it("accepts date formats already used in Career Copilot", () => {
    expect(isValidDate("2016")).toBe(true);
    expect(isValidDate("2020-01")).toBe(true);
    expect(isValidDate("2018-09")).toBe(true);
    expect(isValidDate("August 7, 2026")).toBe(true);
    expect(isValidDate("Present")).toBe(true);
  });

  it("rejects clearly invalid values", () => {
    expect(isValidDate("hello")).toBe(false);
    expect(isValidDate("13/2020")).toBe(false);
    expect(isValidDate("2020-13")).toBe(false);
    expect(isValidDate("2024-02-30")).toBe(false);
  });
});
