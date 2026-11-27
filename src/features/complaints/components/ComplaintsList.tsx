import { useEffect, useState } from "react";
import { useComplaints } from "../api/hooks";
import { ComplaintList } from "./ComplaintList";

// A real page size now that DataTable actually paginates server-side — not
// a "load everything up front" limit.
const PAGE_SIZE = 20;

export function ComplaintsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");

  const { data, isLoading, isFetching } = useComplaints({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    source: source === "all" ? undefined : source,
  });

  const totalPages = data?.meta.totalPages ?? 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <ComplaintList
      complaints={data?.complaints}
      isLoading={isLoading}
      status={status}
      onStatusChange={(v) => {
        setStatus(v);
        setPage(1);
      }}
      source={source}
      onSourceChange={(v) => {
        setSource(v);
        setPage(1);
      }}
      server={{
        page,
        totalPages,
        total: data?.meta.total ?? 0,
        limit: PAGE_SIZE,
        onPageChange: setPage,
        isFetching,
        onSearchChange: (term) => {
          setSearch(term);
          setPage(1);
        },
      }}
    />
  );
}
