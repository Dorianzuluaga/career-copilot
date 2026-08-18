import "dotenv/config";
import { prisma } from "./src/lib/prisma.ts";
import { renderDocument } from "./src/services/document-rendering.service.ts";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PAGE_PADDING = 40;
const CONTENT_WIDTH = A4_WIDTH - PAGE_PADDING * 2;
const CONTENT_HEIGHT = A4_HEIGHT - PAGE_PADDING * 2;

function pageCount(buffer: Buffer): number {
  const text = buffer.toString("latin1");
  const match = text.match(/\/Type\s*\/Pages[\s\S]{0,400}?\/Count\s+(\d+)/);
  if (match) return Number(match[1]);
  return (text.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

function estimateLines(text: string, fontSize: number, lineHeight: number, width = CONTENT_WIDTH) {
  const avgCharWidth = fontSize * 0.5;
  const charsPerLine = Math.max(1, Math.floor(width / avgCharWidth));
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines = paragraphs.reduce((sum, line) => {
    const trimmed = line.trim() || " ";
    return sum + Math.max(1, Math.ceil(trimmed.length / charsPerLine));
  }, 0);
  return { lines, height: lines * fontSize * lineHeight };
}

function stats(cv: {
  professionalSummary: string;
  experience: Array<{ description: string | null; location: string | null }>;
  education: Array<{ description: string | null }>;
  skills: string[];
  languages: Array<{ name: string | null; proficiency: string | null }>;
  certifications: Array<{
    name: string | null;
    issuer: string | null;
    issueDate: string | null;
    credentialUrl: string | null;
  }>;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  portfolio: string | null;
}) {
  const experience = cv.experience.map((item) => {
    const description = item.description ?? "";
    const bullets = description
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return {
      bullets: bullets.length,
      chars: description.length,
      hasLocation: Boolean(item.location?.trim()),
      ...estimateLines(description, 10, 1.45),
    };
  });

  const education = cv.education.map((item) => {
    const description = item.description ?? "";
    return {
      chars: description.length,
      hasDescription: Boolean(description.trim()),
      ...estimateLines(description || " ", 10, 1.45),
    };
  });

  const certUrls = cv.certifications.filter((item) => item.credentialUrl?.trim());
  const contactParts = [
    "email",
    cv.phone,
    cv.location,
    cv.linkedin,
    cv.portfolio,
  ].filter((value) => typeof value === "string" && value.trim());

  const sectionCount = [
    true,
    Boolean(cv.professionalSummary.trim()),
    cv.experience.length > 0,
    cv.education.length > 0,
    cv.skills.some((skill) => skill.trim()),
    cv.languages.some((item) => item.name?.trim() || item.proficiency?.trim()),
    cv.certifications.some(
      (item) =>
        item.name?.trim() ||
        item.issuer?.trim() ||
        item.issueDate?.trim() ||
        item.credentialUrl?.trim(),
    ),
  ].filter(Boolean).length;

  const summary = estimateLines(cv.professionalSummary, 10, 1.5);
  const skillsText = cv.skills.filter(Boolean).join(" · ");
  const skills = estimateLines(skillsText || " ", 10, 1.5);

  const personal =
    9 +
    8 +
    20 +
    (contactParts.length > 0 ? 6 + 9 : 0) +
    16;
  const nonFirstSections = Math.max(0, sectionCount - 1);
  const sectionChrome = nonFirstSections * (12 + 1 + 9 + 8 + 16);

  const experienceHeight = experience.reduce((sum, item) => {
    const identity = 11 + 2 + 9 + (item.chars > 0 ? 4 : 0) + 10;
    return sum + identity + (item.chars > 0 ? item.height : 0);
  }, 0);

  const educationHeight = education.reduce((sum, item) => {
    const identity = 11 + 2 + 9 + (item.hasDescription ? 4 : 0) + 10;
    return sum + identity + (item.hasDescription ? item.height : 0);
  }, 0);

  const languagesHeight = cv.languages.length * (4 + 10 * 1.45);
  const certificationsHeight = cv.certifications.reduce((sum, item) => {
    const url = item.credentialUrl?.trim() ?? "";
    const urlHeight = url ? estimateLines(url, 9, 1.0).height : 0;
    return sum + 11 + 2 + 9 + urlHeight + 10;
  }, 0);

  const estimated =
    personal +
    sectionChrome +
    summary.height +
    experienceHeight +
    educationHeight +
    skills.height +
    languagesHeight +
    certificationsHeight;

  return {
    sectionCount,
    summaryChars: cv.professionalSummary.length,
    summaryLines: summary.lines,
    experienceCount: cv.experience.length,
    experienceBullets: experience.map((item) => item.bullets),
    experienceChars: experience.map((item) => item.chars),
    educationCount: cv.education.length,
    educationWithDescription: education.filter((item) => item.hasDescription).length,
    skillsCount: cv.skills.filter(Boolean).length,
    languagesCount: cv.languages.length,
    certificationsCount: cv.certifications.length,
    certificationUrls: certUrls.length,
    estimatedHeight: Math.round(estimated),
    contentHeight: Math.round(CONTENT_HEIGHT),
    estimatedOverflow: Math.round(estimated - CONTENT_HEIGHT),
  };
}

const records = await prisma.optimizedCv.findMany({
  orderBy: { updatedAt: "desc" },
  take: 5,
});

console.log(
  JSON.stringify(
    {
      a4: { width: A4_WIDTH, height: A4_HEIGHT, contentHeight: CONTENT_HEIGHT, contentWidth: CONTENT_WIDTH },
      savedCount: records.length,
      documents: await Promise.all(
        records.map(async (record, index) => {
          const cv = {
            fullName: record.fullName,
            email: record.email,
            phone: record.phone,
            location: record.location,
            linkedin: record.linkedin,
            portfolio: record.portfolio,
            professionalSummary: record.professionalSummary,
            experience: record.experience as never,
            education: record.education as never,
            skills: record.skills as string[],
            languages: record.languages as never,
            certifications: record.certifications as never,
          };
          const buffer = await renderDocument({ type: "optimized-cv", data: cv });
          return {
            index,
            updatedAt: record.updatedAt,
            pages: pageCount(buffer),
            bytes: buffer.length,
            ...stats(cv),
          };
        }),
      ),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
