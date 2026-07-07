/* ============================================================
 * Screen - Customers
 * ============================================================ */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Eye,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { getAllUsers, type ApiUser } from "@/api/users";
import { APP_CONFIG } from "@/constants/config";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;

function isCustomer(user: ApiUser) {
  return user.roleId?.name?.toLowerCase() === "customer";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailCustomer, setDetailCustomer] = useState<ApiUser | null>(null);

  const customersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  });

  const customers = useMemo(
    () => (customersQuery.data || []).filter(isCustomer),
    [customersQuery.data]
  );

  const activeCustomers = customers.filter((customer) => !customer.isDeleted);
  const deletedCustomers = customers.filter((customer) => customer.isDeleted);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query)
      );
    });
  }, [customers, search]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const loading = customersQuery.isLoading;
  const hasError = customersQuery.isError;
  const errorMessage =
    customersQuery.error?.message || "Unable to load customer records.";

  if (loading) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-skeleton erp-skeleton--heading" />
        </div>
        <div className="erp-card">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="erp-skeleton erp-skeleton--row" />
          ))}
        </div>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <h1 className="text-display">Customers</h1>
            <p className="erp-page-header__subtitle">
              Review customer accounts from live user records.
            </p>
          </div>
        </div>
        <div className="erp-card">
          <EmptyState
            icon={AlertCircle}
            headline="Could not load customers"
            body={errorMessage}
            action={
              <button
                className="erp-btn erp-btn--md erp-btn--outline"
                onClick={() => customersQuery.refetch()}
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
          <h1 className="text-display">Customers</h1>
          <p className="erp-page-header__subtitle">
            View customer profiles created through users and sales workflows.
          </p>
        </div>
      </div>

      <div className="erp-user-overview">
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Total Customers</span>
          <span className="erp-role-stat__value">{customers.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Active Customers</span>
          <span className="erp-role-stat__value">{activeCustomers.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Deleted Customers</span>
          <span className="erp-role-stat__value">{deletedCustomers.length}</span>
        </div>
      </div>

      <section className="erp-product-panel">
        <div className="erp-role-toolbar">
          <div className="erp-input-wrapper erp-role-toolbar__search">
            <Search className="erp-input-wrapper__icon-left" />
            <input
              className="erp-input erp-role-search-input"
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              aria-label="Search customers"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="erp-role-empty">
            <EmptyState
              icon={search ? Search : Users}
              headline={search ? "No customers matched" : "No customers found"}
              body={
                search
                  ? "Try a different name, email, or phone number."
                  : "Customer records will appear here after they are created."
              }
              action={
                search ? (
                  <button
                    className="erp-btn erp-btn--md erp-btn--outline"
                    onClick={() => setSearch("")}
                  >
                    Clear Search
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="erp-table-container erp-table-container--responsive">
            <table className="erp-table">
              <thead className="erp-table__head">
                <tr className="erp-table__header-row">
                  <th className="erp-table__th">Customer</th>
                  <th className="erp-table__th">Email</th>
                  <th className="erp-table__th">Phone</th>
                  <th className="erp-table__th">Status</th>
                  <th className="erp-table__th">Created</th>
                  <th className="erp-table__th erp-table__th--right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="erp-table__body">
                {paginated.map((customer) => (
                  <tr key={customer._id} className="erp-table__row">
                    <td className="erp-table__td">
                      <div className="erp-product-cell">
                        <span className="erp-avatar erp-avatar--sm">
                          {customer.img ? (
                            <img src={customer.img} alt={customer.name} />
                          ) : (
                            getInitials(customer.name) || <UserRound />
                          )}
                        </span>
                        <div className="erp-product-cell__body">
                          <span className="erp-product-cell__name">
                            {customer.name}
                          </span>
                          <span className="erp-product-cell__meta">
                            ID {customer._id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="erp-table__td">
                      <span className="erp-row erp-row--gap-8">
                        <Mail className="erp-badge__icon" />
                        {customer.email}
                      </span>
                    </td>
                    <td className="erp-table__td">
                      <span className="erp-row erp-row--gap-8 numeral">
                        <Phone className="erp-badge__icon" />
                        {customer.phone}
                      </span>
                    </td>
                    <td className="erp-table__td">
                      <span
                        className={`erp-badge ${
                          customer.isDeleted
                            ? "erp-badge--danger"
                            : "erp-badge--success"
                        }`}
                      >
                        {customer.isDeleted ? "Deleted" : "Active"}
                      </span>
                    </td>
                    <td className="erp-table__td">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="erp-table__td erp-table__td--actions">
                      <button
                        className="erp-table__action-btn"
                        onClick={() => setDetailCustomer(customer)}
                        aria-label={`View ${customer.name}`}
                      >
                        <Eye className="erp-table__action-btn-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="erp-mobile-cards">
              {paginated.map((customer) => (
                <div key={customer._id} className="erp-mobile-card">
                  <div className="erp-mobile-card__header">
                    <span className="erp-mobile-card__title">
                      {customer.name}
                    </span>
                    <span
                      className={`erp-badge ${
                        customer.isDeleted
                          ? "erp-badge--danger"
                          : "erp-badge--success"
                      }`}
                    >
                      {customer.isDeleted ? "Deleted" : "Active"}
                    </span>
                  </div>
                  <div className="erp-mobile-card__row">
                    <span className="erp-mobile-card__label">Email</span>
                    <span className="erp-mobile-card__value">
                      {customer.email}
                    </span>
                  </div>
                  <div className="erp-mobile-card__row">
                    <span className="erp-mobile-card__label">Phone</span>
                    <span className="erp-mobile-card__value">
                      {customer.phone}
                    </span>
                  </div>
                  <div className="erp-role-mobile-actions">
                    <button
                      className="erp-btn erp-btn--sm erp-btn--outline"
                      onClick={() => setDetailCustomer(customer)}
                    >
                      <Eye className="erp-btn__icon" />
                      View
                    </button>
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
                  {totalItems} customers
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

      {detailCustomer && (
        <Drawer
          isOpen={!!detailCustomer}
          onClose={() => setDetailCustomer(null)}
          title="Customer Detail"
        >
          <div className="erp-product-detail__header">
            <span className="erp-avatar erp-avatar--lg">
              {detailCustomer.img ? (
                <img src={detailCustomer.img} alt={detailCustomer.name} />
              ) : (
                getInitials(detailCustomer.name) || <UserRound />
              )}
            </span>
            <div className="erp-product-detail__info">
              <h3 className="text-h2">{detailCustomer.name}</h3>
              <span className="text-caption">{detailCustomer.email}</span>
            </div>
          </div>
          <div className="erp-detail-list">
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Customer ID</span>
              <span className="erp-detail-list__value numeral">
                {detailCustomer._id}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Email</span>
              <span className="erp-detail-list__value">
                {detailCustomer.email}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Phone</span>
              <span className="erp-detail-list__value numeral">
                {detailCustomer.phone}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Role</span>
              <span className="erp-badge erp-badge--neutral">
                {detailCustomer.roleId.name}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Status</span>
              <span
                className={`erp-badge ${
                  detailCustomer.isDeleted
                    ? "erp-badge--danger"
                    : "erp-badge--success"
                }`}
              >
                {detailCustomer.isDeleted ? "Deleted" : "Active"}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Created</span>
              <span className="erp-detail-list__value">
                {formatDate(detailCustomer.createdAt)}
              </span>
            </div>
            <div className="erp-detail-list__item">
              <span className="erp-detail-list__label">Updated</span>
              <span className="erp-detail-list__value">
                {formatDate(detailCustomer.updatedAt)}
              </span>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
