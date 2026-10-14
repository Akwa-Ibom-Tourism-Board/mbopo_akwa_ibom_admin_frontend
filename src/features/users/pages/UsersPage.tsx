import { useState } from "react";
import { Link } from "react-router-dom";
import { ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { ConfirmDialog, PageHeader } from "@/shared/components";
import { ResetPasswordDialog } from "../components/ResetPasswordDialog";
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
  const [resetting, setResetting] = useState<AdminUser | null>(null);

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
      <ResetPasswordDialog
        user={resetting}
        onClose={() => setResetting(null)}
      />
    </>
  );
}
