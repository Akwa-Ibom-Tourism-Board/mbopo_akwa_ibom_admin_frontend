import { useEffect, useState } from "react";
import styled from "styled-components";
import { Check, Copy, MailCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { useResetPassword } from "../api/hooks";
import type { AdminUser } from "../types";

const Secret = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0 14px;
  padding: 14px 16px;
  border: 1.5px dashed ${({ theme }) => theme.colors.primary.DEFAULT};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.alpha(theme.colors.primary.DEFAULT, 0.06)};

  code {
    min-width: 0;
    color: ${({ theme }) => theme.colors.foreground};
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    word-break: break-all;
  }
`;

const Sent = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.primary.DEFAULT};
  font-size: 0.875rem;
  font-weight: 600;
`;

const Warn = styled.p`
  display: flex;
  gap: 8px;
  margin: 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.secondary.DEFAULT};
  }
`;

// Two steps. 1) Confirm. 2) The new temporary password is shown once — in case
// the email is slow — and the dialog can only be closed with Done, which drops
// it from memory: from then on nobody can see it again.
export function ResetPasswordDialog({
  user,
  onClose,
}: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  const reset = useResetPassword();
  const [shown, setShown] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Whatever happens, never keep the password once this dialog goes away.
  useEffect(() => () => setShown(null), []);

  const done = () => {
    setShown(null);
    setCopied(false);
    reset.reset();
    onClose();
  };

  const copy = async () => {
    if (!shown) return;
    try {
      await navigator.clipboard.writeText(shown.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the password and copy it by hand.");
    }
  };

  const generate = () =>
    user &&
    reset.mutate(user.id, {
      onSuccess: ({ email, temporaryPassword }) =>
        setShown({ email, password: temporaryPassword }),
      onError: (e) => {
        toast.error(e.message);
        onClose();
      },
    });

  // Step 2 — reveal. Only the Done button closes it.
  if (shown) {
    return (
      <Dialog open onOpenChange={() => undefined}>
        <DialogContent
          hideClose
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>New temporary password</DialogTitle>
            <DialogDescription>
              Give this to {user?.firstName} if the email doesn't reach them in
              time.
            </DialogDescription>
          </DialogHeader>
          <Sent>
            <MailCheck size={16} /> Emailed to {shown.email}
          </Sent>
          <Secret>
            <code aria-label="Temporary password">{shown.password}</code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copy()}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </Secret>
          <Warn>
            <ShieldAlert size={15} />
            This is the only time it can be seen. When you click Done it is
            scrambled and can't be shown again — to issue another, reset the
            password again.
          </Warn>
          <DialogFooter>
            <Button type="button" onClick={done}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 1 — confirm.
  return (
    <Dialog
      open={!!user}
      onOpenChange={(o) => !o && !reset.isPending && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset this password?</DialogTitle>
          <DialogDescription>
            {user
              ? `A new temporary password will be generated and emailed to ${user.email}. You'll see it once on the next screen, in case the email is slow. The old password stops working.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={reset.isPending}
          >
            Cancel
          </Button>
          <Button onClick={generate} disabled={reset.isPending}>
            {reset.isPending ? "Working…" : "Generate & email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
