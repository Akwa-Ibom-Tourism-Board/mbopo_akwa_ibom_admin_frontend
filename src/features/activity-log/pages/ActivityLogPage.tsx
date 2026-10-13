import { useMemo, useState } from "react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { EmptyState, PageHeader } from "@/shared/components";
import { ActivityFeed } from "../components/ActivityFeed";
import { useActivity } from "../api/hooks";
import { ACTIVITY_CATEGORY_LABELS, type ActivityCategory } from "../types";

export function ActivityLogPage() {
  const { data, isLoading } = useActivity();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (e) =>
        (category === "all" || e.category === category) &&
        (!q || `${e.summary} ${e.actorName}`.toLowerCase().includes(q)),
    );
  }, [data, category, query]);

  return (
    <>
      <PageHeader
        title="Activity log"
        description="Who did what, and when. Judging entries show that a decision was made and by whom — never the scores behind it."
      />
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}
      >
        <Input
          aria-label="Search activity"
          placeholder="Search by action or person"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: "1 1 240px", maxWidth: 420 }}
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Category" style={{ minWidth: 200 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(Object.keys(ACTIVITY_CATEGORY_LABELS) as ActivityCategory[]).map(
              (c) => (
                <SelectItem key={c} value={c}>
                  {ACTIVITY_CATEGORY_LABELS[c]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <EmptyState>Loading…</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>No activity matches.</EmptyState>
      ) : (
        <ActivityFeed entries={rows} />
      )}
    </>
  );
}
