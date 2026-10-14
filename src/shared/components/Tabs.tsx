import styled from "styled-components";

const Bar = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.card};
  width: fit-content;
  max-width: 100%;
`;

const TabButton = styled.button<{ $on: boolean }>`
  flex-shrink: 0;
  padding: 8px 18px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $on }) => ($on ? theme.colors.primary.DEFAULT : "transparent")};
  color: ${({ theme, $on }) =>
    $on ? theme.colors.primary.foreground : theme.colors.muted.foreground};
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
`;

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

// Pill-style tab strip (scrolls sideways on a phone rather than wrapping).
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <Bar role="tablist">
      {tabs.map((t) => (
        <TabButton
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          $on={t.id === value}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </TabButton>
      ))}
    </Bar>
  );
}
