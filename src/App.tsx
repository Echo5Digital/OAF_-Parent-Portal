import { Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { Login } from "./pages/Login";
import { ParentPortal } from "./pages/ParentPortal";
import { StaffDashboard } from "./pages/StaffDashboard";
import { AiInsights } from "./pages/AiInsights";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/parent" element={<ParentPortal />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/ai" element={<AiInsights />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
