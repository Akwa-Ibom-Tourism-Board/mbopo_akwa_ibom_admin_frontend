import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Button, Checkbox, Input } from "@/shared/ui";
import {
  BulkActions,
  BulkBar,
  CheckCell,
  Footer,
  Pager,
  Scroll,
  SortButton,
  StateBox,
  Table,
  Td,
  Th,
  Toolbar,
  Tr,
  Wrap,
} from "./DataTable.styles";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  // Providing a sort value makes the column sortable.
  sortValue?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  isLoading?: boolean;
  // Text a row is matched against by the search box. Omit to hide search.
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  // Filter controls (Selects etc.) rendered next to the search box. Filtering
  // itself is the parent's job — pass the already-filtered rows.
  filters?: ReactNode;
  // Setting this turns on the checkbox column and bulk-action bar.
  bulkActions?: (selectedRows: T[], clear: () => void) => ReactNode;
  // Per-row action cell (e.g. a dropdown menu), rendered last.
  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  // Rows that can't be bulk-selected (e.g. already disqualified).
  isRowSelectable?: (row: T) => boolean;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  searchText,
  searchPlaceholder = "Search…",
  filters,
  bulkActions,
  rowActions,
  onRowClick,
  isRowSelectable,
  emptyMessage = "Nothing to show.",
  pageSize = 15,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    let out = rows ?? [];
    const q = query.trim().toLowerCase();
    if (q && searchText) {
      out = out.filter((r) => searchText(r).toLowerCase().includes(q));
    }
    const col = sort && columns.find((c) => c.id === sort.id);
    if (sort && col?.sortValue) {
      const get = col.sortValue;
      const factor = sort.dir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        return (
          factor *
          (typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv)))
        );
      });
    }
    return out;
  }, [rows, query, searchText, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize,
  );

  // Search/filter/sort changes can shrink the list; drop selections that are
  // no longer in the data so a bulk action never hits a hidden row.
  useEffect(() => {
    setPage(0);
  }, [query, rows]);
  useEffect(() => {
    if (!rows) return;
    const ids = new Set(rows.map(getRowId));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows, getRowId]);

  const selectable = (r: T) => (isRowSelectable ? isRowSelectable(r) : true);
  const selectableOnPage = pageRows.filter(selectable);
  const allOnPage =
    selectableOnPage.length > 0 &&
    selectableOnPage.every((r) => selected.has(getRowId(r)));
  const someOnPage = selectableOnPage.some((r) => selected.has(getRowId(r)));
  const selectedRows = (rows ?? []).filter((r) => selected.has(getRowId(r)));

  const toggleRow = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const toggleAllOnPage = (on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of selectableOnPage) {
        if (on) next.add(getRowId(r));
        else next.delete(getRowId(r));
      }
      return next;
    });

  const clear = () => setSelected(new Set());
  const colSpan = columns.length + (bulkActions ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <Wrap>
      {(searchText || filters) && (
        <Toolbar>
          {searchText ? (
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                aria-hidden
                style={{ position: "absolute", left: 12, top: 14 }}
              />
              <Input
                aria-label="Search"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          ) : (
            <span />
          )}
          {filters}
        </Toolbar>
      )}

      {bulkActions && selectedRows.length > 0 && (
        <BulkBar>
          <span>{selectedRows.length} selected</span>
          <BulkActions>{bulkActions(selectedRows, clear)}</BulkActions>
        </BulkBar>
      )}

      <Scroll>
        <Table>
          <thead>
            <tr>
              {bulkActions && (
                <Th style={{ width: 44, paddingRight: 0 }}>
                  <Checkbox
                    aria-label="Select all on this page"
                    checked={
                      allOnPage ? true : someOnPage ? "indeterminate" : false
                    }
                    onCheckedChange={(v) => toggleAllOnPage(v === true)}
                  />
                </Th>
              )}
              {columns.map((c) => {
                const active = sort?.id === c.id;
                const Icon = !active
                  ? ArrowUpDown
                  : sort.dir === "asc"
                    ? ArrowUp
                    : ArrowDown;
                return (
                  <Th
                    key={c.id}
                    aria-sort={
                      active
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    {c.sortValue ? (
                      <SortButton
                        type="button"
                        onClick={() =>
                          setSort(
                            !active
                              ? { id: c.id, dir: "asc" }
                              : sort.dir === "asc"
                                ? { id: c.id, dir: "desc" }
                                : null,
                          )
                        }
                      >
                        {c.header}
                        <Icon size={13} />
                      </SortButton>
                    ) : (
                      c.header
                    )}
                  </Th>
                );
              })}
              {rowActions && <Th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colSpan}>
                  <StateBox>Loading…</StateBox>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <StateBox>{emptyMessage}</StateBox>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = getRowId(row);
                return (
                  <Tr
                    key={id}
                    $selected={selected.has(id)}
                    $clickable={!!onRowClick}
                    onClick={() => onRowClick?.(row)}
                  >
                    {bulkActions && (
                      <CheckCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label="Select row"
                          disabled={!selectable(row)}
                          checked={selected.has(id)}
                          onCheckedChange={(v) => toggleRow(id, v === true)}
                        />
                      </CheckCell>
                    )}
                    {columns.map((c) => (
                      <Td key={c.id}>{c.cell(row)}</Td>
                    ))}
                    {rowActions && (
                      <Td
                        style={{ textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rowActions(row)}
                      </Td>
                    )}
                  </Tr>
                );
              })
            )}
          </tbody>
        </Table>
      </Scroll>

      <Footer>
        <span>
          {visible.length} {visible.length === 1 ? "result" : "results"}
        </span>
        {pageCount > 1 && (
          <Pager>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </Button>
            <span>
              Page {safePage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </Button>
          </Pager>
        )}
      </Footer>
    </Wrap>
  );
}
