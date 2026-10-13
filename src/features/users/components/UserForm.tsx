import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { FormRow, FormStack } from "@/shared/components/FormParts";
import { ASSIGNABLE_ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import type { AdminUser } from "../types";
import { useCreateUser, useUpdateUser } from "../api/hooks";

const schema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name"),
  lastName: z.string().trim().min(1, "Enter a last name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email")
    .email("Enter a valid email"),
  role: z.string().min(1, "Choose a role"),
});
type Values = z.infer<typeof schema>;

const toValues = (u?: AdminUser): Values => ({
  firstName: u?.firstName ?? "",
  lastName: u?.lastName ?? "",
  email: u?.email ?? "",
  role: u?.role ?? "",
});

// The role picker only ever lists roles the signed-in user may assign — which
// never includes Super Admin, for anyone (lib/rbac.ts ASSIGNABLE_ROLES).
export function UserForm({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null; // null = new user
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { role: actorRole } = useAuth();
  const roles = actorRole ? ASSIGNABLE_ROLES[actorRole] : [];
  const create = useCreateUser();
  const update = useUpdateUser();
  const pending = create.isPending || update.isPending;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(user ?? undefined),
  });

  useEffect(() => {
    if (open) reset(toValues(user ?? undefined));
  }, [open, user, reset]);

  const done = (message: string) => {
    toast.success(message);
    onOpenChange(false);
  };

  const onSubmit = (v: Values) => {
    const role = v.role as Role;
    if (!roles.includes(role)) return;
    const input = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      role,
    };
    if (user) {
      update.mutate(
        { id: user.id, patch: input },
        {
          onSuccess: () => done("User updated"),
          onError: (e) => toast.error(e.message),
        },
      );
    } else {
      create.mutate(input, {
        onSuccess: () => done("User created"),
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update this staff member's details or role."
              : "Dummy build: real account setup and invitations come with the backend."}
          </DialogDescription>
        </DialogHeader>
        <FormStack onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormRow
            label="First name"
            htmlFor="u-first"
            error={errors.firstName?.message}
          >
            <Input
              id="u-first"
              invalid={!!errors.firstName}
              {...register("firstName")}
            />
          </FormRow>
          <FormRow
            label="Last name"
            htmlFor="u-last"
            error={errors.lastName?.message}
          >
            <Input
              id="u-last"
              invalid={!!errors.lastName}
              {...register("lastName")}
            />
          </FormRow>
          <FormRow
            label="Email"
            htmlFor="u-email"
            error={errors.email?.message}
          >
            <Input
              id="u-email"
              type="email"
              invalid={!!errors.email}
              {...register("email")}
            />
          </FormRow>
          <FormRow label="Role" error={errors.role?.message}>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Role" invalid={!!errors.role}>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : user ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </FormStack>
      </DialogContent>
    </Dialog>
  );
}
