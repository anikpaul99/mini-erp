/* ============================================================
 * Screen — Users (§5.17) + Add/Edit/Deactivate
 * ============================================================
 * Uses React Query mutations + Redux store.
 * ============================================================ */

import { useState, useMemo } from "react";
import { Plus, Search, Pencil, UserX, UserCog, Loader2 } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import { selectUsers, selectUsersInitialized } from "@/redux/slices/usersSlice";
import { useUsers, useAddUser, useUpdateUser, useToggleUserStatus } from "@/hooks/queries/useUsersQuery";
import type { SystemUser } from "@/types/user";
import type { Role } from "@/types/auth";
import { APP_CONFIG } from "@/constants/config";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;
const ROLES: Role[] = ["Admin", "Manager", "Employee"];

export default function UsersPage() {
  const { addToast } = useToast();
  const { isLoading: queryLoading } = useUsers();
  const addMutation = useAddUser();
  const updateMutation = useUpdateUser();
  const toggleMutation = useToggleUserStatus();

  const users = useAppSelector(selectUsers);
  const initialized = useAppSelector(selectUsersInitialized);
  const loading = queryLoading || !initialized;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<SystemUser | null>(null);

  const filtered = useMemo(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return result;
  }, [users, search]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAdd = async (data: Partial<SystemUser>) => {
    await addMutation.mutateAsync(data);
    setAddModalOpen(false);
    addToast("success", "User added.");
  };

  const handleEdit = async (data: Partial<SystemUser>) => {
    if (!editUser) return;
    await updateMutation.mutateAsync({ ...editUser, ...data });
    setEditUser(null);
    addToast("success", "Changes saved.");
  };

  const handleDeactivate = async () => {
    if (!deactivateUser) return;
    const newStatus = deactivateUser.status === "Active" ? "deactivated" : "reactivated";
    await toggleMutation.mutateAsync(deactivateUser.id);
    setDeactivateUser(null);
    addToast("success", `User ${newStatus}.`);
  };

  if (loading) {
    return (<><div className="erp-page-header"><div className="erp-skeleton erp-skeleton--heading" /></div><div className="erp-card">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="erp-skeleton erp-skeleton--row" />))}</div></>);
  }

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left"><h1 className="text-display">Users</h1></div>
        <button className="erp-btn erp-btn--md erp-btn--primary" onClick={() => setAddModalOpen(true)}><Plus className="erp-btn__icon" />Add User</button>
      </div>

      <div className="erp-filter-row">
        <div className="erp-input-wrapper"><Search className="erp-input-wrapper__icon-left" /><input className="erp-input" type="text" placeholder="Search by name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label="Search users" /></div>
      </div>

      {filtered.length === 0 ? (
        <div className="erp-card"><EmptyState icon={UserCog} headline="No users found" body="Add users to manage team access." /></div>
      ) : (
        <div className="erp-table-container erp-table-container--responsive">
          <table className="erp-table">
            <thead className="erp-table__head">
              <tr className="erp-table__header-row">
                <th className="erp-table__th">Name</th>
                <th className="erp-table__th">Email</th>
                <th className="erp-table__th">Role</th>
                <th className="erp-table__th">Status</th>
                <th className="erp-table__th">Date Joined</th>
                <th className="erp-table__th erp-table__th--right">Actions</th>
              </tr>
            </thead>
            <tbody className="erp-table__body">
              {paginated.map((u) => (
                <tr key={u.id} className="erp-table__row">
                  <td className="erp-table__td">{u.name}</td>
                  <td className="erp-table__td">{u.email}</td>
                  <td className="erp-table__td"><span className="erp-badge erp-badge--neutral">{u.role}</span></td>
                  <td className="erp-table__td"><span className={`erp-badge ${u.status === "Active" ? "erp-badge--success" : "erp-badge--danger"}`}>{u.status}</span></td>
                  <td className="erp-table__td">{new Date(u.dateJoined).toLocaleDateString()}</td>
                  <td className="erp-table__td erp-table__td--actions">
                    <div className="erp-table__actions">
                      <button className="erp-table__action-btn" onClick={() => setEditUser(u)} aria-label={`Edit ${u.name}`}><Pencil className="erp-table__action-btn-icon" /></button>
                      <button className="erp-table__action-btn erp-table__action-btn--danger" onClick={() => setDeactivateUser(u)} aria-label={`${u.status === "Active" ? "Deactivate" : "Reactivate"} ${u.name}`}><UserX className="erp-table__action-btn-icon" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="erp-mobile-cards">
            {paginated.map((u) => (
              <div key={u.id} className="erp-mobile-card">
                <div className="erp-mobile-card__header"><span className="erp-mobile-card__title">{u.name}</span><span className={`erp-badge ${u.status === "Active" ? "erp-badge--success" : "erp-badge--danger"}`}>{u.status}</span></div>
                <div className="erp-mobile-card__row"><span className="erp-mobile-card__label">Email</span><span className="erp-mobile-card__value">{u.email}</span></div>
                <div className="erp-mobile-card__row"><span className="erp-mobile-card__label">Role</span><span className="erp-badge erp-badge--neutral">{u.role}</span></div>
              </div>
            ))}
          </div>

          <div className="erp-pagination">
            <div className="erp-pagination__info"><select className="erp-select erp-select--sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>{PAGE_SIZES.map((s) => (<option key={s} value={s}>{s} / page</option>))}</select></div>
            <div className="erp-pagination__controls">
              <button className="erp-pagination__btn erp-pagination__btn--nav" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (<button key={i + 1} className={`erp-pagination__btn${i + 1 === page ? " erp-pagination__btn--active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>))}
              <button className="erp-pagination__btn erp-pagination__btn--nav" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          </div>
        </div>
      )}

      <UserFormModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={handleAdd} title="Add User" submitLabel="Add User" />
      {editUser && (<UserFormModal isOpen={!!editUser} onClose={() => setEditUser(null)} onSubmit={handleEdit} title="Edit User" submitLabel="Save Changes" initialData={editUser} />)}
      {deactivateUser && (<ConfirmDialog isOpen={!!deactivateUser} onClose={() => setDeactivateUser(null)} onConfirm={handleDeactivate} title={`${deactivateUser.status === "Active" ? "Deactivate" : "Reactivate"} ${deactivateUser.name}?`} body={deactivateUser.status === "Active" ? "They will lose access immediately." : "They will regain access to the system."} confirmLabel={deactivateUser.status === "Active" ? "Deactivate" : "Reactivate"} variant="neutral" />)}
    </>
  );
}

interface UserFormModalProps { isOpen: boolean; onClose: () => void; onSubmit: (data: Partial<SystemUser>) => Promise<void>; title: string; submitLabel: string; initialData?: SystemUser; }

function UserFormModal({ isOpen, onClose, onSubmit, title, submitLabel, initialData }: UserFormModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState<Role>(initialData?.role || "Employee");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  const validate = (): boolean => { const e: Record<string, string> = {}; if (!name.trim()) e.name = "Name is required."; if (!email.trim()) e.email = "Email is required."; if (!initialData && !password.trim()) e.password = "Password is required."; setErrors(e); return Object.keys(e).length === 0; };

  const handleSubmit = async (ev: React.FormEvent) => { ev.preventDefault(); if (!validate()) return; setFormLoading(true); try { await onSubmit({ name: name.trim(), email: email.trim(), role }); } finally { setFormLoading(false); } };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={<><button className="erp-btn erp-btn--md erp-btn--outline" onClick={onClose} disabled={formLoading}>Cancel</button><button className="erp-btn erp-btn--md erp-btn--primary" onClick={handleSubmit} disabled={formLoading}>{formLoading && <Loader2 className="erp-btn__spinner" />}{formLoading ? "Saving…" : submitLabel}</button></>}>
      <div className="erp-field"><label className="erp-field__label" htmlFor="user-name">Full Name<span className="erp-field__required">*</span></label><input id="user-name" className={`erp-input${errors.name ? " erp-input--error" : ""}`} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />{errors.name && <span className="erp-field__helper erp-field__helper--error">{errors.name}</span>}</div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="user-email">Email<span className="erp-field__required">*</span></label><input id="user-email" className={`erp-input${errors.email ? " erp-input--error" : ""}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@minierp.com" />{errors.email && <span className="erp-field__helper erp-field__helper--error">{errors.email}</span>}</div>
      {!initialData && (<div className="erp-field"><label className="erp-field__label" htmlFor="user-password">Temporary Password<span className="erp-field__required">*</span></label><input id="user-password" className={`erp-input${errors.password ? " erp-input--error" : ""}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />{errors.password && <span className="erp-field__helper erp-field__helper--error">{errors.password}</span>}</div>)}
      <div className="erp-field"><label className="erp-field__label" htmlFor="user-role">Role</label><select id="user-role" className="erp-select" value={role} onChange={(e) => setRole(e.target.value as Role)}>{ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}</select></div>
    </Modal>
  );
}
