import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import { parseYoutubeId } from "@/lib/youtube";
import type { NewsPost } from "../types";
import { useSaveNewsPost } from "../api/hooks";
import { FormRow, FormStack } from "@/shared/components/FormParts";
import { ImageUploadField } from "./ImageUploadField";
import { YoutubeLinkField } from "./YoutubeLinkField";

const schema = z.object({
  title: z.string().trim().min(3, "Enter a title"),
  summary: z.string().trim().min(10, "Write a short summary"),
  coverImage: z.string().min(1, "Add a cover image"),
  images: z.array(z.string()),
  videoUrls: z.array(
    z.object({
      url: z
        .string()
        .refine((v) => !!parseYoutubeId(v), "Enter a valid YouTube link"),
    }),
  ),
  body: z.string().trim().min(1, "Write the post body"),
});
type Values = z.infer<typeof schema>;

const toValues = (p?: NewsPost): Values => ({
  title: p?.title ?? "",
  summary: p?.summary ?? "",
  coverImage: p?.coverImage ?? "",
  images: p?.images ?? [],
  videoUrls: (p?.videoUrls ?? []).map((url) => ({ url })),
  body: p?.body.join("\n\n") ?? "",
});

// Create/edit dialog. Images upload directly (≤5MB); videos are pasted
// YouTube links, never file uploads.
export function NewsEditor({
  post,
  open,
  onOpenChange,
}: {
  post: NewsPost | null; // null = new post
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useSaveNewsPost();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(post ?? undefined),
  });
  const videos = useFieldArray({ control, name: "videoUrls" });

  useEffect(() => {
    if (open) reset(toValues(post ?? undefined));
  }, [open, post, reset]);

  const onSubmit = (v: Values) =>
    save.mutate(
      {
        id: post?.id,
        title: v.title,
        summary: v.summary,
        coverImage: v.coverImage,
        images: v.images,
        videoUrls: v.videoUrls.map((x) => x.url.trim()),
        body: v.body
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
        publishedAt: post?.publishedAt ?? new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success(post ? "Post updated" : "Post published");
          onOpenChange(false);
        },
        onError: () => toast.error("Couldn't save the post"),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: 640 }}>
        <DialogHeader>
          <DialogTitle>
            {post ? "Edit post" : "New picture news post"}
          </DialogTitle>
          <DialogDescription>
            Shown on the public voting site.
          </DialogDescription>
        </DialogHeader>
        <FormStack onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormRow
            label="Title"
            htmlFor="n-title"
            error={errors.title?.message}
          >
            <Input
              id="n-title"
              invalid={!!errors.title}
              {...register("title")}
            />
          </FormRow>
          <FormRow
            label="Summary"
            htmlFor="n-summary"
            error={errors.summary?.message}
          >
            <Textarea
              id="n-summary"
              rows={2}
              invalid={!!errors.summary}
              {...register("summary")}
            />
          </FormRow>
          <FormRow
            label="Cover image"
            error={errors.coverImage?.message}
            hint="Up to 5MB."
          >
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <ImageUploadField
                  multiple={false}
                  label="Choose cover"
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? "")}
                />
              )}
            />
          </FormRow>
          <FormRow label="More images">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploadField
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormRow>
          <FormRow
            label="Videos"
            hint="Upload to the Mbopo Akwa Ibom YouTube channel first, then paste the link."
          >
            {videos.fields.map((f, i) => (
              <div key={f.id}>
                <Controller
                  control={control}
                  name={`videoUrls.${i}.url`}
                  render={({ field }) => (
                    <YoutubeLinkField
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.videoUrls?.[i]?.url && (
                  <p
                    role="alert"
                    style={{ margin: "6px 0 0", fontSize: "0.8125rem" }}
                  >
                    {errors.videoUrls[i]?.url?.message}
                  </p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => videos.remove(i)}
                >
                  <Trash2 size={14} /> Remove video
                </Button>
              </div>
            ))}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videos.append({ url: "" })}
              >
                <Plus size={14} /> Add video link
              </Button>
            </div>
          </FormRow>
          <FormRow
            label="Body"
            htmlFor="n-body"
            hint="Separate paragraphs with a blank line."
            error={errors.body?.message}
          >
            <Textarea
              id="n-body"
              rows={8}
              invalid={!!errors.body}
              {...register("body")}
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
              {save.isPending ? "Saving…" : post ? "Save changes" : "Publish"}
            </Button>
          </DialogFooter>
        </FormStack>
      </DialogContent>
    </Dialog>
  );
}
