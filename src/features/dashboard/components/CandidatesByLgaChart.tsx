import { useMemo, useState } from "react";
import styled from "styled-components";
import { media } from "@/theme";
import { AKWA_IBOM_LGAS } from "@/lib/constants"; // adjust to wherever your constants file lives

const normalize = (s: string) => s.trim().toLowerCase();

const Wrapper = styled.div`
  margin-bottom: 28px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin-bottom: 16px;
`;

const Title = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9375rem;
  font-weight: 700;
`;

const Subtitle = styled.span`
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

const Rows = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row = styled.li`
  display: grid;
  grid-template-columns: 92px 1fr;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;

  ${media.sm} {
    grid-template-columns: 130px 1fr;
    gap: 12px;
    font-size: 0.8125rem;
  }
`;

const Name = styled.span<{ $empty: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  color: ${({ theme, $empty }) =>
    $empty ? theme.colors.muted.foreground : theme.colors.foreground};
`;

const Track = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 22px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  overflow: hidden;
`;

const Bar = styled.div<{ $pct: number }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  padding-right: 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary.DEFAULT};
  color: #fff;
  font-weight: 700;
  transition: width 0.4s ease;
`;

const OutsideValue = styled.span<{ $empty?: boolean }>`
  padding-left: ${({ $empty }) => ($empty ? "8px" : "0")};
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-weight: 600;
`;

const ToggleButton = styled.button`
  margin-top: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.secondary.DEFAULT};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export interface CandidatesByLgaChartProps {
  /** Any array of objects with an `lga` field — pass your candidates straight in. */
  candidates: readonly { lga?: string | null }[] | undefined;
  title?: string;
  /** "name" keeps the LGA list order, "count" puts the busiest LGAs first. */
  sort?: "name" | "count";
  /** Override if a dashboard should chart a different set of LGAs. */
  lgas?: readonly string[];
  /**
   * How many LGAs to show before "Show all". They are the top LGAs by
   * candidate count. Pass Infinity to always show every LGA.
   */
  collapsedCount?: number;
}

export function CandidatesByLgaChart({
  candidates,
  title = "Candidates by local government",
  sort = "name",
  lgas = AKWA_IBOM_LGAS,
  collapsedCount = 10,
}: CandidatesByLgaChartProps) {
  const [expanded, setExpanded] = useState(false);
  const { rows, max, total, covered } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of candidates ?? []) {
      if (!c.lga) continue;
      const key = normalize(c.lga);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    let list = lgas.map((name) => ({
      name,
      value: counts.get(normalize(name)) ?? 0,
    }));
    if (sort === "count") {
      list = [...list].sort(
        (a, b) => b.value - a.value || a.name.localeCompare(b.name),
      );
    }

    return {
      rows: list,
      max: Math.max(1, ...list.map((r) => r.value)),
      total: list.reduce((s, r) => s + r.value, 0),
      covered: list.filter((r) => r.value > 0).length,
    };
  }, [candidates, lgas, sort]);

  const canCollapse = rows.length > collapsedCount;
  const visible =
    expanded || !canCollapse
      ? rows
      : [...rows]
          .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
          .slice(0, collapsedCount);

  return (
    <Wrapper>
      <Header>
        <Title>{title}</Title>
        <Subtitle>
          {total} candidates · {covered} of {lgas.length} LGAs represented
        </Subtitle>
      </Header>
      <Rows>
        {visible.map(({ name, value }) => {
          const pct = (value / max) * 100;
          // Not enough room to fit the number inside a very short bar.
          const fitsInside = pct >= 8;
          return (
            <Row key={name}>
              <Name $empty={value === 0} title={name}>
                {name}
              </Name>
              <Track>
                {value > 0 && <Bar $pct={pct}>{fitsInside ? value : null}</Bar>}
                {value > 0 && !fitsInside && (
                  <OutsideValue>{value}</OutsideValue>
                )}
                {value === 0 && <OutsideValue $empty>0</OutsideValue>}
              </Track>
            </Row>
          );
        })}
      </Rows>
      {canCollapse && (
        <ToggleButton type="button" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show top LGAs only" : `Show all ${rows.length} LGAs`}
        </ToggleButton>
      )}
    </Wrapper>
  );
}
