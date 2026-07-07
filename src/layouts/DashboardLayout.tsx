/* ============================================================
 * Layout — Dashboard Shell (React Router)
 * ============================================================
 * Uses <Outlet /> for nested route rendering.
 * ============================================================ */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const contentClasses = [
    "erp-content",
    sidebarCollapsed ? "erp-content--sidebar-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="erp-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <div
          className="erp-scrim"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onHamburgerClick={() => setMobileMenuOpen((prev) => !prev)}
      />

      <main className={contentClasses}>
        <Outlet />
      </main>
    </div>
  );
}
