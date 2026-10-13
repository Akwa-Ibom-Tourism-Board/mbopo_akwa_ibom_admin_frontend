import { useMemo, useState, type ReactNode } from "react";
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
  type BadgeTone,
} from "@/shared/components";
import { AKWA_IBOM_LGAS, SENATORIAL_DISTRICTS } from "@/lib/constants";
import { OUTCOME_LABELS, type Outcome } from "../types";
import type { Participant } from "../utils/participants";

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
`;

const OUTCOME_TONE: Record<Outcome, BadgeTone> = {
  incoming: "secondary",
  competing: "primary",
  advanced: "primary",
  eliminated: "neutral",
  disqualified: "danger",
  winner: "success",
};

const ALL = "all";

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
    <div style={{ flex: "0 1 190px", minWidth: 150 }}>
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
    </div>
  );
}

// The candidate list shown on every stage page. Judges get extra columns,
// row actions and the bulk-disqualify bar through the optional props; every
// other role sees the plain list (no scores anywhere in this component).
export function StageCandidateTable({
  rows,
  extraColumns = [],
  rowActions,
  bulkActions,
  isRowSelectable,
}: {
  rows: Participant[];
  extraColumns?: DataTableColumn<Participant>[];
  rowActions?: (row: Participant) => ReactNode;
  bulkActions?: (selected: Participant[], clear: () => void) => ReactNode;
  isRowSelectable?: (row: Participant) => boolean;
}) {
  const navigate = useNavigate();
  const [lga, setLga] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [outcome, setOutcome] = useState(ALL);

  const filtered = useMemo(
    () =>
      rows.filter(
        ({ candidate: c, outcome: o }) =>
          (lga === ALL || c.lga === lga) &&
          (district === ALL || c.senatorialDistrict === district) &&
          (outcome === ALL || o === outcome),
      ),
    [rows, lga, district, outcome],
  );

  const columns: DataTableColumn<Participant>[] = [
    {
      id: "name",
      header: "Candidate",
      sortValue: (r) => r.candidate.name,
      cell: ({ candidate: c }) => (
        <NameCell>
          <Avatar>
            <AvatarImage src={c.photo} alt="" />
            <AvatarFallback>{c.name[0]}</AvatarFallback>
          </Avatar>
          {c.name}
        </NameCell>
      ),
    },
    {
      id: "lga",
      header: "LGA",
      sortValue: (r) => r.candidate.lga,
      cell: (r) => r.candidate.lga,
    },
    {
      id: "district",
      header: "District",
      sortValue: (r) => r.candidate.senatorialDistrict,
      cell: (r) => r.candidate.senatorialDistrict,
    },
    {
      id: "outcome",
      header: "Standing",
      sortValue: (r) => OUTCOME_LABELS[r.outcome],
      cell: (r) => (
        <Badge $tone={OUTCOME_TONE[r.outcome]}>
          {OUTCOME_LABELS[r.outcome]}
        </Badge>
      ),
    },
    ...extraColumns,
  ];

  return (
    <DataTable
      columns={columns}
      rows={filtered}
      getRowId={(r) => r.candidate.id}
      searchText={(r) => `${r.candidate.name} ${r.candidate.lga}`}
      searchPlaceholder="Search by name or LGA"
      onRowClick={(r) => navigate(`/candidates/${r.candidate.id}`)}
      emptyMessage="No candidates match these filters."
      rowActions={rowActions}
      bulkActions={bulkActions}
      isRowSelectable={isRowSelectable}
      filters={
        <>
          <Filter
            label="standings"
            value={outcome}
            onChange={setOutcome}
            options={Object.entries(OUTCOME_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Filter
            label="districts"
            value={district}
            onChange={setDistrict}
            options={SENATORIAL_DISTRICTS.map((d) => ({ value: d, label: d }))}
          />
          <Filter
            label="LGAs"
            value={lga}
            onChange={setLga}
            options={AKWA_IBOM_LGAS.map((l) => ({ value: l, label: l }))}
          />
        </>
      }
    />
  );
}
