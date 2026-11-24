import { useEffect, useState } from "react";
import styled from "styled-components";
import type { ApplicantFilterStatus } from "@/features/applicants/types";
import { useApplicants } from "@/features/applicants/api/hooks";
import { ApplicantTable } from "@/features/applicants/components/ApplicantTable";
import { Pager } from "@/shared/components/Pager";

const PAGE_SIZE = 300;

const TableWrap = styled.div<{ $stale: boolean }>`
  opacity: ${({ $stale }) => ($stale ? 0.6 : 1)};
  transition: opacity 0.15s ease;
`;

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
          setSearch(term); // debounce inside DataTable, or wrap with a useDebounce here
          setPage(1); // a new search must go back to page 1
        },
      }}
    />
  );
}
