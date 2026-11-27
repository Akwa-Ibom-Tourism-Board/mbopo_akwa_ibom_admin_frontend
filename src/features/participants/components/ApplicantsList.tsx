import { useEffect, useState } from "react";
import type { ApplicantFilterStatus } from "@/features/applicants/types";
import { useApplicants } from "@/features/applicants/api/hooks";
import { ApplicantTable } from "@/features/applicants/components/ApplicantTable";

// A real page size now that DataTable actually paginates server-side (see
// shared/components/DataTable.tsx) — not a "load everything up front" limit.
const PAGE_SIZE = 20;

export function ApplicantsList({ status }: { status?: ApplicantFilterStatus }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useApplicants({
    page,
    limit: PAGE_SIZE,
    status,
    search: search || undefined,
  });

  const totalPages = data?.meta.totalPages ?? 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <ApplicantTable
      applicants={data?.applicants}
      isLoading={isLoading}
      server={{
        page,
        totalPages,
        total: data?.meta.total ?? 0,
        limit: PAGE_SIZE,
        onPageChange: setPage,
        isFetching,
        onSearchChange: (term) => {
          // Already debounced by DataTable before this fires.
          setSearch(term);
          setPage(1); // a new search must go back to page 1
        },
      }}
    />
  );
}
