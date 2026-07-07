/* ============================================================
 * Screen - Users Management
 * ============================================================ */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldOff,
  SlidersHorizontal,
  UserCog,
  UserPlus,
} from "lucide-react";
import { getAllRoles, type ApiPermission, type ApiRole } from "@/api/roles";
import {
  createCustomer,
  createUser,
  getAllUsers,
  togglePermissionDeletion,
  updateUser,
  type ApiUser,
  type CreateCustomerPayload,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/api/users";
import { APP_CONFIG } from "@/constants/config";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;

type CreateMode = "user" | "customer";

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

function getPermissionId(permission: ApiPermission | string) {
  return typeof permission === "string" ? permission : permission._id;
}

function getPermissionCode(permission: ApiPermission | string) {
  return typeof permission === "string" ? permission : permission.code;
}

function getPermissionName(permission: ApiPermission | string) {
  return typeof permission === "string" ? permission : permission.name;
}

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
    password
  );
}

export default function UsersPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [permissionUser, setPermissionUser] = useState<ApiUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("success", "User created successfully.");
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("success", "Customer created successfully.");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("success", "User updated successfully.");
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: togglePermissionDeletion,
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setPermissionUser(user);
      addToast("success", "Permission override updated.");
    },
  });

  const users = usersQuery.data || [];
  const roles = useMemo(
    () => (rolesQuery.data || []).filter((role) => !role.isDeleted),
    [rolesQuery.data]
  );
  const staffRoles = useMemo(
    () => roles.filter((role) => role.name.toLowerCase() !== "customer"),
    [roles]
  );
  const customers = users.filter(
    (user) => user.roleId.name.toLowerCase() === "customer"
  );
  const blockedOverrides = users.reduce(
    (total, user) => total + user.blockedPermissionIds.length,
    0
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = query
        ? user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query) ||
          user._id.toLowerCase().includes(query)
        : true;
      const matchesRole =
        roleFilter === "all" || user.roleId._id === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const loading = usersQuery.isLoading || rolesQuery.isLoading;
  const hasError = usersQuery.isError || rolesQuery.isError;
  const errorMessage =
    usersQuery.error?.message ||
    rolesQuery.error?.message ||
    "Unable to load user management data.";

  const handleCreate = async (
    mode: CreateMode,
    payload: CreateUserPayload | CreateCustomerPayload
  ) => {
    if (mode === "user") {
      await createUserMutation.mutateAsync(payload as CreateUserPayload);
    } else {
      await createCustomerMutation.mutateAsync(payload as CreateCustomerPayload);
    }
    setCreateMode(null);
  };

  const handleUpdate = async (payload: UpdateUserPayload) => {
    if (!editUser) return;
    await updateUserMutation.mutateAsync({ id: editUser._id, payload });
    setEditUser(null);
  };

  if (loading) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <div className="erp-skeleton erp-skeleton--heading" />
            <div className="erp-skeleton erp-skeleton--text-sm erp-mt-8" />
          </div>
          <div className="erp-skeleton erp-skeleton--btn" />
        </div>
        <div className="erp-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="erp-skeleton erp-skeleton--row" />
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
            <h1 className="text-display">Users</h1>
            <p className="erp-page-header__subtitle">
              Manage users, customers, roles, and permission overrides.
            </p>
          </div>
        </div>
        <div className="erp-card">
          <EmptyState
            icon={AlertCircle}
            headline="Could not load users"
            body={errorMessage}
            action={
              <button
                className="erp-btn erp-btn--md erp-btn--outline"
                onClick={() => {
                  usersQuery.refetch();
                  rolesQuery.refetch();
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

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Users</h1>
          <p className="erp-page-header__subtitle">
            Manage staff accounts, customer profiles, and per-user permission
            exceptions.
          </p>
        </div>
        <div className="erp-row erp-row--gap-8">
          <button
            className="erp-btn erp-btn--md erp-btn--outline"
            onClick={() => setCreateMode("customer")}
          >
            <UserPlus className="erp-btn__icon" />
            New Customer
          </button>
          <button
            className="erp-btn erp-btn--md erp-btn--primary"
            onClick={() => setCreateMode("user")}
          >
            <Plus className="erp-btn__icon" />
            New User
          </button>
        </div>
      </div>

      <div className="erp-user-overview">
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Total Users</span>
          <span className="erp-role-stat__value">{users.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Staff Accounts</span>
          <span className="erp-role-stat__value">
            {users.length - customers.length}
          </span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Customers</span>
          <span className="erp-role-stat__value">{customers.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Blocked Permissions</span>
          <span className="erp-role-stat__value">{blockedOverrides}</span>
        </div>
      </div>

      <section className="erp-user-panel">
        <div className="erp-role-toolbar">
          <div className="erp-input-wrapper erp-role-toolbar__search">
            <Search className="erp-input-wrapper__icon-left" />
            <input
              className="erp-input erp-role-search-input"
              type="text"
              placeholder="Search name, email, phone, or id..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              aria-label="Search users"
            />
          </div>
          <select
            className="erp-select erp-user-role-filter"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by role"
          >
            <option value="all">All roles</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="erp-role-empty">
            <EmptyState
              icon={UserCog}
              headline="No users found"
              body="Adjust the filters or create a new user."
            />
          </div>
        ) : (
          <div className="erp-table-container erp-table-container--responsive">
            <table className="erp-table">
              <thead className="erp-table__head">
                <tr className="erp-table__header-row">
                  <th className="erp-table__th">User</th>
                  <th className="erp-table__th">Phone</th>
                  <th className="erp-table__th">Role</th>
                  <th className="erp-table__th">Blueprint</th>
                  <th className="erp-table__th">Overrides</th>
                  <th className="erp-table__th">Joined</th>
                  <th className="erp-table__th erp-table__th--right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="erp-table__body">
                {paginated.map((user) => (
                  <tr key={user._id} className="erp-table__row">
                    <td className="erp-table__td">
                      <div className="erp-user-cell">
                        <span className="erp-user-cell__avatar">
                          {getInitials(user.name)}
                        </span>
                        <div className="erp-user-cell__body">
                          <span className="erp-user-cell__name">
                            {user.name}
                          </span>
                          <span className="erp-user-cell__email">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="erp-table__td">
                      <span className="numeral">{user.phone || "-"}</span>
                    </td>
                    <td className="erp-table__td">
                      <span className="erp-badge erp-badge--neutral">
                        {user.roleId.name}
                      </span>
                    </td>
                    <td className="erp-table__td">
                      {user.permissionBlueprintId ? (
                        <div className="erp-user-blueprint">
                          <span>{user.permissionBlueprintId.name}</span>
                          <small>
                            {
                              user.permissionBlueprintId.permissionIds.length
                            } permissions
                          </small>
                        </div>
                      ) : (
                        <span className="erp-badge erp-badge--warning">
                          No blueprint
                        </span>
                      )}
                    </td>
                    <td className="erp-table__td">
                      <span
                        className={`erp-badge ${
                          user.blockedPermissionIds.length > 0
                            ? "erp-badge--danger"
                            : "erp-badge--success"
                        }`}
                      >
                        {user.blockedPermissionIds.length} blocked
                      </span>
                    </td>
                    <td className="erp-table__td">
                      <span className="numeral">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="erp-table__td erp-table__td--actions">
                      <div className="erp-table__actions">
                        <button
                          className="erp-table__action-btn"
                          onClick={() => setPermissionUser(user)}
                          aria-label={`Manage permissions for ${user.name}`}
                        >
                          <SlidersHorizontal className="erp-table__action-btn-icon" />
                        </button>
                        <button
                          className="erp-table__action-btn"
                          onClick={() => setEditUser(user)}
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil className="erp-table__action-btn-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="erp-mobile-cards">
              {paginated.map((user) => (
                <div key={user._id} className="erp-mobile-card">
                  <div className="erp-mobile-card__header">
                    <span className="erp-mobile-card__title">{user.name}</span>
                    <span className="erp-badge erp-badge--neutral">
                      {user.roleId.name}
                    </span>
                  </div>
                  <div className="erp-mobile-card__row">
                    <span className="erp-mobile-card__label">Email</span>
                    <span className="erp-mobile-card__value">{user.email}</span>
                  </div>
                  <div className="erp-mobile-card__row">
                    <span className="erp-mobile-card__label">Phone</span>
                    <span className="erp-mobile-card__value">{user.phone}</span>
                  </div>
                  <div className="erp-role-mobile-actions">
                    <button
                      className="erp-btn erp-btn--sm erp-btn--outline"
                      onClick={() => setPermissionUser(user)}
                    >
                      <SlidersHorizontal className="erp-btn__icon" />
                      Permissions
                    </button>
                    <button
                      className="erp-btn erp-btn--sm erp-btn--outline"
                      onClick={() => setEditUser(user)}
                    >
                      <Pencil className="erp-btn__icon" />
                      Edit
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
                  {totalItems} users
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

      <UserFormModal
        isOpen={createMode !== null}
        mode={createMode || "user"}
        roles={staffRoles}
        loading={createUserMutation.isPending || createCustomerMutation.isPending}
        onClose={() => setCreateMode(null)}
        onSubmit={handleCreate}
      />

      {editUser && (
        <EditUserModal
          isOpen={!!editUser}
          user={editUser}
          roles={staffRoles}
          loading={updateUserMutation.isPending}
          onClose={() => setEditUser(null)}
          onSubmit={handleUpdate}
        />
      )}

      <PermissionDrawer
        user={permissionUser}
        loadingPermissionId={
          togglePermissionMutation.variables?.permissionId || null
        }
        onClose={() => setPermissionUser(null)}
        onToggle={(permissionId) => {
          if (!permissionUser) return;
          togglePermissionMutation.mutate({
            userId: permissionUser._id,
            permissionId,
          });
        }}
      />
    </>
  );
}

interface UserFormModalProps {
  isOpen: boolean;
  mode: CreateMode;
  roles: ApiRole[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    mode: CreateMode,
    payload: CreateUserPayload | CreateCustomerPayload
  ) => Promise<void>;
}

function UserFormModal({
  isOpen,
  mode,
  roles,
  loading,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState("");
  const passwordReady = mode !== "user" || isStrongPassword(password.trim());
  const firstRoleId = roles[0]?._id || "";

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRoleId(firstRoleId);
    setError("");
  }, [firstRoleId, isOpen, mode]);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const normalizedPassword = password.trim();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are required.");
      return;
    }

    if (mode === "user" && !normalizedPassword) {
      setError("Password is required for staff users.");
      return;
    }

    if (mode === "user" && !isStrongPassword(normalizedPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (mode === "user" && !roleId) {
      setError("Select a role for this user.");
      return;
    }

    try {
      if (mode === "user") {
        await onSubmit(mode, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: normalizedPassword,
          roleId,
        });
      } else {
        await onSubmit(mode, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create user.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "user" ? "Create User" : "Create Customer"}
      size="wide"
      footer={
        <>
          <button
            className="erp-btn erp-btn--md erp-btn--outline"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
          <button
            className="erp-btn erp-btn--md erp-btn--primary"
            onClick={() => handleSubmit()}
            disabled={
              loading ||
              (mode === "user" && roles.length === 0) ||
              !passwordReady
            }
            type="button"
          >
            {loading && <Loader2 className="erp-btn__spinner" />}
            {loading ? "Saving..." : mode === "user" ? "Create User" : "Create Customer"}
          </button>
        </>
      }
    >
      <form className="erp-user-form" onSubmit={handleSubmit}>
        <div className="erp-user-form__grid">
          <TextField
            id="create-user-name"
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="John Manager"
            required
          />
          <TextField
            id="create-user-email"
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="manager@mini-erp.com"
            required
          />
          <TextField
            id="create-user-phone"
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="01710000002"
            required
          />
          {mode === "user" && (
            <TextField
              id="create-user-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Manager123@"
              required
            />
          )}
        </div>

        {mode === "user" && (
          <span
            className={`erp-field__helper${
              password && !passwordReady ? " erp-field__helper--error" : ""
            }`}
          >
            Use at least 8 characters with uppercase, lowercase, number, and
            special character. Example: Manager123@
          </span>
        )}

        {mode === "user" && (
          <div className="erp-field">
            <label className="erp-field__label" htmlFor="create-user-role">
              Role<span className="erp-field__required">*</span>
            </label>
            <select
              id="create-user-role"
              className="erp-select"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              disabled={roles.length === 0}
            >
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
            {roles.length === 0 && (
              <span className="erp-field__helper erp-field__helper--warning">
                Create a non-customer role before adding staff users.
              </span>
            )}
          </div>
        )}

        {mode === "customer" && (
          <div className="erp-user-note">
            Customer accounts are created without password or blueprint
            assignment. The backend attaches the Customer role automatically.
          </div>
        )}

        {error && (
          <span className="erp-field__helper erp-field__helper--error">
            {error}
          </span>
        )}
      </form>
    </Modal>
  );
}

interface EditUserModalProps {
  isOpen: boolean;
  user: ApiUser;
  roles: ApiRole[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateUserPayload) => Promise<void>;
}

function EditUserModal({
  isOpen,
  user,
  roles,
  loading,
  onClose,
  onSubmit,
}: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [roleId, setRoleId] = useState(user.roleId._id);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRoleId(user.roleId._id);
    setError("");
  }, [isOpen, user]);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !roleId) {
      setError("Name, email, phone, and role are required.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        roleId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      size="wide"
      footer={
        <>
          <button
            className="erp-btn erp-btn--md erp-btn--outline"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
          <button
            className="erp-btn erp-btn--md erp-btn--primary"
            onClick={() => handleSubmit()}
            disabled={loading}
            type="button"
          >
            {loading && <Loader2 className="erp-btn__spinner" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </>
      }
    >
      <form className="erp-user-form" onSubmit={handleSubmit}>
        <div className="erp-user-form__grid">
          <TextField
            id="edit-user-name"
            label="Full Name"
            value={name}
            onChange={setName}
            required
          />
          <TextField
            id="edit-user-email"
            label="Email"
            value={email}
            onChange={setEmail}
            required
          />
          <TextField
            id="edit-user-phone"
            label="Phone"
            value={phone}
            onChange={setPhone}
            required
          />
          <div className="erp-field">
            <label className="erp-field__label" htmlFor="edit-user-role">
              Role<span className="erp-field__required">*</span>
            </label>
            <select
              id="edit-user-role"
              className="erp-select"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
            >
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <span className="erp-field__helper erp-field__helper--error">
            {error}
          </span>
        )}
      </form>
    </Modal>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: TextFieldProps) {
  return (
    <div className="erp-field">
      <label className="erp-field__label" htmlFor={id}>
        {label}
        {required && <span className="erp-field__required">*</span>}
      </label>
      <input
        id={id}
        className="erp-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

interface PermissionDrawerProps {
  user: ApiUser | null;
  loadingPermissionId: string | null;
  onClose: () => void;
  onToggle: (permissionId: string) => void;
}

function PermissionDrawer({
  user,
  loadingPermissionId,
  onClose,
  onToggle,
}: PermissionDrawerProps) {
  const inheritedPermissions = user?.permissionBlueprintId?.permissionIds || [];
  const blockedIds = new Set(
    user?.blockedPermissionIds.map((permission) => permission._id) || []
  );

  return (
    <Drawer
      isOpen={!!user}
      onClose={onClose}
      title={user ? `${user.name} Permissions` : "Permissions"}
    >
      {!user ? null : (
        <div className="erp-user-permission-drawer">
          <div className="erp-user-permission-summary">
            <div>
              <span className="erp-user-permission-summary__label">Role</span>
              <strong>{user.roleId.name}</strong>
            </div>
            <div>
              <span className="erp-user-permission-summary__label">
                Blueprint
              </span>
              <strong>{user.permissionBlueprintId?.name || "None"}</strong>
            </div>
          </div>

          {inheritedPermissions.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              headline="No inherited permissions"
              body="This user does not have a permission blueprint attached."
              variant="inline"
            />
          ) : (
            <div className="erp-user-permission-list">
              {inheritedPermissions.map((permission) => {
                const permissionId = getPermissionId(permission);
                const blocked = blockedIds.has(permissionId);
                const loading = loadingPermissionId === permissionId;

                return (
                  <div key={permissionId} className="erp-user-permission-row">
                    <div className="erp-user-permission-row__body">
                      <span className="erp-user-permission-row__name">
                        {getPermissionName(permission)}
                      </span>
                      <code>{getPermissionCode(permission)}</code>
                    </div>
                    <button
                      className={`erp-btn erp-btn--sm ${
                        blocked ? "erp-btn--destructive" : "erp-btn--outline"
                      }`}
                      onClick={() => onToggle(permissionId)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="erp-btn__spinner" />
                      ) : (
                        <ShieldOff className="erp-btn__icon" />
                      )}
                      {blocked ? "Blocked" : "Block"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
