import { useMemo, useState } from "react";
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
import { AKWA_IBOM_LGAS, SENATORIAL_DISTRICTS } from "@/lib/constants";
import { StatusBadge } from "@/features/candidates/components/Badges";
import type { Judge, LeaderboardEntry } from "../types";
import { formatScore } from "../utils/scoring";

const ALL = "all";

export function LeaderboardTable({
  entries,
  judges,
  isLoading,
  onSelect,
}: {
  entries: LeaderboardEntry[] | undefined;
  judges: Judge[];
  isLoading: boolean;
  onSelect: (entry: LeaderboardEntry) => void;
}) {
  const [lga, setLga] = useState(ALL);
  const [district, setDistrict] = useState(ALL);

  // Rank is computed over everyone scored, before filtering, so filtering by
  // LGA/district doesn't renumber a candidate's position.
  const ranks = useMemo(() => {
    const sorted = [...(entries ?? [])]
      .filter((e) => e.total != null)
      .sort((a, b) => b.total! - a.total!);
    return new Map(sorted.map((e, i) => [e.candidate.id, i + 1]));
  }, [entries]);

  const rows = useMemo(
    () =>
      entries?.filter(
        (e) =>
          (lga === ALL || e.candidate.lga === lga) &&
          (district === ALL || e.candidate.senatorialDistrict === district),
      ),
    [entries, lga, district],
  );

  const columns: DataTableColumn<LeaderboardEntry>[] = [
    {
      id: "rank",
      header: "#",
      sortValue: (e) => ranks.get(e.candidate.id) ?? 9999,
      cell: (e) => ranks.get(e.candidate.id) ?? "—",
    },
    {
      id: "name",
      header: "Candidate",
      sortValue: (e) => e.candidate.name,
      cell: (e) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 600,
          }}
        >
          <Avatar>
            <AvatarImage src={e.candidate.photo} alt="" />
            <AvatarFallback>{e.candidate.name[0]}</AvatarFallback>
          </Avatar>
          {e.candidate.name}
        </span>
      ),
    },
    {
      id: "lga",
      header: "LGA",
      sortValue: (e) => e.candidate.lga,
      cell: (e) => e.candidate.lga,
    },
    {
      id: "status",
      header: "Status",
      cell: (e) => <StatusBadge status={e.candidate.status} />,
    },
    ...judges.map<DataTableColumn<LeaderboardEntry>>((j) => ({
      id: `judge-${j.id}`,
      header: `${j.name}${j.active === false ? " (deactivated)" : ""}`,
      sortValue: (e) => e.perJudge[j.id]?.score ?? -1,
      cell: (e) => formatScore(e.perJudge[j.id]?.score),
    })),
    {
      id: "total",
      header: "Total",
      sortValue: (e) => e.total ?? -1,
      cell: (e) => <strong>{formatScore(e.total)}</strong>,
    },
    {
      id: "avg",
      header: "Average",
      sortValue: (e) => e.average ?? -1,
      cell: (e) => formatScore(e.average),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(e) => e.candidate.id}
      isLoading={isLoading}
      searchText={(e) => `${e.candidate.name} ${e.candidate.lga}`}
      searchPlaceholder="Search candidates"
      onRowClick={onSelect}
      emptyMessage="No scores for this stage yet."
      pageSize={20}
      filters={
        <>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger aria-label="District" style={{ minWidth: 170 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All districts</SelectItem>
              {SENATORIAL_DISTRICTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lga} onValueChange={setLga}>
            <SelectTrigger aria-label="LGA" style={{ minWidth: 150 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All LGAs</SelectItem>
              {AKWA_IBOM_LGAS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
