import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ApplicationsProvider } from "./context/ApplicationsProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ApplicationsProvider>
        <App />
      </ApplicationsProvider>
    </BrowserRouter>
  </StrictMode>,
);
