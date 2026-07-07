/* ============================================================
 * Screen — Dashboard (§5.3)
 * ============================================================
 * Uses React Query hooks for products + sales data,
 * Redux for auth state via useAuth().
 * ============================================================ */

import { Package, Receipt, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import { selectProducts, selectProductsInitialized } from "@/redux/slices/productsSlice";
import { selectSales, selectSalesInitialized } from "@/redux/slices/salesSlice";
import { useProducts } from "@/hooks/queries/useProductsQuery";
import { useSales } from "@/hooks/queries/useSalesQuery";
import { getStockStatus, getStockLabel } from "@/types/product";
import { APP_CONFIG } from "@/constants/config";

export default function DashboardPage() {
  // Trigger data initialization via React Query
  const { isLoading: productsLoading } = useProducts();
  const { isLoading: salesLoading } = useSales();

  // Read from Redux store (single source of truth)
  const products = useAppSelector(selectProducts);
  const sales = useAppSelector(selectSales);
  const productsReady = useAppSelector(selectProductsInitialized);
  const salesReady = useAppSelector(selectSalesInitialized);

  const loading = productsLoading || salesLoading || !productsReady || !salesReady;

  const totalProducts = products.length;
  const totalSales = sales.length;
  const lowStockProducts = products.filter(
    (p) => getStockStatus(p.stock) === "low_stock"
  );
  const recentSales = [...sales]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  const formatCurrency = (value: number) =>
    `${APP_CONFIG.currency}${value.toFixed(2)}`;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <div className="erp-skeleton erp-skeleton--heading" />
          </div>
        </div>
        <div className="erp-stat-cards">
          <div className="erp-skeleton erp-skeleton--card" />
          <div className="erp-skeleton erp-skeleton--card" />
          <div className="erp-skeleton erp-skeleton--card" />
        </div>
        <div className="erp-dashboard-grid">
          <div className="erp-skeleton erp-skeleton--card" />
          <div className="erp-skeleton erp-skeleton--card" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Dashboard</h1>
          <p className="erp-page-header__subtitle">
            Here&apos;s what&apos;s happening across your inventory and sales.
          </p>
        </div>
      </div>

      <div className="erp-stat-cards">
        <div className="erp-stat-card">
          <div className="erp-stat-card__content">
            <span className="erp-stat-card__label">Total Products</span>
            <span className="erp-stat-card__value">{totalProducts}</span>
          </div>
          <div className="erp-stat-card__icon-container erp-stat-card__icon-container--primary">
            <Package className="erp-stat-card__icon" />
          </div>
        </div>

        <div className="erp-stat-card">
          <div className="erp-stat-card__content">
            <span className="erp-stat-card__label">Total Sales</span>
            <span className="erp-stat-card__value">{totalSales}</span>
          </div>
          <div className="erp-stat-card__icon-container erp-stat-card__icon-container--success">
            <Receipt className="erp-stat-card__icon" />
          </div>
        </div>

        <div className="erp-stat-card">
          <div className="erp-stat-card__content">
            <span className="erp-stat-card__label">Low Stock Products</span>
            <span className="erp-stat-card__value erp-stat-card__value--accent">
              {lowStockProducts.length}
            </span>
          </div>
          <div className="erp-stat-card__icon-container erp-stat-card__icon-container--accent">
            <AlertTriangle className="erp-stat-card__icon" />
          </div>
        </div>
      </div>

      <div className="erp-dashboard-grid">
        <div className="erp-card">
          <div className="erp-card__header">
            <h2 className="erp-card__title">Low Stock Products</h2>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="erp-text-muted">Everything&apos;s well stocked.</p>
          ) : (
            <div className="erp-table-container">
              <table className="erp-table">
                <thead className="erp-table__head">
                  <tr className="erp-table__header-row">
                    <th className="erp-table__th">Product</th>
                    <th className="erp-table__th">SKU</th>
                    <th className="erp-table__th">Category</th>
                    <th className="erp-table__th erp-table__th--right">Stock</th>
                    <th className="erp-table__th">Status</th>
                  </tr>
                </thead>
                <tbody className="erp-table__body">
                  {lowStockProducts.map((product) => {
                    const status = getStockStatus(product.stock);
                    const label = getStockLabel(status);
                    return (
                      <tr key={product.id} className="erp-table__row erp-table__row--low-stock">
                        <td className="erp-table__td">{product.name}</td>
                        <td className="erp-table__td erp-table__td--numeric">{product.sku}</td>
                        <td className="erp-table__td">
                          <span className="erp-badge erp-badge--neutral">{product.category.name}</span>
                        </td>
                        <td className="erp-table__td erp-table__td--numeric">{product.stock}</td>
                        <td className="erp-table__td">
                          <span className="erp-badge erp-badge--warning">
                            <AlertTriangle className="erp-badge__icon" />
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="erp-card">
          <div className="erp-card__header">
            <h2 className="erp-card__title">Recent Sales</h2>
          </div>
          {recentSales.length === 0 ? (
            <p className="erp-text-muted">No sales yet.</p>
          ) : (
            <div>
              {recentSales.map((sale) => (
                <div key={sale.id} className="erp-recent-sale">
                  <div className="erp-recent-sale__info">
                    <span className="erp-recent-sale__id">
                      {sale.customerName || "Walk-in"} · {sale.displayId}
                    </span>
                    <span className="erp-recent-sale__date">{formatDate(sale.createdAt)}</span>
                  </div>
                  <span className="erp-recent-sale__total">{formatCurrency(sale.grandTotal)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
