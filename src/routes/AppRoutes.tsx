import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import DashboardStudent from "../pages/DashboardStudent";
import DashboardAdmin from "../pages/DashboardAdmin";
import DashboardTeacher from '../pages/DashboardTeacher';

export default function AppRoutes() {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-4 space-y-6">
        
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse flex space-x-4 bg-white rounded-lg p-4 shadow"
            >
              <div className="rounded-full bg-gray-300 h-12 w-12"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicRoute redirectToDashboard={false} />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/dashboard/student" element={<DashboardStudent />} />
      </Route>

      <Route element={<ProtectedRoute role="teacher" />}>
        <Route path="/dashboard/teacher" element={<DashboardTeacher />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      </Route>

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
