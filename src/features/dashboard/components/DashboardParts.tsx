import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import type { LucideIcon } from "lucide-react";
import { media } from "@/theme";

const Grid = styled.div<{ $min?: string }>`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${({ $min }) => $min ?? "200px"}, 1fr)
  );
  margin-bottom: 28px;
`;

const Tile = styled.div`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TileLabel = styled.p`
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
  font-weight: 600;
`;

const TileValue = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary.DEFAULT};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.75rem;
  font-weight: 700;
`;

const TileHint = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
`;

export function StatGrid({ children }: { children: ReactNode }) {
  return <Grid>{children}</Grid>;
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Tile>
      <TileLabel>{label}</TileLabel>
      <TileValue>{value}</TileValue>
      {hint && <TileHint>{hint}</TileHint>}
    </Tile>
  );
}

const SectionTitle = styled.h3`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 1rem;
  font-weight: 700;
`;

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

const LinkCard = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
  transition:
    box-shadow ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary.DEFAULT};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.secondary.DEFAULT};
  }
`;

const LinkTitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9375rem;
  font-weight: 700;
`;

const LinkText = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

export interface QuickLinkItem {
  to: string;
  title: string;
  text: string;
  icon: LucideIcon;
}

export function QuickLinks({ links }: { links: QuickLinkItem[] }) {
  return (
    <Grid $min="240px">
      {links.map(({ to, title, text, icon: Icon }) => (
        <LinkCard key={to} to={to}>
          <Icon size={22} />
          <div>
            <LinkTitle>{title}</LinkTitle>
            <LinkText>{text}</LinkText>
          </div>
        </LinkCard>
      ))}
    </Grid>
  );
}

const Panel = styled.div`
  margin-bottom: 28px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Note = styled(Panel)`
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  line-height: 1.6;
`;

export function InfoPanel({ children }: { children: ReactNode }) {
  return <Panel>{children}</Panel>;
}

export function NoteBox({ children }: { children: ReactNode }) {
  return <Note>{children}</Note>;
}

const Row = styled.li`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 16px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;

  &:last-child {
    border-bottom: 0;
  }

  ${media.sm} {
    flex-wrap: nowrap;
  }
`;

const RowWhen = styled.span`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export function ActivityList({
  items,
}: {
  items: readonly { id: string; text: string; when: string }[];
}) {
  return (
    <Panel>
      <List>
        {items.map((i) => (
          <Row key={i.id}>
            <span>{i.text}</span>
            <RowWhen>{i.when}</RowWhen>
          </Row>
        ))}
      </List>
    </Panel>
  );
}

const Greeting = styled.p`
  margin: -8px 0 24px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.9375rem;
`;

export function Greet({ children }: { children: ReactNode }) {
  return <Greeting>{children}</Greeting>;
}
