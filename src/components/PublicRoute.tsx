import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface PublicRouteProps {
  redirectToDashboard?: boolean;
}

export default function PublicRoute({ redirectToDashboard = true }: PublicRouteProps) {
  const { user, loading } = useContext(AuthContext)!;

  if (loading) return <div>Loading...</div>;

  if (user && redirectToDashboard) {
    if (user.role === "admin") return <Navigate to="/dashboard/admin" />;
    if (user.role === "teacher") return <Navigate to="/dashboard/teacher" />;
    return <Navigate to="/dashboard/student" />;
  }

  return <Outlet />;
}
