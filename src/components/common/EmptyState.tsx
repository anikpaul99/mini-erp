/* ============================================================
 * Common — Empty State
 * ============================================================
 * Design Bible §4.13. Centered empty state with icon,
 * headline, body, and optional action button.
 * ============================================================ */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  headline: string;
  body: string;
  action?: ReactNode;
  /** Use "inline" for compact dashboard widget variant */
  variant?: "default" | "inline";
}

export function EmptyState({
  icon: Icon,
  headline,
  body,
  action,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div
      className={`erp-empty-state${
        variant === "inline" ? " erp-empty-state--inline" : ""
      }`}
    >
      <div className="erp-empty-state__icon-container">
        <Icon className="erp-empty-state__icon" />
      </div>
      <h3 className="erp-empty-state__headline">{headline}</h3>
      <p className="erp-empty-state__body">{body}</p>
      {action}
    </div>
  );
}
