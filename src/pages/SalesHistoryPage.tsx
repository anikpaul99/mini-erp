/* ============================================================
 * Screen — Sales History (§5.11) + Sale Detail Drawer (§5.12)
 * ============================================================ */

import { useState, useEffect, useMemo } from "react";
import { Eye, Search, Receipt } from "lucide-react";
import { MOCK_SALES } from "@/mock/sales";
import type { Sale } from "@/types/sale";
import { APP_CONFIG } from "@/constants/config";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;

export default function SalesHistoryPage() {
  const [sales] = useState<Sale[]>(MOCK_SALES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailSale, setDetailSale] = useState<Sale | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const formatCurrency = (v: number) => `${APP_CONFIG.currency}${v.toFixed(2)}`;
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filtered = useMemo(() => {
    let result = [...sales].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.displayId.toLowerCase().includes(q) ||
          (s.customerName && s.customerName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [sales, search]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
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

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Sales History</h1>
        </div>
      </div>

      <div className="erp-filter-row">
        <div className="erp-input-wrapper">
          <Search className="erp-input-wrapper__icon-left" />
          <input
            className="erp-input"
            type="text"
            placeholder="Search by Sale ID or Customer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search sales"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="erp-card">
          <EmptyState
            icon={Receipt}
            headline="No sales recorded yet"
            body="Completed sales will show up here."
          />
        </div>
      ) : (
        <div className="erp-table-container erp-table-container--responsive">
          <table className="erp-table">
            <thead className="erp-table__head">
              <tr className="erp-table__header-row">
                <th className="erp-table__th">Sale ID</th>
                <th className="erp-table__th">Date & Time</th>
                <th className="erp-table__th">Customer</th>
                <th className="erp-table__th">Items</th>
                <th className="erp-table__th erp-table__th--right">Grand Total</th>
                <th className="erp-table__th">Created By</th>
                <th className="erp-table__th erp-table__th--right">Actions</th>
              </tr>
            </thead>
            <tbody className="erp-table__body">
              {paginated.map((sale) => (
                <tr key={sale.id} className="erp-table__row">
                  <td className="erp-table__td erp-table__td--numeric">
                    {sale.displayId}
                  </td>
                  <td className="erp-table__td">
                    <span className="text-numeral-sm">
                      {formatDateTime(sale.createdAt)}
                    </span>
                  </td>
                  <td className="erp-table__td">
                    {sale.customerName || (
                      <span className="erp-text-muted">Walk-in</span>
                    )}
                  </td>
                  <td className="erp-table__td">
                    {sale.lineItems.length} items
                  </td>
                  <td className="erp-table__td erp-table__td--numeric">
                    <strong>{formatCurrency(sale.grandTotal)}</strong>
                  </td>
                  <td className="erp-table__td">{sale.createdByName}</td>
                  <td className="erp-table__td erp-table__td--actions">
                    <div className="erp-table__actions">
                      <button
                        className="erp-table__action-btn"
                        onClick={() => setDetailSale(sale)}
                        aria-label={`View sale ${sale.displayId}`}
                      >
                        <Eye className="erp-table__action-btn-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="erp-mobile-cards">
            {paginated.map((sale) => (
              <div key={sale.id} className="erp-mobile-card">
                <div className="erp-mobile-card__header">
                  <span className="erp-mobile-card__title">
                    {sale.displayId}
                  </span>
                  <button
                    className="erp-mobile-card__menu-btn"
                    onClick={() => setDetailSale(sale)}
                    aria-label={`View ${sale.displayId}`}
                  >
                    <Eye className="erp-table__action-btn-icon" />
                  </button>
                </div>
                <div className="erp-mobile-card__row">
                  <span className="erp-mobile-card__label">Customer</span>
                  <span className="erp-mobile-card__value">
                    {sale.customerName || "Walk-in"}
                  </span>
                </div>
                <div className="erp-mobile-card__row">
                  <span className="erp-mobile-card__label">Total</span>
                  <span className="erp-mobile-card__value erp-mobile-card__value--numeric">
                    {formatCurrency(sale.grandTotal)}
                  </span>
                </div>
                <div className="erp-mobile-card__row">
                  <span className="erp-mobile-card__label">Date</span>
                  <span className="erp-mobile-card__value">
                    {formatDateTime(sale.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="erp-pagination">
            <div className="erp-pagination__info">
              <select
                className="erp-select erp-select--sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
              <span className="erp-pagination__text">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalItems)} of {totalItems}
              </span>
            </div>
            <div className="erp-pagination__controls">
              <button
                className="erp-pagination__btn erp-pagination__btn--nav"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button
                  key={i + 1}
                  className={`erp-pagination__btn${
                    i + 1 === page ? " erp-pagination__btn--active" : ""
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="erp-pagination__btn erp-pagination__btn--nav"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Drawer */}
      {detailSale && (
        <Drawer
          isOpen={!!detailSale}
          onClose={() => setDetailSale(null)}
          title={`Sale ${detailSale.displayId}`}
        >
          <div className="erp-mb-16">
            <span className="text-numeral-sm erp-text-muted">
              {formatDateTime(detailSale.createdAt)}
            </span>
          </div>

          {/* Customer */}
          <div className="erp-detail-list erp-mb-24">
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Customer</span>
              <span className="erp-detail-list__value">
                {detailSale.customerName || "Walk-in sale"}
              </span>
            </div>
          </div>

          {/* Line items */}
          <table className="erp-receipt-table">
            <thead className="erp-receipt-table__header">
              <tr>
                <th className="erp-receipt-table__th">Product</th>
                <th className="erp-receipt-table__th erp-receipt-table__th--right">
                  Qty
                </th>
                <th className="erp-receipt-table__th erp-receipt-table__th--right">
                  Price
                </th>
                <th className="erp-receipt-table__th erp-receipt-table__th--right">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {detailSale.lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="erp-receipt-table__td">
                    {item.productName}
                  </td>
                  <td className="erp-receipt-table__td erp-receipt-table__td--numeric">
                    {item.quantity}
                  </td>
                  <td className="erp-receipt-table__td erp-receipt-table__td--numeric">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="erp-receipt-table__td erp-receipt-table__td--numeric">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="erp-divider" />

          <div className="erp-sale-total">
            <span className="erp-sale-total__label">Grand Total</span>
            <span className="erp-sale-total__value">
              {formatCurrency(detailSale.grandTotal)}
            </span>
          </div>

          <div className="erp-divider" />

          <div className="erp-detail-list">
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Created by</span>
              <span className="erp-detail-list__value">
                {detailSale.createdByName}
              </span>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
