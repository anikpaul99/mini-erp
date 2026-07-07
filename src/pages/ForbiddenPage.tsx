/* ============================================================
 * Screen — 403 Forbidden
 * ============================================================ */

import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
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
        <Link to="/dashboard" className="erp-btn erp-btn--md erp-btn--primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
