/* ============================================================
 * Screen — Error Fallback
 * ============================================================ */

import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="erp-error-page">
      <div className="erp-error-page__content">
        <h1 className="erp-error-page__code">Error</h1>
        <p className="erp-error-page__message">
          Something went wrong. Try refreshing the page.
        </p>
        <Link to="/dashboard" className="erp-btn erp-btn--md erp-btn--primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
