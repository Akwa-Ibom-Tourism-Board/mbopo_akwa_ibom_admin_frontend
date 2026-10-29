import { useMemo } from "react";
import styled from "styled-components";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { History, Pencil } from "lucide-react";
import { Badge, EmptyState } from "@/shared/components";
import { LoadingState } from "@/shared/ui";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatRelative } from "@/lib/formatting";
import { useCandidateEvents } from "../api/hooks";
import type { CandidateEvent } from "../types";

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

const dayLabel = (iso: string) => {
  const d = parseISO(iso);
  return isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "EEEE, d MMM yyyy");
};

function Who({ e }: { e: CandidateEvent }) {
  if (!e.actorId) return <Badge $tone="neutral">System</Badge>;
  return (
    <Badge $tone="secondary">
      {e.actorName}
      {e.actorRole ? ` · ${ROLE_LABELS[e.actorRole]}` : ""}
    </Badge>
  );
}

// What staff did to this candidate's record. Admin / Super Admin only (the
// page gates the tab; the backend also refuses anyone else).
export function ActivityTab({ candidateId }: { candidateId: string }) {
  const { data, isLoading } = useCandidateEvents(candidateId, true);

  const groups = useMemo(() => {
    const out: { label: string; items: CandidateEvent[] }[] = [];
    for (const e of data ?? []) {
      const label = dayLabel(e.at);
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [data]);

  if (isLoading) return <LoadingState />;

  return groups.length === 0 ? (
    <EmptyState
      icon={<History size={26} />}
      title="Nothing recorded yet"
      message="Staff actions on this candidate will show up here."
    />
  ) : (
    <Panel>
      {groups.map((g) => (
        <section key={g.label}>
          <Day>{g.label}</Day>
          <List>
            {g.items.map((e) => (
              <Item key={e.id}>
                <Pencil size={18} />
                <div>
                  <p>{e.summary}</p>
                  <Who e={e} />
                  <small>
                    {format(parseISO(e.at), "h:mm a")} · {formatRelative(e.at)}
                  </small>
                </div>
              </Item>
            ))}
          </List>
        </section>
      ))}
    </Panel>
  );
}
