/* ============================================================
 * Screen — 403 Forbidden
 * ============================================================ */

import { Navigate, Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HOME_ROUTE } from "@/constants/permissions";

export default function ForbiddenPage() {
  const { user } = useAuth();
  const homeRoute = user ? ROLE_HOME_ROUTE[user.role] : "/login";

  if (user && window.location.pathname === "/403") {
    return <Navigate to={homeRoute} replace />;
  }

  return (
    <div className="erp-error-page">
      <div className="erp-error-page__content">
        <div className="erp-error-page__icon-container">
          <ShieldAlert className="erp-error-page__icon" />
        </div>
        <h1 className="erp-error-page__code">403</h1>
        <p className="erp-error-page__message">
          You don&apos;t have permission to view this page.
        </p>
        <Link to={homeRoute} className="erp-btn erp-btn--md erp-btn--primary">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
