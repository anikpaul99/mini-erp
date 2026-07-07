/* ============================================================
 * Screen — Roles & Permissions (§5.20)
 * ============================================================ */

import { useState, useEffect } from "react";
import { Save, Loader2, ShieldCheck } from "lucide-react";
import {
  PERMISSION_CAPABILITIES,
  type PermissionCapability,
} from "@/constants/permissions";
import type { Role } from "@/types/auth";
import { useToast } from "@/components/ui/Toast";
import { simulateDelay } from "@/mock/helpers";

const ROLES: Role[] = ["Admin", "Manager", "Employee"];

export default function RolesPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Build mutable state from defaults
  const [matrix, setMatrix] = useState<
    Record<string, Record<Role, boolean>>
  >({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const initial: Record<string, Record<Role, boolean>> = {};
      PERMISSION_CAPABILITIES.forEach((cap) => {
        initial[cap.id] = { ...cap.defaults };
      });
      setMatrix(initial);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const togglePermission = (capId: string, role: Role) => {
    // Admin is always fully enabled — don't allow toggling
    if (role === "Admin") return;

    setMatrix((prev) => ({
      ...prev,
      [capId]: {
        ...prev[capId],
        [role]: !prev[capId][role],
      },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await simulateDelay(600);
    setSaving(false);
    setDirty(false);
    addToast("success", "Permissions saved.");
  };

  const handleReset = () => {
    const initial: Record<string, Record<Role, boolean>> = {};
    PERMISSION_CAPABILITIES.forEach((cap) => {
      initial[cap.id] = { ...cap.defaults };
    });
    setMatrix(initial);
    setDirty(false);
  };

  // Group capabilities by category
  const groupedCapabilities: Record<string, PermissionCapability[]> = {};
  PERMISSION_CAPABILITIES.forEach((cap) => {
    if (!groupedCapabilities[cap.category]) {
      groupedCapabilities[cap.category] = [];
    }
    groupedCapabilities[cap.category].push(cap);
  });

  if (loading) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-skeleton erp-skeleton--heading" />
        </div>
        <div className="erp-card">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="erp-skeleton erp-skeleton--row" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Roles &amp; Permissions</h1>
          <p className="erp-page-header__subtitle">
            Configure what each role can access. Admin permissions cannot be
            changed.
          </p>
        </div>
      </div>

      <div className="erp-card">
        {/* Matrix Header */}
        <div className="erp-permissions-matrix__header">
          <span className="erp-permissions-matrix__label">Capability</span>
          {ROLES.map((role) => (
            <span
              key={role}
              className="erp-permissions-matrix__role-header"
            >
              {role}
            </span>
          ))}
        </div>

        {/* Matrix Body — grouped by category */}
        {Object.entries(groupedCapabilities).map(([category, caps]) => (
          <div key={category}>
            <div className="erp-permissions-matrix__category">
              {category}
            </div>
            {caps.map((cap) => (
              <div key={cap.id} className="erp-permissions-matrix__row">
                <span className="erp-permissions-matrix__label">
                  {cap.label}
                </span>
                {ROLES.map((role) => {
                  const isChecked = matrix[cap.id]?.[role] ?? false;
                  const isAdmin = role === "Admin";
                  return (
                    <label
                      key={role}
                      className={`erp-permissions-matrix__cell${
                        isAdmin
                          ? " erp-permissions-matrix__cell--disabled"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="erp-checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(cap.id, role)}
                        disabled={isAdmin}
                        aria-label={`${cap.label} for ${role}`}
                      />
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Dirty Bar */}
      {dirty && (
        <div className="erp-dirty-bar">
          <span className="erp-dirty-bar__text">
            You have unsaved changes.
          </span>
          <div className="erp-dirty-bar__actions">
            <button
              className="erp-btn erp-btn--sm erp-btn--outline"
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </button>
            <button
              className="erp-btn erp-btn--sm erp-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="erp-btn__spinner" />
              ) : (
                <Save className="erp-btn__icon" />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
