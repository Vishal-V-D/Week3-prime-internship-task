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
import ContactPage from "../pages/ContactPage";

export default function AppRoutes() {
  const auth = useContext(AuthContext);

if (auth?.loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl px-8 lg:px-16 grid grid-cols-3 gap-8">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse flex flex-col space-y-4 bg-white rounded-lg p-6 shadow-lg"
          >
            <div className="rounded-full bg-gray-300 h-16 w-16 mx-auto"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
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

     
      <Route path="/contact" element={<ContactPage />} />

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
