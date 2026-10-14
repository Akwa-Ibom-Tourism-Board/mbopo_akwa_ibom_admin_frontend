import styled from "styled-components";
import { Avatar, AvatarFallback } from "@/shared/ui";
import { Badge } from "@/shared/components";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { formatRelative } from "@/lib/formatting";
import type { ActivityEntry } from "../types";

export interface Person {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  isYou: boolean;
  last?: ActivityEntry;
  count: number;
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Row = styled.button<{ $on: boolean }>`
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 3px solid
    ${({ theme, $on }) => ($on ? theme.colors.secondary.DEFAULT : "transparent")};
  background: ${({ theme, $on }) =>
    $on ? theme.alpha(theme.colors.primary.DEFAULT, 0.06) : "transparent"};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
  }
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    font-size: 0.875rem;
  }

  p {
    margin: 4px 0 0;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.8125rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.75rem;
  }
`;

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Everyone the signed-in person may see, most recently active first, each with
// their latest action. Selecting one opens their timeline.
export function PeopleList({
  people,
  selectedId,
  onSelect,
}: {
  people: Person[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <List>
      {people.map((p) => (
        <li key={p.id}>
          <Row
            type="button"
            $on={p.id === selectedId}
            onClick={() => onSelect(p.id)}
          >
            <Avatar>
              <AvatarFallback>{initials(p.name)}</AvatarFallback>
            </Avatar>
            <Body>
              <strong>
                {p.name}
                {p.isYou && <Badge $tone="primary">You</Badge>}
                <Badge $tone="secondary">{ROLE_LABELS[p.role]}</Badge>
                {!p.active && <Badge $tone="neutral">Deactivated</Badge>}
              </strong>
              <p>{p.last ? p.last.summary : "No activity yet"}</p>
              {p.last && <small>{formatRelative(p.last.at)}</small>}
            </Body>
          </Row>
        </li>
      ))}
    </List>
  );
}
