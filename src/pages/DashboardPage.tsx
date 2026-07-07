/* ============================================================
 * Screen - Dashboard
 * ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Package,
  Receipt,
  RefreshCcw,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import {
  getAllProducts,
  getProductAnalytics,
  type ApiProduct,
} from "@/api/products";
import { EmptyState } from "@/components/common/EmptyState";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStockBadge(product: ApiProduct) {
  if (product.inStock === 0) {
    return {
      label: "Out of Stock",
      className: "erp-badge--danger",
    };
  }

  if (product.inStock < 5) {
    return {
      label: "Low Stock",
      className: "erp-badge--warning",
    };
  }

  return {
    label: "In Stock",
    className: "erp-badge--success",
  };
}

function normalizeImageUrl(url?: string) {
  const value = url?.trim();
  if (!value) return "";
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://")) return value.replace("http://", "https://");
  if (value.startsWith("https://") || value.startsWith("blob:")) return value;
  if (value.startsWith("res.cloudinary.com/")) return `https://${value}`;
  return value;
}

function getProductImageUrl(product: ApiProduct) {
  return normalizeImageUrl(product.productImg || product.img);
}

export default function DashboardPage() {
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const analyticsQuery = useQuery({
    queryKey: ["product-analytics"],
    queryFn: getProductAnalytics,
  });

  const products = productsQuery.data || [];
  const analytics = analyticsQuery.data;
  const loading = productsQuery.isLoading || analyticsQuery.isLoading;
  const hasError = productsQuery.isError || analyticsQuery.isError;
  const errorMessage =
    productsQuery.error?.message ||
    analyticsQuery.error?.message ||
    "Unable to load dashboard analytics.";

  const inventoryValue = useMemo(() => {
    return products.reduce(
      (total, product) => total + product.actualPrice * product.inStock,
      0
    );
  }, [products]);

  if (loading) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <div className="erp-skeleton erp-skeleton--heading" />
            <div className="erp-skeleton erp-skeleton--text-sm erp-mt-8" />
          </div>
        </div>
        <div className="erp-dashboard-stat-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="erp-skeleton erp-skeleton--card" />
          ))}
        </div>
        <div className="erp-dashboard-ops-grid">
          <div className="erp-skeleton erp-skeleton--card" />
          <div className="erp-skeleton erp-skeleton--card" />
        </div>
      </>
    );
  }

  if (hasError || !analytics) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <h1 className="text-display">Dashboard</h1>
            <p className="erp-page-header__subtitle">
              Product inventory, sales movement, and profitability overview.
            </p>
          </div>
        </div>
        <div className="erp-card">
          <EmptyState
            icon={AlertCircle}
            headline="Could not load dashboard"
            body={errorMessage}
            action={
              <button
                className="erp-btn erp-btn--md erp-btn--outline"
                onClick={() => {
                  productsQuery.refetch();
                  analyticsQuery.refetch();
                }}
              >
                <RefreshCcw className="erp-btn__icon" />
                Try Again
              </button>
            }
          />
        </div>
      </>
    );
  }

  const { overview, lowStockProducts, topSellingProducts } = analytics;

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Dashboard</h1>
          <p className="erp-page-header__subtitle">
            Product inventory, sales movement, and profitability overview.
          </p>
        </div>
      </div>

      <div className="erp-dashboard-stat-grid">
        <MetricCard
          label="Total Products"
          value={overview.totalProducts.toString()}
          icon={Package}
          tone="primary"
        />
        <MetricCard
          label="Stock Available"
          value={overview.totalStockAvailable.toString()}
          icon={Warehouse}
          tone="info"
        />
        <MetricCard
          label="Products Sold"
          value={overview.totalProductsSold.toString()}
          icon={Receipt}
          tone="success"
        />
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          label="Total Profit"
          value={formatCurrency(overview.totalProfit)}
          icon={BarChart3}
          tone={overview.totalProfit >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="erp-dashboard-ops-grid">
        <section className="erp-dashboard-products-panel">
          <div className="erp-card__header">
            <div>
              <h2 className="erp-card__title">Product Inventory</h2>
              <p className="erp-dashboard-section-subtitle">
                Live product records from the backend catalog.
              </p>
            </div>
            <span className="erp-badge erp-badge--info">
              {products.length} products
            </span>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              headline="No products found"
              body="Products created by the backend will appear here."
              variant="inline"
            />
          ) : (
            <div className="erp-table-container erp-table-container--responsive">
              <table className="erp-table">
                <thead className="erp-table__head">
                  <tr className="erp-table__header-row">
                    <th className="erp-table__th">Product</th>
                    <th className="erp-table__th">SKU</th>
                    <th className="erp-table__th erp-table__th--right">
                      Actual
                    </th>
                    <th className="erp-table__th erp-table__th--right">
                      Selling
                    </th>
                    <th className="erp-table__th erp-table__th--right">
                      Stock
                    </th>
                    <th className="erp-table__th">Status</th>
                    <th className="erp-table__th">Updated</th>
                  </tr>
                </thead>
                <tbody className="erp-table__body">
                  {products.map((product) => {
                    const stock = getStockBadge(product);

                    return (
                      <tr
                        key={product._id}
                        className={`erp-table__row${
                          product.inStock < 5
                            ? " erp-table__row--low-stock"
                            : ""
                        }`}
                      >
                        <td className="erp-table__td">
                          <div className="erp-dashboard-product-cell">
                            <DashboardProductImage product={product} />
                            <span>{product.productName}</span>
                          </div>
                        </td>
                        <td className="erp-table__td">
                          <span className="numeral">{product.sku}</span>
                        </td>
                        <td className="erp-table__td erp-table__td--numeric">
                          {formatCurrency(product.actualPrice)}
                        </td>
                        <td className="erp-table__td erp-table__td--numeric">
                          {formatCurrency(product.sellingPrice)}
                        </td>
                        <td className="erp-table__td erp-table__td--numeric">
                          {product.inStock}
                        </td>
                        <td className="erp-table__td">
                          <span className={`erp-badge ${stock.className}`}>
                            {product.inStock < 5 && (
                              <AlertTriangle className="erp-badge__icon" />
                            )}
                            {stock.label}
                          </span>
                        </td>
                        <td className="erp-table__td">
                          <span className="numeral">
                            {formatDate(product.updatedAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="erp-mobile-cards">
                {products.map((product) => {
                  const stock = getStockBadge(product);

                  return (
                    <div
                      key={product._id}
                      className={`erp-mobile-card${
                        product.inStock < 5
                          ? " erp-mobile-card--low-stock"
                          : ""
                      }`}
                    >
                      <div className="erp-mobile-card__header">
                        <span className="erp-mobile-card__title">
                          {product.productName}
                        </span>
                        <span className={`erp-badge ${stock.className}`}>
                          {stock.label}
                        </span>
                      </div>
                      <div className="erp-mobile-card__row">
                        <span className="erp-mobile-card__label">SKU</span>
                        <span className="erp-mobile-card__value">
                          {product.sku}
                        </span>
                      </div>
                      <div className="erp-mobile-card__row">
                        <span className="erp-mobile-card__label">Price</span>
                        <span className="erp-mobile-card__value">
                          {formatCurrency(product.sellingPrice)}
                        </span>
                      </div>
                      <div className="erp-mobile-card__row">
                        <span className="erp-mobile-card__label">Stock</span>
                        <span className="erp-mobile-card__value">
                          {product.inStock}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <aside className="erp-dashboard-side-panel">
          <section className="erp-card">
            <div className="erp-card__header">
              <h2 className="erp-card__title">Low Stock</h2>
              <span className="erp-badge erp-badge--warning">
                {lowStockProducts.length}
              </span>
            </div>
            <CompactProductList products={lowStockProducts} />
          </section>

          <section className="erp-card">
            <div className="erp-card__header">
              <h2 className="erp-card__title">Top Selling</h2>
            </div>
            {topSellingProducts.length === 0 ? (
              <p className="erp-text-muted">No sales movement yet.</p>
            ) : (
              <div className="erp-dashboard-top-selling">
                {topSellingProducts.map((product) => (
                  <div
                    key={product.productId}
                    className="erp-dashboard-top-selling__item"
                  >
                    <div>
                      <span className="erp-dashboard-top-selling__name">
                        {product.productName}
                      </span>
                      <span className="erp-dashboard-top-selling__meta">
                        {product.sku} | {product.soldQuantity} sold
                      </span>
                    </div>
                    <div className="erp-dashboard-top-selling__numbers">
                      <strong>{formatCurrency(product.revenue)}</strong>
                      <span>{formatCurrency(product.profit)} profit</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="erp-card">
            <div className="erp-card__header">
              <h2 className="erp-card__title">Inventory Value</h2>
            </div>
            <span className="erp-dashboard-inventory-value">
              {formatCurrency(inventoryValue)}
            </span>
            <p className="erp-dashboard-section-subtitle">
              Based on actual price multiplied by current stock.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

function DashboardProductImage({ product }: { product: ApiProduct }) {
  const imageUrl = getProductImageUrl(product);
  const [failedUrl, setFailedUrl] = useState("");
  const canRender = imageUrl && imageUrl !== failedUrl;

  useEffect(() => {
    setFailedUrl("");
  }, [imageUrl]);

  return (
    <span className="erp-dashboard-product-cell__image">
      {canRender ? (
        <img
          src={imageUrl}
          alt={product.productName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <Package />
      )}
    </span>
  );
}

type MetricTone = "primary" | "success" | "info" | "danger";

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Package;
  tone: MetricTone;
}) {
  return (
    <div className="erp-stat-card">
      <div className="erp-stat-card__content">
        <span className="erp-stat-card__label">{label}</span>
        <span
          className={`erp-stat-card__value${
            tone === "danger" ? " erp-stat-card__value--danger" : ""
          }`}
        >
          {value}
        </span>
      </div>
      <div
        className={`erp-stat-card__icon-container erp-stat-card__icon-container--${tone}`}
      >
        <Icon className="erp-stat-card__icon" />
      </div>
    </div>
  );
}

function CompactProductList({ products }: { products: ApiProduct[] }) {
  if (products.length === 0) {
    return <p className="erp-text-muted">Everything is stocked.</p>;
  }

  return (
    <div className="erp-dashboard-compact-products">
      {products.map((product) => (
        <div key={product._id} className="erp-dashboard-compact-products__item">
          <div>
            <span className="erp-dashboard-compact-products__name">
              {product.productName}
            </span>
            <span className="erp-dashboard-compact-products__sku">
              {product.sku}
            </span>
          </div>
          <span className="erp-badge erp-badge--danger">
            {product.inStock} left
          </span>
        </div>
      ))}
    </div>
  );
}
