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
  Textarea,
} from "@/shared/ui";
import type { Sponsor } from "../types";
import { useSaveSponsor } from "../api/hooks";
import { FormRow, FormStack } from "./FormParts";
import { ImageUploadField } from "./ImageUploadField";

const schema = z.object({
  name: z.string().trim().min(2, "Enter the sponsor's name"),
  logo: z.string().min(1, "Add a logo"),
  description: z.string().trim().min(10, "Write a short description"),
  websiteUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https?:\/\/\S+\.\S+/i.test(v),
      "Enter a full link starting with https://",
    ),
});
type Values = z.infer<typeof schema>;

const toValues = (s?: Sponsor): Values => ({
  name: s?.name ?? "",
  logo: s?.logo ?? "",
  description: s?.description ?? "",
  websiteUrl: s?.websiteUrl ?? "",
});

export function SponsorEditor({
  sponsor,
  open,
  onOpenChange,
}: {
  sponsor: Sponsor | null; // null = new sponsor
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useSaveSponsor();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(sponsor ?? undefined),
  });

  useEffect(() => {
    if (open) reset(toValues(sponsor ?? undefined));
  }, [open, sponsor, reset]);

  const onSubmit = (v: Values) =>
    save.mutate(
      {
        id: sponsor?.id,
        name: v.name,
        logo: v.logo,
        description: v.description,
        websiteUrl: v.websiteUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success(sponsor ? "Sponsor updated" : "Sponsor added");
          onOpenChange(false);
        },
        onError: () => toast.error("Couldn't save the sponsor"),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sponsor ? "Edit sponsor" : "Add sponsor"}</DialogTitle>
          <DialogDescription>
            Shown as a card on the public voting site.
          </DialogDescription>
        </DialogHeader>
        <FormStack onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormRow label="Name" htmlFor="s-name" error={errors.name?.message}>
            <Input id="s-name" invalid={!!errors.name} {...register("name")} />
          </FormRow>
          <FormRow label="Logo" error={errors.logo?.message} hint="Up to 5MB.">
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <ImageUploadField
                  multiple={false}
                  label="Choose logo"
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? "")}
                />
              )}
            />
          </FormRow>
          <FormRow
            label="Description"
            htmlFor="s-desc"
            error={errors.description?.message}
          >
            <Textarea
              id="s-desc"
              rows={4}
              invalid={!!errors.description}
              {...register("description")}
            />
          </FormRow>
          <FormRow
            label="Website (optional)"
            htmlFor="s-url"
            error={errors.websiteUrl?.message}
          >
            <Input
              id="s-url"
              type="url"
              placeholder="https://"
              invalid={!!errors.websiteUrl}
              {...register("websiteUrl")}
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
            <Button type="submit" disabled={save.isPending}>
              {save.isPending
                ? "Saving…"
                : sponsor
                  ? "Save changes"
                  : "Add sponsor"}
            </Button>
          </DialogFooter>
        </FormStack>
      </DialogContent>
    </Dialog>
  );
}
