import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import {
  Badge,
  DataTable,
  type DataTableColumn,
  type ServerPagination,
} from "@/shared/components";
import { PHASES, phaseTitle, type PhaseId } from "@/lib/phases";
import { AKWA_IBOM_LGAS, SENATORIAL_DISTRICTS } from "@/lib/constants";
import { STATUS_LABELS, type Candidate, type CandidateStatus } from "../types";
import { maritalFlag } from "../utils/derive";
import { PhaseBadge, StatusBadge } from "./Badges";

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
`;

const FilterSelect = styled.div`
  min-width: 150px;
`;

export const ALL = "all";

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <FilterSelect>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All {label}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterSelect>
  );
}

const columns: DataTableColumn<Candidate>[] = [
  {
    id: "name",
    header: "Candidate",
    cell: (c) => (
      <NameCell>
        <Avatar>
          <AvatarImage src={c.photo ?? undefined} alt="" />
          <AvatarFallback>{c.name[0]}</AvatarFallback>
        </Avatar>
        {c.name}
      </NameCell>
    ),
  },
  { id: "lga", header: "LGA", cell: (c) => c.lga },
  { id: "district", header: "District", cell: (c) => c.senatorialDistrict },
  { id: "phase", header: "Stage", cell: (c) => <PhaseBadge phase={c.phase} /> },
  {
    id: "marital",
    header: "Marital",
    cell: (c) => {
      const marital = maritalFlag(c.maritalStatus);
      if (!marital) return "—";
      return marital.eligible ? (
        marital.status
      ) : (
        <Badge $tone="danger">{marital.status}</Badge>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: (c) => <StatusBadge status={c.candidateStatus} />,
  },
  {
    id: "votes",
    header: "Votes",
    cell: (c) => c.voteCount.toLocaleString("en-NG"),
  },
];

// Filter/search/sort state all lives one level up now (see
// ContestantsList.tsx) and is sent to the backend — this component just
// renders whatever page it's handed. (Sorting is dropped entirely: with
// only one server page ever in memory, a "sort" button could only reorder
// that one page, which would look like sorting the whole list but silently
// wasn't — see DataTable.tsx's own note on this.)
export function CandidateTable({
  candidates,
  isLoading,
  server,
  phase,
  onPhaseChange,
  status,
  onStatusChange,
  district,
  onDistrictChange,
  lga,
  onLgaChange,
}: {
  candidates: Candidate[] | undefined;
  isLoading: boolean;
  server: ServerPagination;
  phase: PhaseId | typeof ALL;
  onPhaseChange: (v: PhaseId | typeof ALL) => void;
  status: CandidateStatus | typeof ALL;
  onStatusChange: (v: CandidateStatus | typeof ALL) => void;
  district: string;
  onDistrictChange: (v: string) => void;
  lga: string;
  onLgaChange: (v: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <DataTable
      columns={columns}
      rows={candidates}
      getRowId={(c) => c.id}
      isLoading={isLoading}
      server={server}
      searchPlaceholder="Search by name, email, LGA or phone"
      onRowClick={(c) => navigate(`/participants/${c.applicantId}`)}
      emptyMessage="No candidates match these filters."
      filters={
        <>
          <Filter
            label="stages"
            value={phase}
            onChange={(v) => onPhaseChange(v as PhaseId | typeof ALL)}
            options={PHASES.map((p) => ({
              value: p.id,
              label: phaseTitle(p.id),
            }))}
          />
          <Filter
            label="statuses"
            value={status}
            onChange={(v) => onStatusChange(v as CandidateStatus | typeof ALL)}
            options={(Object.keys(STATUS_LABELS) as CandidateStatus[]).map(
              (s) => ({
                value: s,
                label: STATUS_LABELS[s],
              }),
            )}
          />
          <Filter
            label="districts"
            value={district}
            onChange={onDistrictChange}
            options={Object.keys(SENATORIAL_DISTRICTS).map((d) => ({
              value: d,
              label: d,
            }))}
          />
          <Filter
            label="LGAs"
            value={lga}
            onChange={onLgaChange}
            options={AKWA_IBOM_LGAS.map((l) => ({ value: l, label: l }))}
          />
        </>
      }
    />
  );
}
