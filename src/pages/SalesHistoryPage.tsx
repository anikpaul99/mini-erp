/* ============================================================
 * Screen - Sales History
 * ============================================================ */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Eye,
  PackageCheck,
  Receipt,
  RefreshCcw,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  getSalesmanAnalytics,
  type SalesmanAnalyticsSale,
} from "@/api/sales";
import { APP_CONFIG } from "@/constants/config";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SalesHistoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailSale, setDetailSale] = useState<SalesmanAnalyticsSale | null>(
    null
  );

  const analyticsQuery = useQuery({
    queryKey: ["salesman-analytics"],
    queryFn: getSalesmanAnalytics,
  });

  const analytics = analyticsQuery.data;
  const sales = analytics?.sales || [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...sales]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((sale) => {
        if (!query) return true;
        return (
          sale.saleId.toLowerCase().includes(query) ||
          sale.customer.name.toLowerCase().includes(query) ||
          sale.salesman.name.toLowerCase().includes(query)
        );
      });
  }, [sales, search]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (analyticsQuery.isLoading) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-skeleton erp-skeleton--heading" />
        </div>
        <div className="erp-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="erp-skeleton erp-skeleton--row" />
          ))}
        </div>
      </>
    );
  }

  if (analyticsQuery.isError || !analytics) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <h1 className="text-display">Sales History</h1>
            <p className="erp-page-header__subtitle">
              Review salesman performance and completed sales.
            </p>
          </div>
        </div>
        <div className="erp-card">
          <EmptyState
            icon={AlertCircle}
            headline="Could not load sales history"
            body={
              analyticsQuery.error?.message ||
              "Unable to load salesman analytics."
            }
            action={
              <button
                className="erp-btn erp-btn--md erp-btn--outline"
                onClick={() => analyticsQuery.refetch()}
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

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Sales History</h1>
          <p className="erp-page-header__subtitle">
            Sales performance for {analytics.salesman.name}.
          </p>
        </div>
      </div>

      <div className="erp-sales-overview">
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Total Sales</span>
          <span className="erp-role-stat__value">
            {analytics.summary.totalSales}
          </span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Items Sold</span>
          <span className="erp-role-stat__value">
            {analytics.summary.totalItemsSold}
          </span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Revenue</span>
          <span className="erp-role-stat__value">
            {formatCurrency(analytics.summary.totalRevenue)}
          </span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Profit</span>
          <span className="erp-role-stat__value">
            {formatCurrency(analytics.summary.totalProfit)}
          </span>
        </div>
      </div>

      <section className="erp-user-panel">
        <div className="erp-role-toolbar">
          <div className="erp-input-wrapper erp-role-toolbar__search">
            <Search className="erp-input-wrapper__icon-left" />
            <input
              className="erp-input erp-role-search-input"
              type="text"
              placeholder="Search sale id, customer, or salesman..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="erp-role-empty">
            <EmptyState
              icon={Receipt}
              headline="No sales found"
              body="Completed sales will appear here."
            />
          </div>
        ) : (
          <div className="erp-table-container erp-table-container--responsive">
            <table className="erp-table">
              <thead className="erp-table__head">
                <tr className="erp-table__header-row">
                  <th className="erp-table__th">Sale ID</th>
                  <th className="erp-table__th">Date</th>
                  <th className="erp-table__th">Customer</th>
                  <th className="erp-table__th">Salesman</th>
                  <th className="erp-table__th erp-table__th--right">
                    Items
                  </th>
                  <th className="erp-table__th erp-table__th--right">
                    Revenue
                  </th>
                  <th className="erp-table__th erp-table__th--right">
                    Profit
                  </th>
                  <th className="erp-table__th erp-table__th--right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="erp-table__body">
                {paginated.map((sale) => (
                  <tr key={sale._id} className="erp-table__row">
                    <td className="erp-table__td">
                      <span className="numeral">{sale.saleId}</span>
                    </td>
                    <td className="erp-table__td">
                      <span className="numeral">
                        {formatDateTime(sale.createdAt)}
                      </span>
                    </td>
                    <td className="erp-table__td">{sale.customer.name}</td>
                    <td className="erp-table__td">{sale.salesman.name}</td>
                    <td className="erp-table__td erp-table__td--numeric">
                      {sale.totalItems}
                    </td>
                    <td className="erp-table__td erp-table__td--numeric">
                      {formatCurrency(sale.revenue)}
                    </td>
                    <td className="erp-table__td erp-table__td--numeric">
                      {formatCurrency(sale.profit)}
                    </td>
                    <td className="erp-table__td erp-table__td--actions">
                      <button
                        className="erp-table__action-btn"
                        onClick={() => setDetailSale(sale)}
                      >
                        <Eye className="erp-table__action-btn-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="erp-mobile-cards">
              {paginated.map((sale) => (
                <div key={sale._id} className="erp-mobile-card">
                  <div className="erp-mobile-card__header">
                    <span className="erp-mobile-card__title">
                      {sale.saleId}
                    </span>
                    <button
                      className="erp-mobile-card__menu-btn"
                      onClick={() => setDetailSale(sale)}
                    >
                      <Eye className="erp-table__action-btn-icon" />
                    </button>
                  </div>
                  <div className="erp-mobile-card__row">
                    <span className="erp-mobile-card__label">Customer</span>
                    <span className="erp-mobile-card__value">
                      {sale.customer.name}
                    </span>
                  </div>
                  <div className="erp-mobile-card__row">
                    <span className="erp-mobile-card__label">Revenue</span>
                    <span className="erp-mobile-card__value">
                      {formatCurrency(sale.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="erp-pagination">
              <div className="erp-pagination__info">
                <select
                  className="erp-select erp-select--sm"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
                <span className="erp-pagination__text">
                  {totalItems} sales
                </span>
              </div>
              <div className="erp-pagination__controls">
                <button
                  className="erp-pagination__btn erp-pagination__btn--nav"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  &lt;
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map(
                  (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        className={`erp-pagination__btn${
                          pageNumber === page
                            ? " erp-pagination__btn--active"
                            : ""
                        }`}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}
                <button
                  className="erp-pagination__btn erp-pagination__btn--nav"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {detailSale && (
        <Drawer
          isOpen={!!detailSale}
          onClose={() => setDetailSale(null)}
          title={`Sale ${detailSale.saleId}`}
        >
          <div className="erp-detail-list erp-mb-24">
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Date</span>
              <span className="erp-detail-list__value">
                {formatDateTime(detailSale.createdAt)}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Customer</span>
              <span className="erp-detail-list__value">
                {detailSale.customer.name}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Salesman</span>
              <span className="erp-detail-list__value">
                {detailSale.salesman.name}
              </span>
            </div>
          </div>

          <div className="erp-sales-detail-grid">
            <div className="erp-role-stat">
              <PackageCheck className="erp-btn__icon" />
              <span className="erp-role-stat__label">Items</span>
              <span className="erp-role-stat__value">
                {detailSale.totalItems}
              </span>
            </div>
            <div className="erp-role-stat">
              <TrendingUp className="erp-btn__icon" />
              <span className="erp-role-stat__label">Revenue</span>
              <span className="erp-role-stat__value">
                {formatCurrency(detailSale.revenue)}
              </span>
            </div>
            <div className="erp-role-stat">
              <Receipt className="erp-btn__icon" />
              <span className="erp-role-stat__label">Profit</span>
              <span className="erp-role-stat__value">
                {formatCurrency(detailSale.profit)}
              </span>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
