import { useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui";
import { Badge, ConfirmDialog } from "@/shared/components";
import { useUsers } from "@/features/users";
import { formatDateTime } from "@/lib/formatting";
import {
  useRegistrationSetting,
  useUpdateRegistrationSetting,
} from "../api/hooks";
import type { RegistrationStatus } from "../api";

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  open: "Open",
  new_intake_closed: "Closed to new intakes",
  closed: "Fully closed",
};

const STATUS_TONE: Record<
  RegistrationStatus,
  "primary" | "secondary" | "danger"
> = {
  open: "primary",
  new_intake_closed: "secondary",
  closed: "danger",
};

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const Option = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};

  p {
    margin: 2px 0 0;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.8125rem;
    max-width: 44rem;
  }
`;

const OptionText = styled.div`
  flex: 1 1 320px;
  min-width: 0;

  strong {
    color: ${({ theme }) => theme.colors.foreground};
    font-size: 0.9375rem;
  }
`;

const OPTIONS: {
  status: RegistrationStatus;
  title: string;
  description: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  destructive: boolean;
}[] = [
  {
    status: "open",
    title: "Open",
    description:
      "Anyone can sign up, start, continue, and submit an application. The register button shows everywhere.",
    confirmTitle: "Open registration?",
    confirmDescription:
      "The register button and page return everywhere, and anyone can sign up and apply again.",
    confirmLabel: "Open registration",
    destructive: false,
  },
  {
    status: "new_intake_closed",
    title: "Closed to new intakes",
    description:
      "Nobody new can sign up — the register button is hidden and /register redirects to login. Anyone who already has an account can still log in, continue, and submit their application.",
    confirmTitle: "Close registration to new intakes?",
    confirmDescription:
      "New visitors will no longer be able to sign up — the register button disappears and /register redirects to login. Applicants who already have an account can still log in and finish theirs.",
    confirmLabel: "Close to new intakes",
    destructive: true,
  },
  {
    status: "closed",
    title: "Fully closed",
    description:
      "Nobody — new or existing — can sign up, edit a draft, or submit. Everyone sees a banner saying registration has ended.",
    confirmTitle: "Close registration completely?",
    confirmDescription:
      "This also stops everyone who already has an account from editing or submitting their application — not just new sign-ups. Use this only once registration should end for everybody.",
    confirmLabel: "Close completely",
    destructive: true,
  },
];

export function RegistrationSettingsCard() {
  const { data, isLoading } = useRegistrationSetting();
  const users = useUsers();
  const update = useUpdateRegistrationSetting();
  const [pending, setPending] = useState<RegistrationStatus | null>(null);

  const nameOf = (id: string | null) => {
    if (!id) return null;
    const u = users.data?.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : null;
  };

  const pendingOption = OPTIONS.find((o) => o.status === pending);

  const confirm = () => {
    if (!pending) return;
    update.mutate(pending, {
      onSuccess: () => {
        toast.success(
          `Registration is now ${STATUS_LABELS[pending].toLowerCase()}.`,
        );
        setPending(null);
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Card style={{ maxWidth: 720 }}>
      <CardHeader>
        <CardTitle>Registration</CardTitle>
        <CardDescription>
          Control whether people can sign up and apply on the public site.
          {data && (
            <>
              {" "}
              Currently{" "}
              <Badge $tone={STATUS_TONE[data.status]}>
                {STATUS_LABELS[data.status]}
              </Badge>
              {data.updatedAt &&
                ` · last changed ${formatDateTime(data.updatedAt)}${
                  nameOf(data.updatedBy) ? ` by ${nameOf(data.updatedBy)}` : ""
                }`}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Options>
          {OPTIONS.map((o) => (
            <Option key={o.status}>
              <OptionText>
                <strong>{o.title}</strong>
                <p>{o.description}</p>
              </OptionText>
              <Button
                variant={o.status === data?.status ? "outline" : "default"}
                disabled={isLoading || o.status === data?.status}
                onClick={() => setPending(o.status)}
              >
                {o.status === data?.status ? "Current" : `Set to ${o.title}`}
              </Button>
            </Option>
          ))}
        </Options>
      </CardContent>

      <ConfirmDialog
        open={!!pendingOption}
        onOpenChange={(open) => !open && setPending(null)}
        title={pendingOption?.confirmTitle ?? ""}
        description={pendingOption?.confirmDescription}
        confirmLabel={pendingOption?.confirmLabel}
        destructive={pendingOption?.destructive}
        loading={update.isPending}
        onConfirm={confirm}
      />
    </Card>
  );
}
