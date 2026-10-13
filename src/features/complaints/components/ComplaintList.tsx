import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, DataTable, type DataTableColumn } from "@/shared/components";
import { useUsers } from "@/features/users";
import { formatRelative } from "@/lib/formatting";
import { SOURCE_LABELS, type Complaint } from "../types";
import { ComplaintStatusBadge, StatusFilter } from "./StatusFilter";

export function ComplaintList({
  complaints,
  isLoading,
}: {
  complaints: Complaint[] | undefined;
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  const users = useUsers();
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");

  const nameOf = (id?: string) => {
    const u = users.data?.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : "Unassigned";
  };

  const rows = useMemo(
    () =>
      complaints?.filter(
        (c) =>
          (status === "all" || c.status === status) &&
          (source === "all" || c.source === source),
      ),
    [complaints, status, source],
  );

  const columns: DataTableColumn<Complaint>[] = [
    {
      id: "subject",
      header: "Subject",
      sortValue: (c) => c.subject,
      cell: (c) => <strong>{c.subject}</strong>,
    },
    {
      id: "from",
      header: "From",
      sortValue: (c) => c.complainantName,
      cell: (c) => c.complainantName,
    },
    {
      id: "source",
      header: "Source",
      cell: (c) => <Badge>{SOURCE_LABELS[c.source]}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (c) => <ComplaintStatusBadge status={c.status} />,
    },
    {
      id: "assigned",
      header: "Assigned to",
      sortValue: (c) => nameOf(c.assignedToId),
      cell: (c) => nameOf(c.assignedToId),
    },
    {
      id: "updated",
      header: "Updated",
      sortValue: (c) => c.updatedAt,
      cell: (c) => formatRelative(c.updatedAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(c) => c.id}
      isLoading={isLoading}
      searchText={(c) =>
        `${c.subject} ${c.complainantName} ${c.complainantEmail}`
      }
      searchPlaceholder="Search complaints"
      onRowClick={(c) => navigate(`/complaints/${c.id}`)}
      emptyMessage="No complaints match."
      filters={
        <StatusFilter
          status={status}
          source={source}
          onStatus={setStatus}
          onSource={setSource}
        />
      }
    />
  );
}
