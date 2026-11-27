import styled from "styled-components";

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.foreground};
`;

const Range = styled.span`
  color: ${({ theme }) => theme.colors.muted.foreground};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted.foreground};
  white-space: nowrap;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  font: inherit;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary.DEFAULT};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.DEFAULT};
    border-color: ${({ theme }) => theme.colors.primary.DEFAULT};
    color: ${({ theme }) => theme.colors.primary.foreground};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.muted.foreground};
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

interface PagerProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
  isFetching?: boolean;
}

export function Pager({
  page,
  totalPages,
  total,
  limit,
  onChange,
  isFetching,
}: PagerProps) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Bar>
      <Range>
        Showing {from}–{to} of {total}
        {isFetching && " · updating…"}
      </Range>
      <Controls>
        <PageButton disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </PageButton>
        <PageLabel>
          Page {page} of {totalPages}
        </PageLabel>
        <PageButton
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </PageButton>
      </Controls>
    </Bar>
  );
}
