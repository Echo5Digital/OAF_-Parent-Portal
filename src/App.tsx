import { Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { ParentDataProvider } from "./lib/ParentDataContext";
import { Login } from "./pages/Login";
import { ParentHome } from "./pages/ParentHome";
import { ParentPortal } from "./pages/ParentPortal";
import { MyChildren } from "./pages/MyChildren";
import { WeeklyLogs } from "./pages/WeeklyLogs";
import { Resources } from "./pages/Resources";
import { Messages } from "./pages/Messages";
import { HelpSupport } from "./pages/HelpSupport";
import { StaffDashboard } from "./pages/StaffDashboard";
import { StaffParents } from "./pages/StaffParents";
import { StaffChildren } from "./pages/StaffChildren";
import { StaffForms } from "./pages/StaffForms";
import { StaffReviews } from "./pages/StaffReviews";
import { StaffReports } from "./pages/StaffReports";
import { StaffSettings } from "./pages/StaffSettings";
import { AiInsights } from "./pages/AiInsights";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/parent/*"
          element={
            <ParentDataProvider>
              <Routes>
                <Route index element={<ParentHome />} />
                <Route path="weekly-log" element={<ParentPortal />} />
                <Route path="children" element={<MyChildren />} />
                <Route path="logs" element={<WeeklyLogs />} />
                <Route path="resources" element={<Resources />} />
                <Route path="messages" element={<Messages />} />
                <Route path="help" element={<HelpSupport />} />
              </Routes>
            </ParentDataProvider>
          }
        />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/parents" element={<StaffParents />} />
        <Route path="/staff/children" element={<StaffChildren />} />
        <Route path="/staff/forms" element={<StaffForms />} />
        <Route path="/staff/reviews" element={<StaffReviews />} />
        <Route path="/staff/reports" element={<StaffReports />} />
        <Route path="/staff/settings" element={<StaffSettings />} />
        <Route path="/ai" element={<AiInsights />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
