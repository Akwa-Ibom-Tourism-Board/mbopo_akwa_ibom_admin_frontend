import { useMemo, useState } from "react";
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
import { DataTable, type DataTableColumn } from "@/shared/components";
import { PHASES, phaseTitle } from "@/lib/phases";
import { AKWA_IBOM_LGAS, SENATORIAL_DISTRICTS } from "@/lib/constants";
import { STATUS_LABELS, type Candidate, type CandidateStatus } from "../types";
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
    sortValue: (c) => c.name,
    cell: (c) => (
      <NameCell>
        <Avatar>
          <AvatarImage src={c.photo} alt="" />
          <AvatarFallback>{c.name[0]}</AvatarFallback>
        </Avatar>
        {c.name}
      </NameCell>
    ),
  },
  { id: "lga", header: "LGA", sortValue: (c) => c.lga, cell: (c) => c.lga },
  {
    id: "district",
    header: "District",
    sortValue: (c) => c.senatorialDistrict,
    cell: (c) => c.senatorialDistrict,
  },
  { id: "phase", header: "Stage", cell: (c) => <PhaseBadge phase={c.phase} /> },
  {
    id: "status",
    header: "Status",
    cell: (c) => <StatusBadge status={c.status} />,
  },
  {
    id: "votes",
    header: "Votes",
    sortValue: (c) => c.voteCount ?? 0,
    cell: (c) => (c.voteCount ?? 0).toLocaleString("en-NG"),
  },
];

export function CandidateTable({
  candidates,
  isLoading,
}: {
  candidates: Candidate[] | undefined;
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  const [stage, setStage] = useState(ALL);
  const [lga, setLga] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const filtered = useMemo(
    () =>
      candidates?.filter(
        (c) =>
          (stage === ALL || c.phase === stage) &&
          (lga === ALL || c.lga === lga) &&
          (district === ALL || c.senatorialDistrict === district) &&
          (status === ALL || c.status === status),
      ),
    [candidates, stage, lga, district, status],
  );

  return (
    <DataTable
      columns={columns}
      rows={filtered}
      getRowId={(c) => c.id}
      isLoading={isLoading}
      searchText={(c) => `${c.name} ${c.lga} ${c.phone}`}
      searchPlaceholder="Search by name, LGA or phone"
      onRowClick={(c) => navigate(`/candidates/${c.id}`)}
      emptyMessage="No candidates match these filters."
      filters={
        <>
          <Filter
            label="stages"
            value={stage}
            onChange={setStage}
            options={PHASES.map((p) => ({
              value: p.id,
              label: phaseTitle(p.id),
            }))}
          />
          <Filter
            label="statuses"
            value={status}
            onChange={setStatus}
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
