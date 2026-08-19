import { useState } from "react";
import { useNavigate } from "react-router";
import { JobAnalysisForm } from "../components/JobAnalysisForm";
import { ApiError } from "../services/api";
import {
  analyzeJobOffer,
  createApplication,
  saveJobOffer,
} from "../services/job-analysis";

interface AnalysisAttempt {
  applicationId: string;
  originalDescription: string;
  jobOfferSaved: boolean;
}

export function JobAnalysisPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [attempt, setAttempt] = useState<AnalysisAttempt | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRetryingStoredOffer =
    attempt?.jobOfferSaved === true &&
    attempt.originalDescription === description;

  async function handleAnalyze(originalDescription: string) {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let currentAttempt =
        attempt?.originalDescription === originalDescription ? attempt : null;

      if (!currentAttempt) {
        const application = await createApplication();
        currentAttempt = {
          applicationId: application.id,
          originalDescription,
          jobOfferSaved: false,
        };
        setAttempt(currentAttempt);
      }

      if (!currentAttempt.jobOfferSaved) {
        await saveJobOffer(currentAttempt.applicationId, originalDescription);
        currentAttempt = { ...currentAttempt, jobOfferSaved: true };
        setAttempt(currentAttempt);
      }

      await analyzeJobOffer(currentAttempt.applicationId);
      navigate(`/applications/${currentAttempt.applicationId}`, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unexpected error. Try again later.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <p className="cc-kicker">New application</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Analyze a job description
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Paste the complete offer. Career Copilot will extract only information
        present in the source and create your application workspace.
      </p>

      <div className="mt-8">
        <JobAnalysisForm
          description={description}
          isAnalyzing={isAnalyzing}
          extractionError={errorMessage}
          retryingStoredOffer={isRetryingStoredOffer}
          onDescriptionChange={setDescription}
          onAnalyze={handleAnalyze}
          onCancel={() => navigate("/dashboard")}
        />
      </div>
    </section>
  );
}
