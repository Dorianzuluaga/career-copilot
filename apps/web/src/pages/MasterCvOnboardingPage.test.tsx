import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "../context/LocaleProvider";
import { MasterCvOnboardingUploadStep } from "./MasterCvOnboardingPage";

function renderUploadStep({
  selectedFile = null,
  isUploading = false,
  uploadError = null,
}: {
  selectedFile?: File | null;
  isUploading?: boolean;
  uploadError?: string | null;
} = {}) {
  return renderToStaticMarkup(
    <LocaleProvider>
      <MasterCvOnboardingUploadStep
        selectedFile={selectedFile}
        isUploading={isUploading}
        uploadError={uploadError}
        onBack={() => undefined}
        onFileChange={() => undefined}
        onExtract={() => undefined}
        onRetry={() => undefined}
        onCompleteManually={() => undefined}
      />
    </LocaleProvider>,
  );
}

describe("Master CV onboarding upload step", () => {
  it("renders a visible Select CV control and hides the native file input", () => {
    const markup = renderUploadStep();

    expect(markup).toContain("Seleccionar CV");
    expect(markup).toContain('class="cc-btn-secondary w-fit"');
    expect(markup).toContain('aria-label="Archivo PDF del CV"');
    expect(markup).toMatch(
      /<input[^>]*type="file"[^>]*accept="application\/pdf,.pdf"[^>]*class="sr-only"/,
    );
    expect(markup).not.toContain('class="block w-full text-sm text-ink"');
  });

  it("disables extract until a file is selected and then shows the filename", () => {
    const withoutFile = renderUploadStep();

    expect(withoutFile).toMatch(
      /<button type="button" disabled="" class="cc-btn-primary mt-5">Subir y extraer<\/button>/,
    );
    expect(withoutFile).not.toContain("curriculum.pdf");

    const withFile = renderUploadStep({
      selectedFile: { name: "curriculum.pdf" } as File,
    });

    expect(withFile).toContain("curriculum.pdf");
    expect(withFile).toMatch(
      /<button type="button" class="cc-btn-primary mt-5">Subir y extraer<\/button>/,
    );
  });

  it("renders localized help beside the upload heading", () => {
    const markup = renderUploadStep();

    expect(markup).toContain("Sube tu CV");
    expect(markup).toContain('aria-label="Ayuda para subir un CV"');
    expect(markup).toContain("Puedes subir un CV guardado en tu ordenador.");
    expect(markup).toContain("PDF es el formato compatible actualmente.");
    expect(markup).toContain(
      "Puedes usar un CV exportado desde LinkedIn u otra herramienta de CV.",
    );
    expect(markup).toContain("Se recomienda usar el CV más actualizado.");
  });
});
