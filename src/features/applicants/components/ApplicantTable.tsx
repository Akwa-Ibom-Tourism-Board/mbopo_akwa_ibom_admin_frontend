import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Avatar, AvatarFallback } from "@/shared/ui";
import {
  Badge,
  DataTable,
  EmailLink,
  PhoneLink,
  type DataTableColumn,
} from "@/shared/components";
import { formatDate } from "@/lib/formatting";
import type { Applicant } from "../types";

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
`;

const statusTone = (a: Applicant) =>
  a.progress.applicationStatus === "submitted"
    ? "primary"
    : a.progress.applicationStarted
      ? "secondary"
      : "neutral";

const statusLabel = (a: Applicant) =>
  a.progress.applicationStatus === "submitted"
    ? "Submitted"
    : a.progress.applicationStarted
      ? (a.progress.currentStepLabel ?? "In progress")
      : "Not started";

const columns: DataTableColumn<Applicant>[] = [
  {
    id: "name",
    header: "Applicant",
    sortValue: (a) => `${a.firstName ?? ""} ${a.lastName ?? ""}`,
    cell: (a) => (
      <NameCell>
        <Avatar>
          <AvatarFallback>
            {(a.firstName ?? a.email)[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {a.firstName || a.lastName
          ? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim()
          : "—"}
      </NameCell>
    ),
  },
  {
    id: "email",
    header: "Email",
    sortValue: (a) => a.email,
    cell: (a) => <EmailLink value={a.email} />,
  },
  {
    id: "phone",
    header: "Phone",
    sortValue: (a) => a.phoneNumber ?? "",
    cell: (a) => <PhoneLink value={a.phoneNumber} />,
  },
  {
    id: "progress",
    header: "Progress",
    sortValue: (a) => a.progress.completedSteps,
    cell: (a) => (
      <Badge $tone={statusTone(a)}>
        {statusLabel(a)}
        {a.progress.applicationStatus !== "submitted" &&
          a.progress.applicationStarted &&
          ` (${a.progress.completedSteps}/${a.progress.totalSteps})`}
      </Badge>
    ),
  },
  {
    id: "active",
    header: "Account",
    cell: (a) => (
      <Badge $tone={a.active ? "primary" : "danger"}>
        {a.active ? "Active" : "Disabled"}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    header: "Registered",
    sortValue: (a) => a.createdAt,
    cell: (a) => formatDate(a.createdAt),
  },
];

export function ApplicantTable({
  applicants,
  isLoading,
}: {
  applicants: Applicant[] | undefined;
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  return (
    <DataTable
      columns={columns}
      rows={applicants}
      getRowId={(a) => a.id}
      isLoading={isLoading}
      searchText={(a) =>
        `${a.firstName} ${a.lastName} ${a.email} ${a.phoneNumber}`
      }
      searchPlaceholder="Search by name, email or phone"
      onRowClick={(a) => navigate(`/applicants/${a.id}`)}
      emptyMessage="No applicants yet."
    />
  );
}
