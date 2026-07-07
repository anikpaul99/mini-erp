/* ============================================================
 * Screen — 404 Not Found
 * ============================================================ */

import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="erp-error-page">
      <div className="erp-error-page__content">
        <h1 className="erp-error-page__code">404</h1>
        <p className="erp-error-page__message">Page not found.</p>
        <Link to="/dashboard" className="erp-btn erp-btn--md erp-btn--primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
