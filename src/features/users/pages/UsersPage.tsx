import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { ConfirmDialog, PageHeader } from "@/shared/components";
import { UserForm } from "../components/UserForm";
import { UserTable } from "../components/UserTable";
import { useSetUserActive, useUsers } from "../api/hooks";
import type { AdminUser } from "../types";

export function UsersPage() {
  const { data, isLoading } = useUsers();
  const setActive = useSetUserActive();
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toggling, setToggling] = useState<AdminUser | null>(null);

  return (
    <>
      <PageHeader
        title="Users"
        description="Staff accounts. Super Admin accounts can't be created or changed here."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> Add user
          </Button>
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
    </>
  );
}
