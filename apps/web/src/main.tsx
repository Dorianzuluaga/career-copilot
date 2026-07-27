import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ApplicationsProvider } from "./context/ApplicationsProvider.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ApplicationsProvider>
          <App />
        </ApplicationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
