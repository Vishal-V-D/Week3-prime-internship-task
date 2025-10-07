import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  role?: string;
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, loading } = useContext(AuthContext)!;

  // Loading is handled at App level, but just in case
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // No user = not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (role && user.role !== role) {
    // Redirect to correct dashboard based on user's actual role
    if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
    if (user.role === "teacher") return <Navigate to="/dashboard/teacher" replace />;
    return <Navigate to="/dashboard/student" replace />;
  }

  return <Outlet />;
}