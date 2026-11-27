import { useNavigate } from "react-router-dom";
import {
  Badge,
  DataTable,
  type DataTableColumn,
  type ServerPagination,
} from "@/shared/components";
import { useUsers } from "@/features/users";
import { formatRelative } from "@/lib/formatting";
import { CHANNEL_LABELS, SOURCE_LABELS, type Complaint } from "../types";
import { ComplaintStatusBadge, StatusFilter } from "./StatusFilter";

export function ComplaintList({
  complaints,
  isLoading,
  server,
  status,
  onStatusChange,
  source,
  onSourceChange,
}: {
  complaints: Complaint[] | undefined;
  isLoading: boolean;
  server: ServerPagination;
  status: string;
  onStatusChange: (v: string) => void;
  source: string;
  onSourceChange: (v: string) => void;
}) {
  const navigate = useNavigate();
  const users = useUsers();

  const nameOf = (id?: string) => {
    const u = users.data?.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : "Unassigned";
  };

  const columns: DataTableColumn<Complaint>[] = [
    {
      id: "subject",
      header: "Subject",
      cell: (c) => <strong>{c.subject}</strong>,
    },
    {
      id: "from",
      header: "From",
      cell: (c) => c.complainantName,
    },
    {
      id: "source",
      header: "Source",
      cell: (c) => <Badge>{SOURCE_LABELS[c.source]}</Badge>,
    },
    {
      id: "channel",
      header: "Channel",
      cell: (c) => <Badge>{CHANNEL_LABELS[c.channel]}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (c) => <ComplaintStatusBadge status={c.status} />,
    },
    {
      id: "assigned",
      header: "Assigned to",
      cell: (c) => nameOf(c.assignedToId),
    },
    {
      id: "updated",
      header: "Updated",
      cell: (c) => formatRelative(c.updatedAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={complaints}
      getRowId={(c) => c.id}
      isLoading={isLoading}
      server={server}
      searchPlaceholder="Search messages"
      onRowClick={(c) => navigate(`/messages/${c.id}`)}
      emptyMessage="No messages match."
      filters={
        <StatusFilter
          status={status}
          source={source}
          onStatus={onStatusChange}
          onSource={onSourceChange}
        />
      }
    />
  );
}
