/* ============================================================
 * Layout — Topbar
 * ============================================================
 * Design Bible §3.3. Breadcrumbs, search, avatar dropdown.
 * Uses React Router <Link> and useLocation.
 * ============================================================ */

import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { useClickOutside } from "@/hooks/useClickOutside";

interface TopbarProps {
  sidebarCollapsed: boolean;
  onHamburgerClick: () => void;
}

/** Build breadcrumb from pathname */
function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard" }];

  const crumbs: { label: string; href?: string }[] = [];
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Products",
    sales: "Sales",
    create: "Create Sale",
    history: "Sales History",
    customers: "Customers",
    users: "Users",
    roles: "Roles & Permissions",
    account: "Account Settings",
    "403": "Not Authorized",
  };

  segments.forEach((seg, i) => {
    const label = labels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = i === segments.length - 1;
    crumbs.push({
      label,
      href: isLast ? undefined : "/" + segments.slice(0, i + 1).join("/"),
    });
  });

  return crumbs;
}

/** Get user initials */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Topbar({ sidebarCollapsed, onHamburgerClick }: TopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  if (!user) return null;

  const breadcrumbs = getBreadcrumbs(pathname);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header
      className={`erp-topbar${
        sidebarCollapsed ? " erp-topbar--sidebar-collapsed" : ""
      }`}
    >
      {/* Mobile hamburger */}
      <button
        className="erp-topbar__hamburger"
        onClick={onHamburgerClick}
        aria-label="Open menu"
      >
        <Menu className="erp-sidebar__nav-icon" />
      </button>

      {/* Breadcrumbs */}
      <nav className="erp-topbar__breadcrumb" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i}>
            {i > 0 && (
              <span className="erp-topbar__breadcrumb-separator">/</span>
            )}
            {crumb.href ? (
              <Link to={crumb.href}>{crumb.label}</Link>
            ) : (
              <span className="erp-topbar__breadcrumb-current">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="erp-topbar__spacer" />

      {/* Search */}
      <div className="erp-topbar__search">
        <Search className="erp-topbar__search-icon" />
        <input
          className="erp-topbar__search-input"
          type="text"
          placeholder="Search products, sales, customers…"
          aria-label="Global search"
        />
      </div>

      {/* User dropdown */}
      <div ref={dropdownRef} className="erp-topbar__user"
        onClick={() => setDropdownOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDropdownOpen((prev) => !prev);
          }
        }}
      >
        <div className="erp-topbar__avatar" aria-hidden="true">
          {getInitials(user.name)}
        </div>
        <div className="erp-topbar__user-info">
          <span className="erp-topbar__user-name">{user.name}</span>
          <span className="erp-topbar__user-role">{user.role}</span>
        </div>
        <ChevronDown className="erp-topbar__user-chevron" />

        {dropdownOpen && (
          <div className="erp-dropdown" role="menu">
            <div className="erp-dropdown__header">
              <div className="erp-dropdown__name">{user.name}</div>
              <div className="erp-dropdown__email">{user.email}</div>
            </div>
            <div className="erp-dropdown__divider" />
            <Link
              to={ROUTES.ACCOUNT}
              className="erp-dropdown__item"
              role="menuitem"
              onClick={(e) => e.stopPropagation()}
            >
              <Settings className="erp-dropdown__item-icon" />
              Account Settings
            </Link>
            <div className="erp-dropdown__divider" />
            <button
              className="erp-dropdown__item erp-dropdown__item--danger"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <LogOut className="erp-dropdown__item-icon" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
