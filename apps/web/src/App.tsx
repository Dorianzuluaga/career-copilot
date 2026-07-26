import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { ApplicationFormPage } from "./pages/ApplicationFormPage";
import { ApplicationWorkspacePage } from "./pages/ApplicationWorkspacePage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
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
