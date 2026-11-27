import { useEffect, useState } from "react";
import { useCan } from "@/lib/rbac";
import type { PhaseId } from "@/lib/phases";
import { useCandidates } from "@/features/candidates/api/hooks";
import { CandidateTable, ALL } from "./CandidateTable";
import { MediaCandidateTable } from "./MediaCandidateTable";
import type { CandidateStatus } from "../types";

// A real page size now that DataTable actually paginates server-side (see
// shared/components/DataTable.tsx) — not a "load everything up front" limit.
const PAGE_SIZE = 20;

export function ContestantsList() {
  const can = useCan();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<PhaseId | typeof ALL>(ALL);
  const [status, setStatus] = useState<CandidateStatus | typeof ALL>(ALL);
  const [district, setDistrict] = useState<string>(ALL);
  const [lga, setLga] = useState<string>(ALL);

  const { data, isLoading, isFetching } = useCandidates({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    phase: phase === ALL ? undefined : phase,
    candidateStatus: status === ALL ? undefined : status,
    district: district === ALL ? undefined : district,
    lga: lga === ALL ? undefined : lga,
  });

  const totalPages = data?.meta.totalPages ?? 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const server = {
    page,
    totalPages,
    total: data?.meta.total ?? 0,
    limit: PAGE_SIZE,
    onPageChange: setPage,
    isFetching,
    onSearchChange: (term: string) => {
      setSearch(term);
      setPage(1); // a new search must go back to page 1
    },
  };

  if (!can("candidates.viewDetails")) {
    return (
      <MediaCandidateTable
        candidates={data?.contestants}
        isLoading={isLoading}
        server={server}
      />
    );
  }

  return (
    <CandidateTable
      candidates={data?.contestants}
      isLoading={isLoading}
      server={server}
      phase={phase}
      onPhaseChange={(v) => {
        setPhase(v);
        setPage(1);
      }}
      status={status}
      onStatusChange={(v) => {
        setStatus(v);
        setPage(1);
      }}
      district={district}
      onDistrictChange={(v) => {
        // Mutually exclusive on the backend (LGA wins if both are set) —
        // clear the other so the two dropdowns never silently disagree.
        setDistrict(v);
        setLga(ALL);
        setPage(1);
      }}
      lga={lga}
      onLgaChange={(v) => {
        setLga(v);
        setDistrict(ALL);
        setPage(1);
      }}
    />
  );
}
