import type { ReactNode } from "react";
import styled from "styled-components";

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

const Empty = styled.div`
  padding: 48px 24px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.muted.foreground};
  text-align: center;
  font-size: 0.9375rem;
`;

export function EmptyState({ children }: { children: ReactNode }) {
  return <Empty>{children}</Empty>;
}
