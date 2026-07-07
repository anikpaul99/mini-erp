/* ============================================================
 * Component — Auth Guard
 * ============================================================ */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/types/auth";

interface AuthGuardProps {
  allowedRoles?: Role[];
}

export function AuthGuard({ allowedRoles = ["Admin"] }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
}
