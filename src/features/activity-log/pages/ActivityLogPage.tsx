import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { EmptyState, PageHeader } from "@/shared/components";
import { useAuth } from "@/features/auth";
import { useUsers } from "@/features/users";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/rbac";
import { media } from "@/theme";
import { ActivityFeed } from "../components/ActivityFeed";
import { PeopleList, type Person } from "../components/PeopleList";
import { PersonTimeline } from "../components/PersonTimeline";
import { useActivity } from "../api/hooks";
import { ACTIVITY_CATEGORY_LABELS, type ActivityCategory } from "../types";

const Tabs = styled.div`
  display: inline-flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.card};
`;

const Tab = styled.button<{ $on: boolean }>`
  padding: 8px 18px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $on }) => ($on ? theme.colors.primary.DEFAULT : "transparent")};
  color: ${({ theme, $on }) =>
    $on ? theme.colors.primary.foreground : theme.colors.muted.foreground};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  ${media.lg} {
    grid-template-columns: 380px minmax(0, 1fr);
  }
`;

const Panel = styled.div`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const PanelHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    flex: 1 1 100%;
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.125rem;
  }

  p {
    flex: 1 1 100%;
    margin: -6px 0 0;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.8125rem;
  }
`;

const ListScroll = styled.div`
  max-height: 560px;
  overflow-y: auto;
`;

// The event tracker: what each person has done lately, so a lost or odd action
// can be traced. Visible to Admin and Super Admin; what appears is decided in
// the data layer (the Super Admin's own trail is only ever visible to them).
export function ActivityLogPage() {
  const { user } = useAuth();
  const activity = useActivity();
  const users = useUsers();
  const [tab, setTab] = useState<"person" | "all">("person");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [category, setCategory] = useState("all");

  const entries = useMemo(() => activity.data ?? [], [activity.data]);

  const people = useMemo<Person[]>(() => {
    const list = (users.data ?? []).map((u) => {
      const mine = entries.filter((e) => e.actorId === u.id);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        active: u.active,
        isYou: u.id === user?.id,
        last: mine[0],
        count: mine.length,
      };
    });
    return list.sort((a, b) =>
      (b.last?.at ?? "").localeCompare(a.last?.at ?? ""),
    );
  }, [users.data, entries, user?.id]);

  const q = query.trim().toLowerCase();
  const shown = people.filter(
    (p) =>
      (roleFilter === "all" || p.role === roleFilter) &&
      (!q || `${p.name} ${ROLE_LABELS[p.role]}`.toLowerCase().includes(q)),
  );
  const current =
    people.find((p) => p.id === selected) ?? shown[0] ?? people[0] ?? null;
  const personEntries = entries.filter(
    (e) =>
      e.actorId === current?.id &&
      (category === "all" || e.category === category),
  );

  const allRows = entries.filter(
    (e) =>
      (category === "all" || e.category === category) &&
      (!q || `${e.summary} ${e.actorName}`.toLowerCase().includes(q)),
  );

  const categorySelect = (
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger
        aria-label="Category"
        style={{ width: "min(100%, 220px)" }}
      >
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
  );

  return (
    <>
      <PageHeader
        title="Event tracker"
        description="What each person has done lately — who changed what, and when. Judging entries show that a decision was made and by whom, never the scores behind it."
      />
      <Tabs role="tablist">
        <Tab
          role="tab"
          aria-selected={tab === "person"}
          $on={tab === "person"}
          onClick={() => setTab("person")}
        >
          By person
        </Tab>
        <Tab
          role="tab"
          aria-selected={tab === "all"}
          $on={tab === "all"}
          onClick={() => setTab("all")}
        >
          All activity
        </Tab>
      </Tabs>

      {activity.isLoading || users.isLoading ? (
        <EmptyState>Loading…</EmptyState>
      ) : tab === "person" ? (
        <Split>
          <Panel>
            <PanelHead>
              <h3>People</h3>
              <Input
                aria-label="Search people"
                placeholder="Search by name or role"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger aria-label="Role" style={{ width: "100%" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ALL_ROLES.filter(
                    (r) => r !== "super_admin" || user?.role === "super_admin",
                  ).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PanelHead>
            <ListScroll>
              {shown.length === 0 ? (
                <p style={{ padding: 20, margin: 0 }}>Nobody matches.</p>
              ) : (
                <PeopleList
                  people={shown}
                  selectedId={current?.id ?? null}
                  onSelect={setSelected}
                />
              )}
            </ListScroll>
          </Panel>

          <Panel>
            <PanelHead>
              <h3>
                {current
                  ? `${current.name}${current.isYou ? " (you)" : ""}`
                  : "Nobody selected"}
              </h3>
              {current && (
                <p>
                  {ROLE_LABELS[current.role]} · {current.count} recorded action
                  {current.count === 1 ? "" : "s"}
                </p>
              )}
              {categorySelect}
            </PanelHead>
            {personEntries.length === 0 ? (
              <p style={{ padding: 24, margin: 0 }}>
                {current
                  ? "No activity recorded yet."
                  : "Pick someone from the list."}
              </p>
            ) : (
              <PersonTimeline entries={personEntries} />
            )}
          </Panel>
        </Split>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Input
              aria-label="Search activity"
              placeholder="Search by action or person"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: "1 1 240px", maxWidth: 420 }}
            />
            {categorySelect}
          </div>
          {allRows.length === 0 ? (
            <EmptyState>No activity matches.</EmptyState>
          ) : (
            <ActivityFeed entries={allRows} />
          )}
        </>
      )}
    </>
  );
}
