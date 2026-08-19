import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { UnsavedChangesGuardProvider } from "./context/UnsavedChangesGuardProvider";
import { useAuth } from "./hooks/useAuth";
import { ApplicationWorkspacePage } from "./pages/ApplicationWorkspacePage";
import { DashboardPage } from "./pages/DashboardPage";
import { JobAnalysisPage } from "./pages/JobAnalysisPage";
import { LoginPage } from "./pages/LoginPage";
import { MasterCvEditorPage } from "./pages/MasterCvEditorPage";
import { MasterCvOnboardingPage } from "./pages/MasterCvOnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { getMasterCv } from "./services/master-cv";

function RootRedirect() {
  const { user, isLoading } = useAuth();
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDestination(null);
      return;
    }
    let isActive = true;
    void getMasterCv()
      .then((masterCv) => {
        if (isActive) {
          setDestination(masterCv ? "/dashboard" : "/onboarding/master-cv");
        }
      })
      .catch(() => {
        if (isActive) setDestination("/dashboard");
      });
    return () => {
      isActive = false;
    };
  }, [user]);

  if (isLoading || (user && !destination)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted">
        Restoring your session…
      </main>
    );
  }

  return <Navigate to={user ? destination! : "/login"} replace />;
}

function RequireAuthentication() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted">
        Restoring your session…
      </main>
    );
  }
  return user ? (
    <UnsavedChangesGuardProvider>
      <AppLayout />
    </UnsavedChangesGuardProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <Routes>
      <Route index element={<RootRedirect />} />
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAuthentication />}>
        <Route
          path="onboarding/master-cv"
          element={<MasterCvOnboardingPage />}
        />
        <Route path="master-cv" element={<MasterCvEditorPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="applications/new" element={<JobAnalysisPage />} />
        <Route
          path="applications/:applicationId"
          element={<ApplicationWorkspacePage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
