/* ============================================================
 * Screen - Roles & Permissions
 * ============================================================ */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  createRole,
  createRolePermissionBlueprint,
  getAllPermissions,
  getAllRolePermissionBlueprints,
  getAllRoles,
  toggleDeleteRole,
  updateBlueprintPermission,
  updateRole,
  type ApiPermission,
  type ApiRole,
  type ApiRolePermissionBlueprint,
} from "@/api/roles";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

type RoleStatusFilter = "active" | "deleted" | "all";

const roleFilters: Array<{ label: string; value: RoleStatusFilter }> = [
  { label: "Active", value: "active" },
  { label: "Deleted", value: "deleted" },
  { label: "All", value: "all" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getModuleName(permission: ApiPermission) {
  if (permission.module) return permission.module;
  return permission.code.split(":")[0] || "system";
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPermissionIds(blueprint: ApiRolePermissionBlueprint | null) {
  return blueprint?.permissionIds.map((permission) => permission._id) || [];
}

export default function RolesPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoleStatusFilter>("active");
  const [roleModal, setRoleModal] = useState<ApiRole | "new" | null>(null);
  const [deleteRole, setDeleteRole] = useState<ApiRole | null>(null);
  const [blueprintModal, setBlueprintModal] = useState<
    ApiRolePermissionBlueprint | "new" | null
  >(null);

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });

  const permissionsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: getAllPermissions,
  });

  const blueprintsQuery = useQuery({
    queryKey: ["role-permission-blueprints"],
    queryFn: getAllRolePermissionBlueprints,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      addToast("success", "Role created successfully.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateRole(id, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      addToast("success", "Role updated successfully.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: toggleDeleteRole,
    onSuccess: async (role) => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      addToast(
        "success",
        role.isDeleted ? "Role deleted successfully." : "Role restored."
      );
    },
  });

  const createBlueprintMutation = useMutation({
    mutationFn: createRolePermissionBlueprint,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["role-permission-blueprints"],
      });
      addToast("success", "Permission blueprint created.");
    },
  });

  const updateBlueprintMutation = useMutation({
    mutationFn: updateBlueprintPermission,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["role-permission-blueprints"],
      });
    },
  });

  const roles = rolesQuery.data || [];
  const permissions = permissionsQuery.data || [];
  const blueprints = blueprintsQuery.data || [];
  const activeRoles = roles.filter((role) => !role.isDeleted);
  const deletedRoles = roles.filter((role) => role.isDeleted);
  const rolesWithBlueprints = new Set(
    blueprints.map((blueprint) => blueprint.roleId._id)
  );
  const availableBlueprintRoles = activeRoles.filter(
    (role) => !rolesWithBlueprints.has(role._id)
  );

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch = query
        ? role.name.toLowerCase().includes(query)
        : true;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !role.isDeleted) ||
        (statusFilter === "deleted" && role.isDeleted);

      return matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, ApiPermission[]>>(
      (groups, permission) => {
        const moduleName = getModuleName(permission);
        if (!groups[moduleName]) groups[moduleName] = [];
        groups[moduleName].push(permission);
        return groups;
      },
      {}
    );
  }, [permissions]);

  const permissionModules = Object.entries(groupedPermissions).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const loading =
    rolesQuery.isLoading ||
    permissionsQuery.isLoading ||
    blueprintsQuery.isLoading;
  const hasError =
    rolesQuery.isError || permissionsQuery.isError || blueprintsQuery.isError;
  const errorMessage =
    rolesQuery.error?.message ||
    permissionsQuery.error?.message ||
    blueprintsQuery.error?.message ||
    "Unable to load roles and permissions.";

  const handleSaveRole = async (name: string) => {
    if (roleModal === "new") {
      await createMutation.mutateAsync(name);
    } else if (roleModal) {
      await updateMutation.mutateAsync({ id: roleModal._id, name });
    }
    setRoleModal(null);
  };

  const handleToggleDelete = async () => {
    if (!deleteRole) return;
    await deleteMutation.mutateAsync(deleteRole._id);
    setDeleteRole(null);
  };

  const handleSaveBlueprint = async ({
    name,
    roleId,
    permissionIds,
    blueprint,
  }: {
    name: string;
    roleId: string;
    permissionIds: string[];
    blueprint: ApiRolePermissionBlueprint | null;
  }) => {
    if (!blueprint) {
      await createBlueprintMutation.mutateAsync({ name, roleId, permissionIds });
      setBlueprintModal(null);
      return;
    }

    const currentIds = new Set(getPermissionIds(blueprint));
    const nextIds = new Set(permissionIds);
    const permissionsToAdd = permissionIds.filter((id) => !currentIds.has(id));
    const permissionsToRemove = [...currentIds].filter((id) => !nextIds.has(id));

    for (const permissionId of permissionsToAdd) {
      await updateBlueprintMutation.mutateAsync({
        blueprintId: blueprint._id,
        permissionId,
        action: "add",
      });
    }

    for (const permissionId of permissionsToRemove) {
      await updateBlueprintMutation.mutateAsync({
        blueprintId: blueprint._id,
        permissionId,
        action: "remove",
      });
    }

    addToast("success", "Blueprint permissions updated.");
    setBlueprintModal(null);
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
        <div className="erp-roles-shell">
          <div className="erp-card">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="erp-skeleton erp-skeleton--row" />
            ))}
          </div>
          <div className="erp-card">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="erp-skeleton erp-skeleton--row" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <h1 className="text-display">Roles &amp; Permissions</h1>
            <p className="erp-page-header__subtitle">
              Manage role records and role-permission blueprints.
            </p>
          </div>
        </div>
        <div className="erp-card">
          <EmptyState
            icon={AlertCircle}
            headline="Could not load access data"
            body={errorMessage}
            action={
              <button
                className="erp-btn erp-btn--md erp-btn--outline"
                onClick={() => {
                  rolesQuery.refetch();
                  permissionsQuery.refetch();
                  blueprintsQuery.refetch();
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
          <h1 className="text-display">Roles &amp; Permissions</h1>
          <p className="erp-page-header__subtitle">
            Manage roles, seeded permissions, and role-permission blueprints.
          </p>
        </div>
        <div className="erp-row erp-row--gap-8">
          <button
            className="erp-btn erp-btn--md erp-btn--outline"
            onClick={() => setBlueprintModal("new")}
            disabled={availableBlueprintRoles.length === 0}
            title={
              availableBlueprintRoles.length === 0
                ? "Every active role already has a blueprint."
                : undefined
            }
          >
            <Layers3 className="erp-btn__icon" />
            New Blueprint
          </button>
          <button
            className="erp-btn erp-btn--md erp-btn--primary"
            onClick={() => setRoleModal("new")}
          >
            <Plus className="erp-btn__icon" />
            New Role
          </button>
        </div>
      </div>

      <div className="erp-role-overview">
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Active Roles</span>
          <span className="erp-role-stat__value">{activeRoles.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Blueprints</span>
          <span className="erp-role-stat__value">{blueprints.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Permissions</span>
          <span className="erp-role-stat__value">{permissions.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Deleted Roles</span>
          <span className="erp-role-stat__value">{deletedRoles.length}</span>
        </div>
      </div>

      <div className="erp-roles-shell">
        <section className="erp-role-panel">
          <div className="erp-role-panel__header">
            <div>
              <h2 className="erp-card__title">Role Directory</h2>
              <p className="erp-role-panel__subtitle">
                Backend-managed role records used across account access.
              </p>
            </div>
            <span className="erp-badge erp-badge--info">
              {filteredRoles.length} shown
            </span>
          </div>

          <div className="erp-role-toolbar">
            <div className="erp-input-wrapper erp-role-toolbar__search">
              <Search className="erp-input-wrapper__icon-left" />
              <input
                className="erp-input erp-role-search-input"
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search roles"
              />
            </div>
            <div className="erp-segmented" aria-label="Role status filter">
              {roleFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={`erp-segmented__item${
                    statusFilter === filter.value
                      ? " erp-segmented__item--active"
                      : ""
                  }`}
                  onClick={() => setStatusFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="erp-role-empty">
              <EmptyState
                icon={ShieldCheck}
                headline="No roles found"
                body="Adjust the search or create a new role."
              />
            </div>
          ) : (
            <div className="erp-table-container erp-table-container--responsive">
              <table className="erp-table">
                <thead className="erp-table__head">
                  <tr className="erp-table__header-row">
                    <th className="erp-table__th">Role</th>
                    <th className="erp-table__th">Blueprint</th>
                    <th className="erp-table__th">Status</th>
                    <th className="erp-table__th">Updated</th>
                    <th className="erp-table__th erp-table__th--right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="erp-table__body">
                  {filteredRoles.map((role) => {
                    const blueprint = blueprints.find(
                      (item) => item.roleId._id === role._id
                    );

                    return (
                      <tr key={role._id} className="erp-table__row">
                        <td className="erp-table__td">
                          <div className="erp-role-name-cell">
                            <span className="erp-role-name-cell__icon">
                              <ShieldCheck />
                            </span>
                            <div>
                              <span className="erp-role-name-cell__name">
                                {role.name}
                              </span>
                              <span className="erp-role-name-cell__id">
                                {role._id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="erp-table__td">
                          {blueprint ? (
                            <button
                              className="erp-blueprint-link"
                              onClick={() => setBlueprintModal(blueprint)}
                            >
                              <span>{blueprint.name}</span>
                              <small>
                                {blueprint.permissionIds.length} permissions
                              </small>
                            </button>
                          ) : (
                            <span className="erp-badge erp-badge--warning">
                              No blueprint
                            </span>
                          )}
                        </td>
                        <td className="erp-table__td">
                          <span
                            className={`erp-badge ${
                              role.isDeleted
                                ? "erp-badge--danger"
                                : "erp-badge--success"
                            }`}
                          >
                            {role.isDeleted ? "Deleted" : "Active"}
                          </span>
                        </td>
                        <td className="erp-table__td">
                          <span className="numeral">
                            {formatDate(role.updatedAt)}
                          </span>
                        </td>
                        <td className="erp-table__td erp-table__td--actions">
                          <div className="erp-table__actions">
                            <button
                              className="erp-table__action-btn"
                              onClick={() => setRoleModal(role)}
                              aria-label={`Edit ${role.name}`}
                            >
                              <Pencil className="erp-table__action-btn-icon" />
                            </button>
                            <button
                              className="erp-table__action-btn erp-table__action-btn--danger"
                              onClick={() => setDeleteRole(role)}
                              aria-label={
                                role.isDeleted
                                  ? `Restore ${role.name}`
                                  : `Delete ${role.name}`
                              }
                            >
                              <Trash2 className="erp-table__action-btn-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="erp-permission-panel">
          <div className="erp-role-panel__header">
            <div>
              <h2 className="erp-card__title">Permission Blueprints</h2>
              <p className="erp-role-panel__subtitle">
                Assign backend-seeded permissions to each role.
              </p>
            </div>
            <KeyRound className="erp-permission-panel__icon" />
          </div>

          <div className="erp-blueprint-list">
            {blueprints.map((blueprint) => (
              <section key={blueprint._id} className="erp-blueprint-card">
                <div className="erp-blueprint-card__header">
                  <div>
                    <h3 className="erp-blueprint-card__title">
                      {blueprint.name}
                    </h3>
                    <span className="erp-blueprint-card__meta">
                      {blueprint.roleId.name} role
                    </span>
                  </div>
                  <button
                    className="erp-table__action-btn"
                    onClick={() => setBlueprintModal(blueprint)}
                    aria-label={`Edit ${blueprint.name}`}
                  >
                    <Pencil className="erp-table__action-btn-icon" />
                  </button>
                </div>
                <div className="erp-blueprint-card__summary">
                  <span className="erp-badge erp-badge--info">
                    {blueprint.permissionIds.length} permissions
                  </span>
                  <span className="erp-blueprint-card__date">
                    Updated {formatDate(blueprint.updatedAt)}
                  </span>
                </div>
                <div className="erp-blueprint-card__permissions">
                  {blueprint.permissionIds.slice(0, 5).map((permission) => (
                    <span key={permission._id} className="erp-permission-chip">
                      {permission.code}
                    </span>
                  ))}
                  {blueprint.permissionIds.length > 5 && (
                    <span className="erp-permission-chip erp-permission-chip--muted">
                      +{blueprint.permissionIds.length - 5} more
                    </span>
                  )}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>

      <RoleFormModal
        isOpen={roleModal !== null}
        role={roleModal === "new" ? null : roleModal}
        title={roleModal === "new" ? "Create Role" : "Edit Role"}
        submitLabel={roleModal === "new" ? "Create Role" : "Save Changes"}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setRoleModal(null)}
        onSubmit={handleSaveRole}
      />

      <BlueprintFormModal
        isOpen={blueprintModal !== null}
        blueprint={blueprintModal === "new" ? null : blueprintModal}
        roles={activeRoles}
        unavailableRoleIds={
          blueprintModal === "new" ? rolesWithBlueprints : new Set()
        }
        permissions={permissions}
        permissionModules={permissionModules}
        loading={
          createBlueprintMutation.isPending || updateBlueprintMutation.isPending
        }
        onClose={() => setBlueprintModal(null)}
        onSubmit={handleSaveBlueprint}
      />

      {deleteRole && (
        <ConfirmDialog
          isOpen={!!deleteRole}
          onClose={() => setDeleteRole(null)}
          onConfirm={handleToggleDelete}
          title={`${deleteRole.isDeleted ? "Restore" : "Delete"} ${
            deleteRole.name
          }?`}
          body={
            deleteRole.isDeleted
              ? "This role will become available again anywhere the backend allows it."
              : "This toggles the role into a deleted state. The backend keeps the record for audit history."
          }
          confirmLabel={deleteRole.isDeleted ? "Restore Role" : "Delete Role"}
          variant={deleteRole.isDeleted ? "neutral" : "danger"}
        />
      )}
    </>
  );
}

interface RoleFormModalProps {
  isOpen: boolean;
  role: ApiRole | null;
  title: string;
  submitLabel: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

function RoleFormModal({
  isOpen,
  role,
  title,
  submitLabel,
  loading,
  onClose,
  onSubmit,
}: RoleFormModalProps) {
  const [name, setName] = useState(role?.name || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(role?.name || "");
      setError("");
    }
  }, [isOpen, role]);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const nextName = name.trim();

    if (!nextName) {
      setError("Role name is required.");
      return;
    }

    await onSubmit(nextName);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
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
            {loading ? "Saving..." : submitLabel}
          </button>
        </>
      }
    >
      <form className="erp-role-form" onSubmit={handleSubmit}>
        <div className="erp-field">
          <label className="erp-field__label" htmlFor="role-name">
            Role Name<span className="erp-field__required">*</span>
          </label>
          <input
            id="role-name"
            className={`erp-input${error ? " erp-input--error" : ""}`}
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="Customer"
            autoComplete="off"
          />
          {error ? (
            <span className="erp-field__helper erp-field__helper--error">
              {error}
            </span>
          ) : (
            <span className="erp-field__helper">
              Use a clear business label. Permissions are assigned with
              blueprints.
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}

interface BlueprintFormModalProps {
  isOpen: boolean;
  blueprint: ApiRolePermissionBlueprint | null;
  roles: ApiRole[];
  unavailableRoleIds: Set<string>;
  permissions: ApiPermission[];
  permissionModules: Array<[string, ApiPermission[]]>;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    roleId: string;
    permissionIds: string[];
    blueprint: ApiRolePermissionBlueprint | null;
  }) => Promise<void>;
}

function BlueprintFormModal({
  isOpen,
  blueprint,
  roles,
  unavailableRoleIds,
  permissions,
  permissionModules,
  loading,
  onClose,
  onSubmit,
}: BlueprintFormModalProps) {
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    []
  );
  const [error, setError] = useState("");
  const isEditing = Boolean(blueprint);
  const availableRoles = roles.filter(
    (role) => !unavailableRoleIds.has(role._id)
  );

  useEffect(() => {
    if (!isOpen) return;

    const firstAvailableRole = roles.find(
      (role) => !unavailableRoleIds.has(role._id)
    );

    setName(blueprint?.name || "");
    setRoleId(blueprint?.roleId._id || firstAvailableRole?._id || "");
    setSelectedPermissionIds(getPermissionIds(blueprint));
    setError("");
  }, [blueprint, isOpen, roles, unavailableRoleIds]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  };

  const selectModule = (modulePermissions: ApiPermission[]) => {
    const moduleIds = modulePermissions.map((permission) => permission._id);
    setSelectedPermissionIds((current) => {
      const next = new Set(current);
      const allSelected = moduleIds.every((id) => next.has(id));

      moduleIds.forEach((id) => {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });

      return [...next];
    });
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const uniquePermissionIds = [...new Set(selectedPermissionIds)];

    if (!name.trim()) {
      setError("Blueprint name is required.");
      return;
    }

    if (!roleId) {
      setError("Select a role for this blueprint.");
      return;
    }

    if (uniquePermissionIds.length === 0) {
      setError("Select at least one permission.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        roleId,
        permissionIds: uniquePermissionIds,
        blueprint,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save this permission blueprint."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Permission Blueprint" : "Create Permission Blueprint"}
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
            disabled={loading || (!isEditing && availableRoles.length === 0)}
            type="button"
          >
            {loading && <Loader2 className="erp-btn__spinner" />}
            {loading ? "Saving..." : isEditing ? "Update Permissions" : "Create Blueprint"}
          </button>
        </>
      }
    >
      <form className="erp-blueprint-form" onSubmit={handleSubmit}>
        <div className="erp-field">
          <label className="erp-field__label" htmlFor="blueprint-name">
            Blueprint Name<span className="erp-field__required">*</span>
          </label>
          <input
            id="blueprint-name"
            className={`erp-input${error ? " erp-input--error" : ""}`}
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="Senior Manager Blueprint"
            disabled={isEditing}
          />
        </div>

        <div className="erp-field">
          <label className="erp-field__label" htmlFor="blueprint-role">
            Role<span className="erp-field__required">*</span>
          </label>
          <select
            id="blueprint-role"
            className="erp-select"
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            disabled={isEditing || availableRoles.length === 0}
          >
            {roles.map((role) => {
              const unavailable = unavailableRoleIds.has(role._id);

              return (
                <option
                  key={role._id}
                  value={role._id}
                  disabled={unavailable}
                >
                  {role.name}
                  {unavailable ? " - already has blueprint" : ""}
                </option>
              );
            })}
          </select>
          {availableRoles.length === 0 && !isEditing && (
            <span className="erp-field__helper erp-field__helper--warning">
              Every active role already has a blueprint. Create a new role first
              or edit an existing blueprint.
            </span>
          )}
          {isEditing && (
            <span className="erp-field__helper">
              This backend endpoint updates permissions. Create a new blueprint
              to use a different role or name.
            </span>
          )}
        </div>

        <div className="erp-blueprint-form__summary">
          <span>{selectedPermissionIds.length} selected</span>
          <span>{permissions.length} available permissions</span>
        </div>

        {error && (
          <span className="erp-field__helper erp-field__helper--error">
            {error}
          </span>
        )}

        <div className="erp-blueprint-permission-groups">
          {permissionModules.map(([moduleName, modulePermissions]) => {
            const moduleIds = modulePermissions.map((permission) => permission._id);
            const selectedCount = moduleIds.filter((id) =>
              selectedPermissionIds.includes(id)
            ).length;

            return (
              <section key={moduleName} className="erp-blueprint-permission-group">
                <div className="erp-blueprint-permission-group__header">
                  <div>
                    <h3 className="erp-permission-module__title">
                      {titleCase(moduleName)}
                    </h3>
                    <span className="erp-permission-module__meta">
                      {selectedCount} of {modulePermissions.length} selected
                    </span>
                  </div>
                  <button
                    type="button"
                    className="erp-btn erp-btn--sm erp-btn--outline"
                    onClick={() => selectModule(modulePermissions)}
                  >
                    {selectedCount === modulePermissions.length
                      ? "Clear"
                      : "Select"}
                  </button>
                </div>
                <div className="erp-blueprint-permission-options">
                  {modulePermissions.map((permission) => {
                    const checked = selectedPermissionIds.includes(permission._id);

                    return (
                      <label
                        key={permission._id}
                        className={`erp-blueprint-permission-option${
                          checked ? " erp-blueprint-permission-option--selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(permission._id)}
                        />
                        <span>
                          <strong>{permission.name}</strong>
                          <code>{permission.code}</code>
                        </span>
                        {checked && <CheckCircle2 />}
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </form>
    </Modal>
  );
}
