/* ============================================================
 * Dev-Only — Role Switcher
 * ============================================================
 * Fixed bottom-left dropdown to toggle between Admin/Manager/Employee.
 * Not part of the real UI — dev tool for demoing role-gated features.
 * ============================================================ */

import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/auth";

const ROLES: Role[] = ["Admin", "Manager", "Employee"];

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();

  if (!user) return null;

  return (
    <div className="erp-role-switcher">
      <span className="erp-role-switcher__label">Role:</span>
      <select
        className="erp-role-switcher__select"
        value={user.role}
        onChange={(e) => switchRole(e.target.value as Role)}
        aria-label="Switch user role"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}
