import {
  Document,
  Image,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { OptimizedCvDocumentChrome } from "../types/export.js";
import type { OptimizedCv } from "../types/optimized-cv.js";
import { formatDateRange, hasText } from "./document-helpers.js";
import {
  buildOptimizedCvHeaderModel,
  OPTIMIZED_CV_HEADER_ICON_PATHS,
  OPTIMIZED_CV_HEADER_PHOTO_SIZE,
  OPTIMIZED_CV_HEADER_PHOTO_TRAILING_INSET,
  type OptimizedCvHeaderContactKind,
  type OptimizedCvHeaderContactItem,
} from "./optimized-cv-header.js";

const PROJECT_LINK_ICON_PATH =
  "M7 17.59 15.59 9H9V7h10v10h-2v-6.59L8.41 19 7 17.59Z";
const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    marginBottom: 16,
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  identity: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  identityFull: {
    width: "100%",
  },
  photoFrame: {
    width: OPTIMIZED_CV_HEADER_PHOTO_SIZE,
    height: OPTIMIZED_CV_HEADER_PHOTO_SIZE,
    marginLeft: 12,
    marginRight: OPTIMIZED_CV_HEADER_PHOTO_TRAILING_INSET,
  },
  photo: {
    width: OPTIMIZED_CV_HEADER_PHOTO_SIZE,
    height: OPTIMIZED_CV_HEADER_PHOTO_SIZE,
    objectFit: "cover",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },
  professionalTitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#334155",
  },
  contactRow: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "flex-start",
    maxWidth: "100%",
    flexShrink: 1,
  },
  contactIcon: {
    marginRight: 4,
    marginTop: 1,
  },
  contactValue: {
    fontSize: 9,
    color: "#475569",
    flexShrink: 1,
  },
  columns: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftColumn: {
    flexGrow: 68,
    flexShrink: 1,
    flexBasis: 0,
    paddingRight: 12,
  },
  rightColumn: {
    flexGrow: 32,
    flexShrink: 1,
    flexBasis: 0,
    paddingLeft: 12,
  },
  section: {
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  columnFirstSection: {
    marginBottom: 12,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 8,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: "justify",
    color: "#334155",
  },
  entry: {
    marginBottom: 10,
  },
  sidebarEntry: {
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },
  entryMeta: {
    marginTop: 2,
    fontSize: 9,
    color: "#64748b",
  },
  projectLink: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    color: "#475569",
    textDecoration: "underline",
  },
  projectLinkIcon: {
    marginRight: 3,
  },
  projectLinkText: {
    fontSize: 9,
    color: "#475569",
  },
  entryBody: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 1.45,
    textAlign: "left",
    color: "#334155",
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.45,
    textAlign: "left",
    color: "#334155",
  },
  language: {
    fontSize: 10,
    lineHeight: 1.35,
    textAlign: "left",
    color: "#334155",
    marginBottom: 2,
  },
});

