export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  jobUrl: string;
  jobDescription: string;
  createdAt: string;
}

export type ApplicationInput = Pick<
  Application,
  "companyName" | "jobTitle" | "location" | "jobUrl" | "jobDescription"
>;
