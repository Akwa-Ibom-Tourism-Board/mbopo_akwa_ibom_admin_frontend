import type { ReactNode } from "react";
import styled, { keyframes } from "styled-components";
import { Inbox } from "lucide-react";

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.5rem;
  font-weight: 700;
`;

const HeaderText = styled.p`
  margin: 6px 0 0;
  max-width: 40rem;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.9375rem;
`;

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <HeaderRow>
      <div>
        <HeaderTitle>{title}</HeaderTitle>
        {description && <HeaderText>{description}</HeaderText>}
      </div>
      {actions}
    </HeaderRow>
  );
}

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 48px 24px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.muted.foreground};
  text-align: center;
  font-size: 0.9375rem;
`;

const IconWrap = styled.div`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.alpha(theme.colors.primary.DEFAULT, 0.08)};
  color: ${({ theme }) => theme.colors.primary.DEFAULT};
  animation: ${float} 2.8s ease-in-out infinite;
`;

const EmptyTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.125rem;
`;

const EmptyMessage = styled.p`
  margin: 0;
  max-width: 32rem;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  line-height: 1.6;
`;

const EmptyAction = styled.div`
  margin-top: 10px;
`;

export interface EmptyStateProps {
  // Defaults to a plain inbox glyph — pass any lucide icon (or other SVG)
  // for something more specific to the context ("no results" vs "access
  // denied" vs "nothing uploaded yet").
  icon?: ReactNode;
  title?: string;
  message?: ReactNode;
  action?: ReactNode;
  // Escape hatch for anything that doesn't fit title/message/action — kept
  // for the handful of call sites that need fully custom content.
  children?: ReactNode;
}

/**
 * One empty/not-found/no-access treatment used everywhere a list, page or
 * panel has nothing to show. `title`/`message`/`action` cover the normal
 * case; `children` (used alone, with no title) is an escape hatch for
 * anything bespoke.
 */
export function EmptyState({ icon, title, message, action, children }: EmptyStateProps) {
  if (!title && !message && !action) {
    return <Empty>{children}</Empty>;
  }
  return (
    <Empty>
      <IconWrap>{icon ?? <Inbox size={26} />}</IconWrap>
      {title && <EmptyTitle>{title}</EmptyTitle>}
      {message && <EmptyMessage>{message}</EmptyMessage>}
      {children}
      {action && <EmptyAction>{action}</EmptyAction>}
    </Empty>
  );
}
