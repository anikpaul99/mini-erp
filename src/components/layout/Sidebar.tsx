/* ============================================================
 * Layout — Sidebar
 * ============================================================
 * Design Bible §3.2. Role-filtered, collapsible sidebar.
 * Uses React Router <Link> and useLocation.
 * ============================================================ */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { SIDEBAR_NAV, SIDEBAR_ADMIN_NAV, type NavItem } from "@/constants/nav";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/auth";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

/** Check if a nav item is visible for the given role */
function isVisible(item: NavItem, role: Role): boolean {
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.includes(role);
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
}: SidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Sales"])
  );

  if (!user) return null;

  const role = user.role;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    return item.children?.some((child) => isActive(child.href)) ?? false;
  };

  const sidebarClasses = [
    "erp-sidebar",
    collapsed ? "erp-sidebar--collapsed" : "",
    mobileOpen ? "erp-sidebar--mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const renderNavItem = (item: NavItem) => {
    if (!isVisible(item, role)) return null;

    // Expandable group (Sales)
    if (item.children) {
      const visibleChildren = item.children.filter((c) => isVisible(c, role));
      if (visibleChildren.length === 0) return null;

      // If only one visible child, render as a simple link
      if (visibleChildren.length === 1) {
        const child = visibleChildren[0];
        return (
          <Link
            key={child.href}
            to={child.href}
            className={`erp-sidebar__nav-item${
              isActive(child.href) ? " erp-sidebar__nav-item--active" : ""
            }`}
          >
            <item.icon className="erp-sidebar__nav-icon" />
            <span className="erp-sidebar__nav-label">{item.label}</span>
          </Link>
        );
      }

      const isExpanded = expandedGroups.has(item.label);

      return (
        <div key={item.label} className="erp-sidebar__nav-expandable">
          <button
            className={`erp-sidebar__nav-item${
              isGroupActive(item) ? " erp-sidebar__nav-item--active" : ""
            }`}
            onClick={() => toggleGroup(item.label)}
            aria-expanded={isExpanded}
          >
            <item.icon className="erp-sidebar__nav-icon" />
            <span className="erp-sidebar__nav-label">{item.label}</span>
            <ChevronDown
              className={`erp-sidebar__nav-chevron${
                isExpanded ? " erp-sidebar__nav-chevron--open" : ""
              }`}
            />
          </button>
          <div
            className={`erp-sidebar__nav-children${
              isExpanded ? " erp-sidebar__nav-children--open" : ""
            }`}
          >
            {visibleChildren.map((child) => (
              <Link
                key={child.href}
                to={child.href}
                className={`erp-sidebar__nav-item${
                  isActive(child.href) ? " erp-sidebar__nav-item--active" : ""
                }`}
              >
                <span className="erp-sidebar__nav-label">{child.label}</span>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    // Simple nav item
    return (
      <Link
        key={item.href}
        to={item.href}
        className={`erp-sidebar__nav-item${
          isActive(item.href) ? " erp-sidebar__nav-item--active" : ""
        }`}
      >
        <item.icon className="erp-sidebar__nav-icon" />
        <span className="erp-sidebar__nav-label">{item.label}</span>
        {collapsed && (
          <span className="erp-sidebar__tooltip">{item.label}</span>
        )}
      </Link>
    );
  };

  const visibleAdminNav = SIDEBAR_ADMIN_NAV.filter((item) =>
    isVisible(item, role)
  );

  return (
    <aside className={sidebarClasses} aria-label="Main navigation">
      {/* Logo */}
      <div className="erp-sidebar__logo">
        <div className="erp-sidebar__logo-glyph" aria-hidden="true" />
        <span className="erp-sidebar__logo-text">MINI ERP</span>
      </div>

      {/* Nav */}
      <nav className="erp-sidebar__nav">
        <div className="erp-sidebar__nav-group">
          {SIDEBAR_NAV.map(renderNavItem)}
        </div>

        {visibleAdminNav.length > 0 && (
          <>
            <div className="erp-sidebar__divider" />
            <div className="erp-sidebar__nav-group">
              {visibleAdminNav.map(renderNavItem)}
            </div>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="erp-sidebar__bottom">
        <button
          className="erp-sidebar__collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="erp-sidebar__nav-icon" />
          ) : (
            <PanelLeftClose className="erp-sidebar__nav-icon" />
          )}
          <span className="erp-sidebar__nav-label">
            {collapsed ? "Expand" : "Collapse"}
          </span>
        </button>
        <div className="erp-sidebar__role-badge">{user.role}</div>
      </div>
    </aside>
  );
}
