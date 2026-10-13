import styled from "styled-components";
import { Badge } from "@/shared/components";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDateTime } from "@/lib/formatting";
import { ACTIVITY_CATEGORY_LABELS, type ActivityEntry } from "../types";

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: 0;
  }
`;

const Summary = styled.p`
  margin: 0;
  font-size: 0.9375rem;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <List>
      {entries.map((e) => (
        <Item key={e.id}>
          <Summary>{e.summary}</Summary>
          <Meta>
            <Badge $tone="secondary">
              {ACTIVITY_CATEGORY_LABELS[e.category]}
            </Badge>
            <span>
              {e.actorName}
              {e.actorRole ? ` (${ROLE_LABELS[e.actorRole]})` : ""}
            </span>
            <span>{formatDateTime(e.at)}</span>
          </Meta>
        </Item>
      ))}
    </List>
  );
}
