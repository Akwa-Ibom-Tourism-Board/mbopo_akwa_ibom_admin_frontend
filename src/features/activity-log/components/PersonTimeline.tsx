import { useMemo } from "react";
import styled from "styled-components";
import { isToday, isYesterday, parseISO, format } from "date-fns";
import {
  Gavel,
  LifeBuoy,
  LogIn,
  Newspaper,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatRelative } from "@/lib/formatting";
import type { ActivityCategory, ActivityEntry } from "../types";

const ICONS: Record<ActivityCategory, LucideIcon> = {
  users: UserCog,
  judging: Gavel,
  voting: Newspaper,
  candidates: Users,
  complaints: LifeBuoy,
  access: LogIn,
};

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
    margin: 0;
    font-size: 0.9375rem;
  }

  small {
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
  return isToday(d)
    ? "Today"
    : isYesterday(d)
      ? "Yesterday"
      : format(d, "EEEE, d MMM yyyy");
};

// One person's actions, newest first, grouped by day.
export function PersonTimeline({ entries }: { entries: ActivityEntry[] }) {
  const groups = useMemo(() => {
    const out: { label: string; items: ActivityEntry[] }[] = [];
    for (const e of entries) {
      const label = dayLabel(e.at);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [entries]);

  return (
    <div>
      {groups.map((g) => (
        <section key={g.label}>
          <Day>{g.label}</Day>
          <List>
            {g.items.map((e) => {
              const Icon = ICONS[e.category];
              return (
                <Item key={e.id}>
                  <Icon size={18} />
                  <div>
                    <p>{e.summary}</p>
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
    </div>
  );
}
