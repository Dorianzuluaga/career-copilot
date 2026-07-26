import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import App from "./App";
import { ApplicationsProvider } from "./context/ApplicationsProvider";

function renderApp(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <ApplicationsProvider>
        <App />
      </ApplicationsProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("renders the empty dashboard", () => {
    const markup = renderApp("/");

    expect(markup).toContain("Application dashboard");
    expect(markup).toContain("New Application");
    expect(markup).toContain("No applications yet");
  });

  it("renders the create application form", () => {
    const markup = renderApp("/applications/new");

    expect(markup).toContain("Create application");
    expect(markup).toContain("Company name");
    expect(markup).toContain("Job title");
    expect(markup).toContain("Job Description");
    expect(markup).toMatch(
      /<textarea[^>]*id="jobDescription"[^>]*required[^>]*>/,
    );
    expect(markup).toContain("Save");
    expect(markup).toContain("Cancel");
  });
});
