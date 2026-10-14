import { useState } from "react";
import { Link } from "react-router-dom";
import { ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { ConfirmDialog, PageHeader } from "@/shared/components";
import { ResetPasswordDialog } from "../components/ResetPasswordDialog";
import { UserForm } from "../components/UserForm";
import { UserTable } from "../components/UserTable";
import { useSetUserActive, useSetUsersActive, useUsers } from "../api/hooks";
import type { AdminUser } from "../types";

export function UsersPage() {
  const { data, isLoading } = useUsers();
  const setActive = useSetUserActive();
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toggling, setToggling] = useState<AdminUser | null>(null);
  const [resetting, setResetting] = useState<AdminUser | null>(null);
  const setMany = useSetUsersActive();
  const [bulk, setBulk] = useState<{
    users: AdminUser[];
    active: boolean;
    clear: () => void;
  } | null>(null);

  return (
    <>
      <PageHeader
        title="Users"
        description="Staff accounts. Passwords are stored scrambled and never listed — if someone loses theirs, reset it: a new temporary one is emailed and shown to you once."
        actions={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Button asChild variant="outline">
              <Link to="/users/bulk">
                <ListPlus size={16} /> Add in bulk
              </Link>
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus size={16} /> Add user
            </Button>
          </div>
        }
      />
      <UserTable
        users={data}
        isLoading={isLoading}
        onEdit={(u) => {
          setEditing(u);
          setFormOpen(true);
        }}
        onToggleActive={setToggling}
        onResetPassword={setResetting}
        onBulkSetActive={(users, active, clear) =>
          setBulk({ users, active, clear })
        }
      />
      <UserForm user={editing} open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={!!toggling}
        onOpenChange={(o) => !o && setToggling(null)}
        title={
          toggling?.active
            ? "Deactivate this account?"
            : "Reactivate this account?"
        }
        description={
          toggling
            ? toggling.active
              ? `${toggling.firstName} ${toggling.lastName} will no longer be able to sign in.`
              : `${toggling.firstName} ${toggling.lastName} will be able to sign in again.`
            : undefined
        }
        destructive={!!toggling?.active}
        confirmLabel={toggling?.active ? "Deactivate" : "Reactivate"}
        loading={setActive.isPending}
        onConfirm={() =>
          toggling &&
          setActive.mutate(
            { id: toggling.id, active: !toggling.active },
            {
              onSuccess: () => {
                toast.success(
                  toggling.active
                    ? "Account deactivated"
                    : "Account reactivated",
                );
                setToggling(null);
              },
              onError: (e) => {
                toast.error(e.message);
                setToggling(null);
              },
            },
          )
        }
      />
      <ConfirmDialog
        open={!!bulk}
        onOpenChange={(o) => !o && setBulk(null)}
        title={
          bulk
            ? `${bulk.active ? "Reactivate" : "Deactivate"} ${bulk.users.length} account${bulk.users.length === 1 ? "" : "s"}?`
            : ""
        }
        description={
          bulk
            ? `${bulk.users
                .slice(0, 4)
                .map((u) => `${u.firstName} ${u.lastName}`)
                .join(
                  ", ",
                )}${bulk.users.length > 4 ? ` and ${bulk.users.length - 4} more` : ""} ${
                bulk.active
                  ? "will be able to sign in again."
                  : "will no longer be able to sign in."
              }`
            : undefined
        }
        destructive={!!bulk && !bulk.active}
        confirmLabel={bulk?.active ? "Reactivate" : "Deactivate"}
        loading={setMany.isPending}
        onConfirm={() =>
          bulk &&
          setMany.mutate(
            { ids: bulk.users.map((u) => u.id), active: bulk.active },
            {
              onSuccess: ({ changed, skipped }) => {
                const verb = bulk.active ? "reactivated" : "deactivated";
                if (skipped.length) {
                  toast.warning(
                    `${changed.length} ${verb}, ${skipped.length} skipped — ${skipped[0]!.name}: ${skipped[0]!.reason}`,
                  );
                } else {
                  toast.success(
                    `${changed.length} account${changed.length === 1 ? "" : "s"} ${verb}`,
                  );
                }
                bulk.clear();
                setBulk(null);
              },
              onError: (e) => {
                toast.error(e.message);
                setBulk(null);
              },
            },
          )
        }
      />
      <ResetPasswordDialog
        user={resetting}
        onClose={() => setResetting(null)}
      />
    </>
  );
}
