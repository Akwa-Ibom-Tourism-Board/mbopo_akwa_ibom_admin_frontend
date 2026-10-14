import { useMemo, useState } from "react";
import styled from "styled-components";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import {
  FileText,
  Gavel,
  Paperclip,
  Pencil,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Badge, EmptyState, Tabs, type TabItem } from "@/shared/components";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatRelative } from "@/lib/formatting";
import { useCandidateEvents } from "../api/hooks";
import type { CandidateEvent, CandidateEventKind } from "../types";

const ICONS: Record<CandidateEventKind, LucideIcon> = {
  account: UserRound,
  identity: ShieldCheck,
  application: FileText,
  document: Paperclip,
  judging: Gavel,
  staff: Pencil,
};

const Panel = styled.div`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Day = styled.h4`
  margin: 0;
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Item = styled.li`
  display: flex;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.secondary.DEFAULT};
  }

  p {
    margin: 0 0 6px;
    font-size: 0.9375rem;
  }

  small {
    margin-left: 8px;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.75rem;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

type Filter = "all" | "applicant" | "staff";
const FILTERS: TabItem<Filter>[] = [
  { id: "all", label: "Everything" },
  { id: "applicant", label: "By the applicant" },
  { id: "staff", label: "By staff & system" },
];

const dayLabel = (iso: string) => {
  const d = parseISO(iso);
  return isToday(d)
    ? "Today"
    : isYesterday(d)
      ? "Yesterday"
      : format(d, "EEEE, d MMM yyyy");
};

function Who({ e }: { e: CandidateEvent }) {
  if (e.actorType === "applicant")
    return <Badge $tone="primary">Applicant</Badge>;
  if (e.actorType === "system") return <Badge $tone="neutral">System</Badge>;
  return (
    <Badge $tone="secondary">
      {e.actorName}
      {e.actorRole ? ` · ${ROLE_LABELS[e.actorRole]}` : ""}
    </Badge>
  );
}

// One candidate's history: what they did on the applicant platform and what
// staff did to their record. Admin / Super Admin only (the page gates the tab;
// the data layer also refuses anyone else).
export function ActivityTab({ candidateId }: { candidateId: string }) {
  const { data, isLoading } = useCandidateEvents(candidateId, true);
  const [filter, setFilter] = useState<Filter>("all");

  const groups = useMemo(() => {
    const rows = (data ?? []).filter(
      (e) =>
        filter === "all" ||
        (filter === "applicant"
          ? e.actorType === "applicant"
          : e.actorType !== "applicant"),
    );
    const out: { label: string; items: CandidateEvent[] }[] = [];
    for (const e of rows) {
      const label = dayLabel(e.at);
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [data, filter]);

  if (isLoading) return <EmptyState>Loading…</EmptyState>;

  return (
    <>
      <Tabs tabs={FILTERS} value={filter} onChange={setFilter} />
      {groups.length === 0 ? (
        <EmptyState>Nothing recorded yet.</EmptyState>
      ) : (
        <Panel>
          {groups.map((g) => (
            <section key={g.label}>
              <Day>{g.label}</Day>
              <List>
                {g.items.map((e) => {
                  const Icon = ICONS[e.kind];
                  return (
                    <Item key={e.id}>
                      <Icon size={18} />
                      <div>
                        <p>{e.summary}</p>
                        <Who e={e} />
                        <small>
                          {format(parseISO(e.at), "h:mm a")} ·{" "}
                          {formatRelative(e.at)}
                        </small>
                      </div>
                    </Item>
                  );
                })}
              </List>
            </section>
          ))}
        </Panel>
      )}
    </>
  );
}
