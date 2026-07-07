/* ============================================================
 * App — Root Component + React Router
 * ============================================================
 * All routes are statically accessible (no auth gating).
 * ============================================================ */

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
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

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard routes — wrapped in shell layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/sales/create" element={<CreateSalePage />} />
            <Route path="/sales/history" element={<SalesHistoryPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
          </Route>

          {/* Redirects & fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