function Section({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={first ? styles.columnFirstSection : styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function HeaderContactIcon({ kind }: { kind: OptimizedCvHeaderContactKind }) {
  return (
    <Svg viewBox="0 0 24 24" width={9} height={9} style={styles.contactIcon}>
      {OPTIMIZED_CV_HEADER_ICON_PATHS[kind].map((d) => (
        <Path key={d} d={d} fill="#475569" />
      ))}
    </Svg>
  );
}

function projectLinkTarget(url: string): string {
  const trimmed = url.trim();
  return URL_SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function ProjectLink({ url, label }: { url: string; label: string }) {
  return (
    <Link src={projectLinkTarget(url)} style={styles.projectLink}>
      <Svg
        viewBox="0 0 24 24"
        width={9}
        height={9}
        style={styles.projectLinkIcon}
      >
        <Path d={PROJECT_LINK_ICON_PATH} fill="#475569" />
      </Svg>
      <Text style={styles.projectLinkText}>{label}</Text>
    </Link>
  );
}

function HeaderContactRow({
  items,
}: {
  items: OptimizedCvHeaderContactItem[];
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.contactRow}>
      {items.map((item) => (
        <View key={item.kind} style={styles.contactItem}>
          <HeaderContactIcon kind={item.kind} />
          <Text style={styles.contactValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function OptimizedCvPdfDocument({
  cv,
  chrome,
  profilePhotoSrc = null,
}: {
  cv: OptimizedCv;
  chrome: OptimizedCvDocumentChrome;
  profilePhotoSrc?: string | null;
}) {
  const header = buildOptimizedCvHeaderModel(cv);
  const showProfessionalSummary = hasText(cv.professionalSummary);
  const showExperience = cv.experience.length > 0;
  const showEducation = cv.education.length > 0;
  const showSkills = cv.skills.some(hasText);
  const showLanguages = cv.languages.some(
    (item) => hasText(item.name) || hasText(item.proficiency),
  );
  const showCertifications = cv.certifications.some(
    (item) =>
      hasText(item.name) ||
      hasText(item.issuer) ||
      hasText(item.issueDate) ||
      hasText(item.credentialUrl),
  );
  const personalProjects = cv.personalProjects ?? [];
  const showPersonalProjects = personalProjects.some(
    (item) =>
      hasText(item.name) ||
      hasText(item.technologies) ||
      hasText(item.url) ||
      hasText(item.description),
  );
  const showLeft = showProfessionalSummary || showExperience;
  const showRight =
    showEducation || showSkills || showLanguages || showCertifications;
  const leftFirst = showProfessionalSummary ? "summary" : "experience";
  const rightFirst = showEducation
    ? "education"
    : showSkills
      ? "skills"
      : showLanguages
        ? "languages"
        : "certifications";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View
            style={
              header.photo && profilePhotoSrc
                ? styles.identity
                : styles.identityFull
            }
          >
            <Text style={styles.name}>{header.fullName}</Text>
            {header.professionalTitle ? (
              <Text style={styles.professionalTitle}>
                {header.professionalTitle}
              </Text>
            ) : null}
            <HeaderContactRow items={header.phoneEmail} />
            <HeaderContactRow items={header.locationLinkedin} />
            <HeaderContactRow items={header.website ? [header.website] : []} />
          </View>
          {header.photo && profilePhotoSrc ? (
            <View style={styles.photoFrame}>
              <Image
                src={profilePhotoSrc}
                style={[
                  styles.photo,
                  {
                    objectPositionX: `${header.photo.positionX}%`,
                    objectPositionY: `${header.photo.positionY}%`,
                  },
                ]}
                cache={false}
              />
            </View>
          ) : null}
        </View>

        {showLeft || showRight ? (
          <View style={styles.columns} wrap={false}>
            {showLeft ? (
              <View style={styles.leftColumn}>
                {showProfessionalSummary ? (
                  <Section
                    title={chrome.professionalSummary}
                    first={leftFirst === "summary"}
                  >
                    <Text style={styles.summary}>{cv.professionalSummary}</Text>
                  </Section>
                ) : null}

                {showExperience ? (
                  <Section
                    title={chrome.experience}
                    first={leftFirst === "experience"}
                  >
                    {cv.experience.map((item, index) => {
                      const titleParts = [item.jobTitle, item.company].filter(
                        hasText,
                      );
                      const metaParts = [
                        formatDateRange(
                          item.startDate,
                          item.endDate,
                          item.current,
                          chrome.present,
                        ),
                        item.location,
                      ].filter(hasText);

                      return (
                        <View key={index} style={styles.entry}>
                          {titleParts.length > 0 ? (
                            <Text style={styles.entryTitle}>
                              {titleParts.join(" · ")}
                            </Text>
                          ) : null}
                          {metaParts.length > 0 ? (
                            <Text style={styles.entryMeta}>
                              {metaParts.join(" · ")}
                            </Text>
                          ) : null}
                          {hasText(item.description) ? (
                            <Text style={styles.entryBody}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </Section>
                ) : null}
              </View>
            ) : null}

            {showRight ? (
              <View style={styles.rightColumn}>
                {showEducation ? (
                  <Section
                    title={chrome.education}
                    first={rightFirst === "education"}
                  >
                    {cv.education.map((item, index) => {
                      const title =
                        [item.degree, item.fieldOfStudy]
                          .filter(hasText)
                          .join(" · ") ||
                        (hasText(item.institution) ? item.institution : null);
                      const metaParts = [
                        title !== item.institution ? item.institution : null,
                        formatDateRange(
                          item.startDate,
                          item.endDate,
                          null,
                          chrome.present,
                        ),
                      ].filter(hasText);

                      return (
                        <View key={index} style={styles.sidebarEntry}>
                          {title ? (
                            <Text style={styles.entryTitle}>{title}</Text>
                          ) : null}
                          {metaParts.length > 0 ? (
                            <Text style={styles.entryMeta}>
                              {metaParts.join(" · ")}
                            </Text>
                          ) : null}
                          {hasText(item.description) ? (
                            <Text style={styles.entryBody}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </Section>
                ) : null}

                {showSkills ? (
                  <Section
                    title={chrome.skills}
                    first={rightFirst === "skills"}
                  >
                    <Text style={styles.skills}>
                      {cv.skills.filter(hasText).join(" · ")}
                    </Text>
                  </Section>
                ) : null}

                {showLanguages ? (
                  <Section
                    title={chrome.languages}
                    first={rightFirst === "languages"}
                  >
                    {cv.languages.map((item, index) => {
                      const label = [item.name, item.proficiency]
                        .filter(hasText)
                        .join(" · ");
                      if (!label) {
                        return null;
                      }
                      return (
                        <Text key={index} style={styles.language}>
                          {label}
                        </Text>
                      );
                    })}
                  </Section>
                ) : null}

                {showCertifications ? (
                  <Section
                    title={chrome.certifications}
                    first={rightFirst === "certifications"}
                  >
                    {cv.certifications.map((item, index) => {
                      const title = [item.name, item.issuer]
                        .filter(hasText)
                        .join(" · ");
                      const metaParts = [
                        item.issueDate,
                        item.credentialUrl,
                      ].filter(hasText);
                      if (!title && metaParts.length === 0) {
                        return null;
                      }
                      return (
                        <View key={index} style={styles.sidebarEntry}>
                          {title ? (
                            <Text style={styles.entryTitle}>{title}</Text>
                          ) : null}
                          {metaParts.length > 0 ? (
                            <Text style={styles.entryMeta}>
                              {metaParts.join(" · ")}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </Section>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {showPersonalProjects ? (
          <Section
            title={chrome.personalProjects}
            first={!showLeft && !showRight}
          >
            {personalProjects.map((item, index) => {
              const title = hasText(item.name) ? item.name : null;
              if (
                !title &&
                !hasText(item.description) &&
                !hasText(item.technologies) &&
                !hasText(item.url)
              ) {
                return null;
              }

              return (
                <View key={index} style={styles.entry}>
                  {title ? (
                    <Text style={styles.entryTitle}>{title}</Text>
                  ) : null}
                  {hasText(item.description) ? (
                    <Text style={styles.entryBody}>{item.description}</Text>
                  ) : null}
                  {hasText(item.technologies) ? (
                    <Text style={styles.entryMeta}>{item.technologies}</Text>
                  ) : null}
                  {hasText(item.url) ? (
                    <ProjectLink url={item.url} label={chrome.openProject} />
                  ) : null}
                </View>
              );
            })}
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}
