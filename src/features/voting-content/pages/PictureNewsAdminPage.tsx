import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import {
  ConfirmDialog,
  DataTable,
  PageHeader,
  type DataTableColumn,
} from "@/shared/components";
import { formatDate } from "@/lib/formatting";
import { NewsEditor } from "../components/NewsEditor";
import { useDeleteNewsPost, useNewsPosts } from "../api/hooks";
import type { NewsPost } from "../types";

const columns: DataTableColumn<NewsPost>[] = [
  {
    id: "title",
    header: "Post",
    sortValue: (p) => p.title,
    cell: (p) => (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          fontWeight: 600,
        }}
      >
        <img
          src={p.coverImage}
          alt=""
          width={56}
          height={40}
          style={{ borderRadius: 6, objectFit: "cover" }}
        />
        {p.title}
      </span>
    ),
  },
  {
    id: "published",
    header: "Published",
    sortValue: (p) => p.publishedAt,
    cell: (p) => formatDate(p.publishedAt),
  },
  {
    id: "media",
    header: "Media",
    cell: (p) =>
      `${(p.images?.length ?? 0) + 1} images · ${p.videoUrls?.length ?? 0} videos`,
  },
];

export function PictureNewsAdminPage() {
  const { data, isLoading } = useNewsPosts();
  const remove = useDeleteNewsPost();
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleting, setDeleting] = useState<NewsPost | null>(null);

  return (
    <>
      <PageHeader
        title="Picture news"
        description="Posts shown on the public voting site. Anyone with access can edit or delete any post."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            <Plus size={16} /> New post
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data}
        getRowId={(p) => p.id}
        isLoading={isLoading}
        searchText={(p) => p.title}
        searchPlaceholder="Search posts"
        emptyMessage="No posts yet."
        rowActions={(p) => (
          <span style={{ display: "inline-flex", gap: 4 }}>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Edit ${p.title}`}
              onClick={() => {
                setEditing(p);
                setEditorOpen(true);
              }}
            >
              <Pencil size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Delete ${p.title}`}
              onClick={() => setDeleting(p)}
            >
              <Trash2 size={16} />
            </Button>
          </span>
        )}
      />
      <NewsEditor
        post={editing}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this post?"
        description={
          deleting
            ? `“${deleting.title}” will be removed from the voting site.`
            : undefined
        }
        destructive
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Post deleted");
              setDeleting(null);
            },
          })
        }
      />
    </>
  );
}
