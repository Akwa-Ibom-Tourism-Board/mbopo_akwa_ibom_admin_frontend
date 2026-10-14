import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Combobox,
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
  Textarea,
} from "@/shared/ui";
import { FormRow, FormStack } from "@/shared/components/FormParts";
import { useUpdateCandidateDetails } from "../api/hooks";
import {
  SECTION_FIELDS,
  SECTION_LABELS,
  sectionSchemas,
  type FieldDef,
  type SectionId,
} from "../schemas";
import type { Candidate } from "../types";

type Values = Record<string, string>;

const initialValues = (c: Candidate, section: SectionId): Values =>
  Object.fromEntries(
    SECTION_FIELDS[section].map((f) => [
      f.name,
      String((c as unknown as Record<string, unknown>)[f.name] ?? ""),
    ]),
  );

const LOCKED_NOTE: Partial<Record<SectionId, string>> = {
  personal:
    "Name, gender, date of birth and email come from the applicant's verified identity and can't be edited.",
  origin:
    "NIN and VIN come from the applicant's verified identity and can't be edited.",
};

function SectionForm({
  candidate,
  section,
  onClose,
}: {
  candidate: Candidate;
  section: SectionId;
  onClose: () => void;
}) {
  const update = useUpdateCandidateDetails(candidate.id);
  const fields = SECTION_FIELDS[section];
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(
      sectionSchemas[section] as unknown as z.ZodType<
        Values,
        z.ZodTypeDef,
        Values
      >,
    ),
    defaultValues: initialValues(candidate, section),
  });
  const values = watch();

  const render = (f: FieldDef) => {
    const error = errors[f.name]?.message as string | undefined;
    const common = { id: `f-${f.name}`, invalid: !!error };
    switch (f.kind) {
      case "textarea":
        return (
          <Textarea {...common} rows={f.rows ?? 3} {...register(f.name)} />
        );
      case "select":
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label={f.label} invalid={!!error}>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {f.options!.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );
      case "combobox":
        return (
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <Combobox
                id={common.id}
                value={field.value}
                onValueChange={field.onChange}
                options={f.options!}
                invalid={!!error}
                placeholder="Choose…"
                searchPlaceholder="Search…"
              />
            )}
          />
        );
      default:
        return (
          <>
            <Input
              {...common}
              type={f.kind === "tel" ? "tel" : "text"}
              inputMode={f.kind === "tel" ? "tel" : undefined}
              placeholder={f.placeholder}
              list={f.suggestions ? `dl-${f.name}` : undefined}
              {...register(f.name)}
            />
            {f.suggestions && (
              <datalist id={`dl-${f.name}`}>
                {f.suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            )}
          </>
        );
    }
  };

  const onSubmit = (v: Values) =>
    update.mutate(
      { section, values: v },
      {
        onSuccess: () => {
          toast.success(`${SECTION_LABELS[section]} updated`);
          onClose();
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <FormStack onSubmit={handleSubmit(onSubmit)} noValidate>
      {LOCKED_NOTE[section] && (
        <p
          style={{
            display: "flex",
            gap: 8,
            margin: 0,
            fontSize: "0.8125rem",
            opacity: 0.75,
          }}
        >
          <Lock size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          {LOCKED_NOTE[section]}
        </p>
      )}
      {fields
        .filter(
          (f) => !f.showWhen || values[f.showWhen.field] === f.showWhen.equals,
        )
        .map((f) => (
          <FormRow
            key={f.name}
            label={f.optional ? `${f.label} (optional)` : f.label}
            htmlFor={`f-${f.name}`}
            hint={f.hint}
            error={errors[f.name]?.message as string | undefined}
          >
            {render(f)}
          </FormRow>
        ))}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={update.isPending || !isDirty}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </FormStack>
  );
}

// Edit one section of the application. Only Admin / Super Admin ever get an
// Edit button; the fields are exactly those in the schemas — identity data
// isn't among them.
export function EditSectionDialog({
  candidate,
  section,
  onClose,
}: {
  candidate: Candidate;
  section: SectionId | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!section} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: section === "about" ? 640 : 520 }}>
        {section && (
          <>
            <DialogHeader>
              <DialogTitle>{SECTION_LABELS[section]}</DialogTitle>
              <DialogDescription>
                Changes are saved to {candidate.name}'s application and recorded
                in the activity trail.
              </DialogDescription>
            </DialogHeader>
            <SectionForm
              key={`${candidate.id}-${section}`}
              candidate={candidate}
              section={section}
              onClose={onClose}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
