import { useMemo, useState } from "react";
import { KeyRound, Pencil, UserCheck, UserX } from "lucide-react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { Badge, DataTable, type DataTableColumn } from "@/shared/components";
import { useAuth } from "@/features/auth";
import { ALL_ROLES, ROLE_LABELS, canAssignRole } from "@/lib/rbac";
import { formatDate } from "@/lib/formatting";
import type { AdminUser } from "../types";

const columns: DataTableColumn<AdminUser>[] = [
  {
    id: "name",
    header: "Name",
    sortValue: (u) => `${u.firstName} ${u.lastName}`,
    cell: (u) => <strong>{`${u.firstName} ${u.lastName}`}</strong>,
  },
  {
    id: "email",
    header: "Email",
    sortValue: (u) => u.email,
    cell: (u) => u.email,
  },
  {
    id: "password",
    header: "Password",
    sortValue: (u) => u.passwordChangedAt,
    cell: (u) => (
      <span title="Passwords are stored scrambled. Use Reset to issue a new temporary one.">
        <span aria-label="Hidden password" style={{ letterSpacing: 2 }}>
          ••••••••
        </span>
        <small style={{ display: "block", opacity: 0.65 }}>
          Changed {formatDate(u.passwordChangedAt)}
        </small>
      </span>
    ),
  },
  {
    id: "role",
    header: "Role",
    sortValue: (u) => ROLE_LABELS[u.role],
    cell: (u) => <Badge $tone="secondary">{ROLE_LABELS[u.role]}</Badge>,
  },
  {
    id: "status",
    header: "Status",
    sortValue: (u) => (u.active ? 1 : 0),
    cell: (u) => (
      <Badge $tone={u.active ? "primary" : "neutral"}>
        {u.active ? "Active" : "Deactivated"}
      </Badge>
    ),
  },
  {
    id: "created",
    header: "Added",
    sortValue: (u) => u.createdAt,
    cell: (u) => formatDate(u.createdAt),
  },
];

const ALL = "all";

export function UserTable({
  users,
  isLoading,
  onEdit,
  onToggleActive,
  onResetPassword,
}: {
  users: AdminUser[] | undefined;
  isLoading: boolean;
  onEdit: (u: AdminUser) => void;
  onToggleActive: (u: AdminUser) => void;
  onResetPassword: (u: AdminUser) => void;
}) {
  const { user: me, role: myRole } = useAuth();
  const [role, setRole] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const rows = useMemo(
    () =>
      users?.filter(
        (u) =>
          (role === ALL || u.role === role) &&
          (status === ALL || (status === "active") === u.active),
      ),
    [users, role, status],
  );

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(u) => u.id}
      isLoading={isLoading}
      searchText={(u) => `${u.firstName} ${u.lastName} ${u.email}`}
      searchPlaceholder="Search by name or email"
      emptyMessage="No users match."
      filters={
        <>
          <div style={{ flex: "0 1 190px", minWidth: 150 }}>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All roles</SelectItem>
                {ALL_ROLES.filter(
                  (r) => r !== "super_admin" || myRole === "super_admin",
                ).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ flex: "0 1 190px", minWidth: 150 }}>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      }
      rowActions={(u) => {
        // Rows the signed-in role may not manage (Super Admins for everyone;
        // Admins for other Admins) get no actions at all.
        if (!canAssignRole(myRole, u.role)) return null;
        return (
          <span style={{ display: "inline-flex", gap: 4 }}>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Reset password for ${u.firstName}`}
              title="Email a new temporary password"
              onClick={() => onResetPassword(u)}
            >
              <KeyRound size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Edit ${u.firstName}`}
              onClick={() => onEdit(u)}
            >
              <Pencil size={16} />
            </Button>
            {u.id !== me?.id && (
              <Button
                size="icon"
                variant="ghost"
                aria-label={`${u.active ? "Deactivate" : "Reactivate"} ${u.firstName}`}
                onClick={() => onToggleActive(u)}
              >
                {u.active ? <UserX size={16} /> : <UserCheck size={16} />}
              </Button>
            )}
          </span>
        );
      }}
    />
  );
}
