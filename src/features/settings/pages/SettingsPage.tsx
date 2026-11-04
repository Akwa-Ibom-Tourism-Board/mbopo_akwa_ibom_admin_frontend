import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PasswordInput,
} from "@/shared/ui";
import { PageHeader } from "@/shared/components";
import { FormRow, FormStack } from "@/shared/components/FormParts";
import { useAuth, useChangePassword } from "@/features/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDateTime } from "@/lib/formatting";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type Values = z.infer<typeof schema>;

// Every signed-in role can change their own password here — the backend
// endpoint this calls has no capability gate (see admin-auth.routes.ts),
// since this is each staff member's own account, not something Super
// Admin/Admin manage on someone else's behalf (that's Users > Reset
// password instead).
export function SettingsPage() {
  const { user } = useAuth();
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = (values: Values) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated");
          reset();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your account." />
      <Card style={{ maxWidth: 480 }}>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          {user && (
            <CardDescription>
              Signed in as {user.firstName} {user.lastName} ·{" "}
              {ROLE_LABELS[user.role]}
              {user.passwordChangedAt &&
                ` · password last changed ${formatDateTime(user.passwordChangedAt)}`}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <FormStack onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormRow
              label="Current password"
              htmlFor="settings-current-password"
              error={errors.currentPassword?.message}
            >
              <PasswordInput
                id="settings-current-password"
                autoComplete="current-password"
                invalid={!!errors.currentPassword}
                {...register("currentPassword")}
              />
            </FormRow>
            <FormRow
              label="New password"
              htmlFor="settings-new-password"
              error={errors.newPassword?.message}
            >
              <PasswordInput
                id="settings-new-password"
                autoComplete="new-password"
                invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
            </FormRow>
            <FormRow
              label="Confirm new password"
              htmlFor="settings-confirm-password"
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="settings-confirm-password"
                autoComplete="new-password"
                invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </FormRow>
            <Button
              type="submit"
              disabled={changePassword.isPending}
              style={{ alignSelf: "flex-start" }}
            >
              {changePassword.isPending ? "Updating…" : "Update password"}
            </Button>
          </FormStack>
        </CardContent>
      </Card>
    </>
  );
}
