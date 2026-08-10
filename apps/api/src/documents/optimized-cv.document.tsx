import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { OptimizedCv } from "../types/optimized-cv.js";
import { formatDateRange, hasText } from "./document-helpers.js";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  section: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  firstSection: {
    marginBottom: 16,
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
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },
  contact: {
    marginTop: 6,
    fontSize: 9,
    color: "#475569",
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#334155",
  },
  entry: {
    marginBottom: 10,
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
  entryBody: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 1.45,
    color: "#334155",
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#334155",
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
    <View style={first ? styles.firstSection : styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function OptimizedCvPdfDocument({ cv }: { cv: OptimizedCv }) {
  const contactDetails = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedin,
    cv.portfolio,
  ].filter(hasText);
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Section title="Personal information" first>
          <Text style={styles.name}>{cv.fullName}</Text>
          {contactDetails.length > 0 ? (
            <Text style={styles.contact}>{contactDetails.join(" · ")}</Text>
          ) : null}
        </Section>

        {showProfessionalSummary ? (
          <Section title="Professional summary">
            <Text style={styles.body}>{cv.professionalSummary}</Text>
          </Section>
        ) : null}

        {showExperience ? (
          <Section title="Experience">
            {cv.experience.map((item, index) => {
              const titleParts = [item.jobTitle, item.company].filter(hasText);
              const metaParts = [
                formatDateRange(item.startDate, item.endDate, item.current),
                item.location,
              ].filter(hasText);

              return (
                <View key={index} style={styles.entry} wrap={false}>
                  {titleParts.length > 0 ? (
                    <Text style={styles.entryTitle}>
                      {titleParts.join(" · ")}
                    </Text>
                  ) : null}
                  {metaParts.length > 0 ? (
                    <Text style={styles.entryMeta}>{metaParts.join(" · ")}</Text>
                  ) : null}
                  {hasText(item.description) ? (
                    <Text style={styles.entryBody}>{item.description}</Text>
                  ) : null}
                </View>
              );
            })}
          </Section>
        ) : null}

        {showEducation ? (
          <Section title="Education">
            {cv.education.map((item, index) => {
              const title =
                [item.degree, item.fieldOfStudy].filter(hasText).join(" · ") ||
                (hasText(item.institution) ? item.institution : null);
              const metaParts = [
                title !== item.institution ? item.institution : null,
                formatDateRange(item.startDate, item.endDate, null),
              ].filter(hasText);

              return (
                <View key={index} style={styles.entry} wrap={false}>
                  {title ? <Text style={styles.entryTitle}>{title}</Text> : null}
                  {metaParts.length > 0 ? (
                    <Text style={styles.entryMeta}>{metaParts.join(" · ")}</Text>
                  ) : null}
                  {hasText(item.description) ? (
                    <Text style={styles.entryBody}>{item.description}</Text>
                  ) : null}
                </View>
              );
            })}
          </Section>
        ) : null}

        {showSkills ? (
          <Section title="Skills">
            <Text style={styles.skills}>
              {cv.skills.filter(hasText).join(" · ")}
            </Text>
          </Section>
        ) : null}

        {showLanguages ? (
          <Section title="Languages">
            {cv.languages.map((item, index) => {
              const label = [item.name, item.proficiency]
                .filter(hasText)
                .join(" · ");
              if (!label) {
                return null;
              }
              return (
                <Text key={index} style={styles.entryBody}>
                  {label}
                </Text>
              );
            })}
          </Section>
        ) : null}

        {showCertifications ? (
          <Section title="Certifications">
            {cv.certifications.map((item, index) => {
              const title = [item.name, item.issuer].filter(hasText).join(" · ");
              const metaParts = [item.issueDate, item.credentialUrl].filter(
                hasText,
              );
              if (!title && metaParts.length === 0) {
                return null;
              }
              return (
                <View key={index} style={styles.entry} wrap={false}>
                  {title ? <Text style={styles.entryTitle}>{title}</Text> : null}
                  {metaParts.length > 0 ? (
                    <Text style={styles.entryMeta}>{metaParts.join(" · ")}</Text>
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
