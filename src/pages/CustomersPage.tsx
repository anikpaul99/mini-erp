/* ============================================================
 * Screen — Customers (§5.13) + Add/Edit/Delete/Detail
 * ============================================================
 * Uses React Query mutations + Redux store.
 * ============================================================ */

import { useState, useMemo } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import { selectCustomers, selectCustomersInitialized } from "@/redux/slices/customersSlice";
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/queries/useCustomersQuery";
import type { Customer } from "@/types/customer";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;

export default function CustomersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const canEdit = user?.role === "Admin" || user?.role === "Manager";

  const { isLoading: queryLoading } = useCustomers();
  const addMutation = useAddCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers = useAppSelector(selectCustomers);
  const initialized = useAppSelector(selectCustomersInitialized);
  const loading = queryLoading || !initialized;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    let result = [...customers];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q));
    }
    return result;
  }, [customers, search]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAdd = async (data: Partial<Customer>) => {
    await addMutation.mutateAsync(data);
    setAddModalOpen(false);
    addToast("success", "Customer added.");
  };

  const handleEdit = async (data: Partial<Customer>) => {
    if (!editCustomer) return;
    await updateMutation.mutateAsync({ ...editCustomer, ...data });
    setEditCustomer(null);
    addToast("success", "Changes saved.");
  };

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    await deleteMutation.mutateAsync(deleteCustomer.id);
    setDeleteCustomer(null);
    addToast("success", "Customer deleted.");
  };

  if (loading) {
    return (<><div className="erp-page-header"><div className="erp-skeleton erp-skeleton--heading" /></div><div className="erp-card">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="erp-skeleton erp-skeleton--row" />))}</div></>);
  }

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left"><h1 className="text-display">Customers</h1></div>
        {canEdit && (<button className="erp-btn erp-btn--md erp-btn--primary" onClick={() => setAddModalOpen(true)}><Plus className="erp-btn__icon" />Add Customer</button>)}
      </div>

      <div className="erp-filter-row">
        <div className="erp-input-wrapper"><Search className="erp-input-wrapper__icon-left" /><input className="erp-input" type="text" placeholder="Search by name, phone, or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label="Search customers" /></div>
      </div>

      {filtered.length === 0 ? (
        <div className="erp-card">
          {search ? (<EmptyState icon={Search} headline="No matches found" body="Try a different search term." action={<button className="erp-btn erp-btn--md erp-btn--outline" onClick={() => setSearch("")}>Clear search</button>} />) : (<EmptyState icon={Users} headline="No customers yet" body="Add your first customer to start building your contact list." action={canEdit ? (<button className="erp-btn erp-btn--md erp-btn--primary" onClick={() => setAddModalOpen(true)}><Plus className="erp-btn__icon" />Add Customer</button>) : undefined} />)}
        </div>
      ) : (
        <div className="erp-table-container erp-table-container--responsive">
          <table className="erp-table">
            <thead className="erp-table__head">
              <tr className="erp-table__header-row">
                <th className="erp-table__th">Name</th>
                <th className="erp-table__th">Phone</th>
                <th className="erp-table__th">Email</th>
                <th className="erp-table__th erp-table__th--right">Purchases</th>
                <th className="erp-table__th erp-table__th--right">Actions</th>
              </tr>
            </thead>
            <tbody className="erp-table__body">
              {paginated.map((customer) => (
                <tr key={customer.id} className="erp-table__row">
                  <td className="erp-table__td">{customer.name}</td>
                  <td className="erp-table__td erp-table__td--numeric">{customer.phone}</td>
                  <td className="erp-table__td">{customer.email || <span className="erp-text-muted">—</span>}</td>
                  <td className="erp-table__td erp-table__td--numeric">{customer.totalPurchases}</td>
                  <td className="erp-table__td erp-table__td--actions">
                    <div className="erp-table__actions">
                      <button className="erp-table__action-btn" onClick={() => setDetailCustomer(customer)} aria-label={`View ${customer.name}`}><Eye className="erp-table__action-btn-icon" /></button>
                      {canEdit && (<><button className="erp-table__action-btn" onClick={() => setEditCustomer(customer)} aria-label={`Edit ${customer.name}`}><Pencil className="erp-table__action-btn-icon" /></button><button className="erp-table__action-btn erp-table__action-btn--danger" onClick={() => setDeleteCustomer(customer)} aria-label={`Delete ${customer.name}`}><Trash2 className="erp-table__action-btn-icon" /></button></>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="erp-mobile-cards">
            {paginated.map((customer) => (
              <div key={customer.id} className="erp-mobile-card">
                <div className="erp-mobile-card__header"><span className="erp-mobile-card__title">{customer.name}</span><button className="erp-mobile-card__menu-btn" onClick={() => setDetailCustomer(customer)} aria-label={`View ${customer.name}`}><Eye className="erp-table__action-btn-icon" /></button></div>
                <div className="erp-mobile-card__row"><span className="erp-mobile-card__label">Phone</span><span className="erp-mobile-card__value">{customer.phone}</span></div>
                <div className="erp-mobile-card__row"><span className="erp-mobile-card__label">Purchases</span><span className="erp-mobile-card__value">{customer.totalPurchases}</span></div>
              </div>
            ))}
          </div>

          <div className="erp-pagination">
            <div className="erp-pagination__info"><select className="erp-select erp-select--sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>{PAGE_SIZES.map((s) => (<option key={s} value={s}>{s} / page</option>))}</select><span className="erp-pagination__text">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}</span></div>
            <div className="erp-pagination__controls">
              <button className="erp-pagination__btn erp-pagination__btn--nav" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (<button key={i + 1} className={`erp-pagination__btn${i + 1 === page ? " erp-pagination__btn--active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>))}
              <button className="erp-pagination__btn erp-pagination__btn--nav" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          </div>
        </div>
      )}

      <CustomerFormModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={handleAdd} title="Add Customer" submitLabel="Add Customer" />
      {editCustomer && (<CustomerFormModal isOpen={!!editCustomer} onClose={() => setEditCustomer(null)} onSubmit={handleEdit} title="Edit Customer" submitLabel="Save Changes" initialData={editCustomer} />)}
      {deleteCustomer && (<ConfirmDialog isOpen={!!deleteCustomer} onClose={() => setDeleteCustomer(null)} onConfirm={handleDelete} title={`Delete ${deleteCustomer.name}?`} body="This can't be undone. The customer will be permanently removed." confirmLabel="Delete" variant="danger" />)}
      {detailCustomer && (
        <Drawer isOpen={!!detailCustomer} onClose={() => setDetailCustomer(null)} title="Customer Detail" footer={canEdit ? (<><button className="erp-btn erp-btn--md erp-btn--outline" onClick={() => { setDetailCustomer(null); setEditCustomer(detailCustomer); }}>Edit</button><button className="erp-btn erp-btn--md erp-btn--ghost erp-text-danger" onClick={() => { setDetailCustomer(null); setDeleteCustomer(detailCustomer); }}>Delete</button></>) : undefined}>
          <div className="erp-detail-list">
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Name</span><span className="erp-detail-list__value">{detailCustomer.name}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Phone</span><span className="erp-detail-list__value">{detailCustomer.phone}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Email</span><span className="erp-detail-list__value">{detailCustomer.email || "—"}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Total Purchases</span><span className="erp-detail-list__value">{detailCustomer.totalPurchases}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Notes</span><span className="erp-detail-list__value">{detailCustomer.notes || "—"}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Added</span><span className="erp-detail-list__value">{new Date(detailCustomer.createdAt).toLocaleDateString()}</span></div>
          </div>
        </Drawer>
      )}
    </>
  );
}

interface CustomerFormModalProps { isOpen: boolean; onClose: () => void; onSubmit: (data: Partial<Customer>) => Promise<void>; title: string; submitLabel: string; initialData?: Customer; }

function CustomerFormModal({ isOpen, onClose, onSubmit, title, submitLabel, initialData }: CustomerFormModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  const validate = (): boolean => { const e: Record<string, string> = {}; if (!name.trim()) e.name = "Name is required."; if (!phone.trim()) e.phone = "Phone is required."; setErrors(e); return Object.keys(e).length === 0; };

  const handleSubmit = async (ev: React.FormEvent) => { ev.preventDefault(); if (!validate()) return; setFormLoading(true); try { await onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, notes: notes.trim() || undefined }); } finally { setFormLoading(false); } };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={<><button className="erp-btn erp-btn--md erp-btn--outline" onClick={onClose} disabled={formLoading}>Cancel</button><button className="erp-btn erp-btn--md erp-btn--primary" onClick={handleSubmit} disabled={formLoading}>{formLoading && <Loader2 className="erp-btn__spinner" />}{formLoading ? "Saving…" : submitLabel}</button></>}>
      <div className="erp-field"><label className="erp-field__label" htmlFor="cust-name">Name<span className="erp-field__required">*</span></label><input id="cust-name" className={`erp-input${errors.name ? " erp-input--error" : ""}`} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />{errors.name && <span className="erp-field__helper erp-field__helper--error">{errors.name}</span>}</div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="cust-phone">Phone<span className="erp-field__required">*</span></label><input id="cust-phone" className={`erp-input${errors.phone ? " erp-input--error" : ""}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />{errors.phone && <span className="erp-field__helper erp-field__helper--error">{errors.phone}</span>}</div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="cust-email">Email</label><input id="cust-email" className="erp-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="cust-notes">Notes</label><textarea id="cust-notes" className="erp-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes about this customer" /></div>
    </Modal>
  );
}
