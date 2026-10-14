import { useNavigate } from "react-router-dom";
import { Badge, DataTable, type DataTableColumn } from "@/shared/components";
import type { Candidate } from "../types";

const columns: DataTableColumn<Candidate>[] = [
  {
    id: "name",
    header: "Candidate",
    sortValue: (c) => c.name,
    cell: (c) => <strong>{c.name}</strong>,
  },
  {
    id: "profile",
    header: "Public profile",
    sortValue: (c) => (c.bio ? 1 : 0),
    cell: (c) => (
      <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
        <Badge $tone={c.bio ? "primary" : "secondary"}>
          {c.bio ? "Bio added" : "No bio yet"}
        </Badge>
        <Badge>{c.additionalPhotos?.length ?? 0} photos</Badge>
        <Badge>{c.additionalVideos?.length ?? 0} videos</Badge>
      </span>
    ),
  },
];

// Media's candidate list: a name and how complete the public profile is —
// nothing about stages, results, location or applications.
export function MediaCandidateTable({
  candidates,
  isLoading,
}: {
  candidates: Candidate[] | undefined;
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  return (
    <DataTable
      columns={columns}
      rows={candidates}
      getRowId={(c) => c.id}
      isLoading={isLoading}
      searchText={(c) => c.name}
      searchPlaceholder="Search by name"
      onRowClick={(c) => navigate(`/candidates/${c.id}`)}
      emptyMessage="No candidates match."
    />
  );
}
