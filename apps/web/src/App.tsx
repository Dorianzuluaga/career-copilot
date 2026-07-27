import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { useAuth } from "./hooks/useAuth";
import { ApplicationFormPage } from "./pages/ApplicationFormPage";
import { ApplicationWorkspacePage } from "./pages/ApplicationWorkspacePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Restoring your session…
      </main>
    );
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <Routes>
      <Route index element={<RootRedirect />} />
      <Route path="login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="applications/new" element={<ApplicationFormPage />} />
        <Route
          path="applications/:applicationId"
          element={<ApplicationWorkspacePage />}
        />
        <Route
          path="applications/:applicationId/edit"
          element={<ApplicationFormPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
