import styled from "styled-components";

export const Wrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
  overflow: hidden;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  > :first-child {
    flex: 1 1 220px;
    min-width: 0;
  }
`;

export const BulkBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.alpha(theme.colors.primary.DEFAULT, 0.08)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 600;
`;

export const BulkActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
`;

// Horizontal scroll on small screens rather than squashing columns.
export const Scroll = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

export const Th = styled.th<{ $sortable?: boolean }>`
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

export const Tr = styled.tr<{ $selected?: boolean; $clickable?: boolean }>`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $selected }) =>
    $selected
      ? theme.alpha(theme.colors.primary.DEFAULT, 0.06)
      : "transparent"};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  &:hover {
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
  }
`;

export const Td = styled.td`
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.foreground};
  vertical-align: middle;
`;

export const CheckCell = styled.td`
  width: 44px;
  padding: 12px 0 12px 16px;
`;

export const StateBox = styled.div`
  padding: 40px 16px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  text-align: center;
  font-size: 0.9375rem;
`;

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

export const Pager = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
