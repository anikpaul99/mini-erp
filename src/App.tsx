/* ============================================================
 * App — Root Component + React Router
 * ============================================================ */

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthGuard } from "@/components/common/AuthGuard";
import DashboardLayout from "@/layouts/DashboardLayout";

/* Pages */
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import CreateSalePage from "@/pages/CreateSalePage";
import SalesHistoryPage from "@/pages/SalesHistoryPage";
import CustomersPage from "@/pages/CustomersPage";
import UsersPage from "@/pages/UsersPage";
import RolesPage from "@/pages/RolesPage";
import AccountPage from "@/pages/AccountPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import NotFoundPage from "@/pages/NotFoundPage";

const ALL_DASHBOARD_ROLES = ["Admin", "Manager", "Employee"] as const;
const ADMIN_MANAGER_ROLES = ["Admin", "Manager"] as const;

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Protected dashboard routes — Admin only */}
          <Route element={<AuthGuard allowedRoles={[...ALL_DASHBOARD_ROLES]} />}>
            <Route element={<DashboardLayout />}>
              <Route
                element={<AuthGuard allowedRoles={[...ADMIN_MANAGER_ROLES]} />}
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sales/history" element={<SalesHistoryPage />} />
                <Route path="/customers" element={<CustomersPage />} />
              </Route>

              <Route
                element={<AuthGuard allowedRoles={[...ALL_DASHBOARD_ROLES]} />}
              >
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/sales/create" element={<CreateSalePage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>

              <Route element={<AuthGuard allowedRoles={["Admin"]} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/roles" element={<RolesPage />} />
              </Route>
            </Route>
          </Route>

          {/* Redirects & fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
