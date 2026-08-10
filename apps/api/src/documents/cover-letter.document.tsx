import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CoverLetter } from "../types/cover-letter.js";
import { hasText } from "./document-helpers.js";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
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
  meta: {
    marginTop: 12,
    fontSize: 10,
    color: "#475569",
  },
  company: {
    marginTop: 2,
    fontSize: 10,
    color: "#475569",
  },
  body: {
    marginTop: 24,
  },
  paragraph: {
    marginBottom: 12,
    fontSize: 10,
    lineHeight: 1.55,
    color: "#334155",
  },
  signature: {
    marginTop: 20,
    fontSize: 10,
    lineHeight: 1.55,
    color: "#334155",
  },
});

export function CoverLetterPdfDocument({
  coverLetter,
}: {
  coverLetter: CoverLetter;
}) {
  const contactDetails = [coverLetter.email, coverLetter.phone].filter(hasText);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{coverLetter.candidateName}</Text>
          {contactDetails.length > 0 ? (
            <Text style={styles.contact}>{contactDetails.join(" · ")}</Text>
          ) : null}
          <Text style={styles.meta}>{coverLetter.date}</Text>
          {hasText(coverLetter.companyName) ? (
            <Text style={styles.company}>{coverLetter.companyName}</Text>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>{coverLetter.greeting}</Text>
          <Text style={styles.paragraph}>{coverLetter.introduction}</Text>
          <Text style={styles.paragraph}>{coverLetter.professionalValue}</Text>
          <Text style={styles.paragraph}>{coverLetter.motivation}</Text>
          <Text style={styles.paragraph}>{coverLetter.closing}</Text>
        </View>

        <Text style={styles.signature}>{coverLetter.signature}</Text>
      </Page>
    </Document>
  );
}
