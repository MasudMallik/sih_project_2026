import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../services/auth.service";

export function ProtectedRoute() {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
