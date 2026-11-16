import styled from "styled-components";

export interface ParticipantCounts {
  participants: number;
  candidates: number;
  applicants: number;
  notStarted: number;
}

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

const Total = styled.span`
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

const Track = styled.div`
  display: flex;
  height: 30px;
  overflow: hidden;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
`;

type Tone = "candidates" | "applicants" | "notStarted";

const toneColor =
  (tone: Tone) =>
  ({
    theme,
  }: {
    theme: {
      colors: {
        primary: { DEFAULT: string };
        secondary: { DEFAULT: string };
        muted: { foreground: string };
      };
    };
  }) =>
    tone === "candidates"
      ? theme.colors.primary.DEFAULT
      : tone === "applicants"
        ? theme.colors.secondary.DEFAULT
        : theme.colors.muted.foreground;

const Segment = styled.div<{ $pct: number; $tone: Tone }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 ${({ $pct }) => $pct}%;
  background: ${(p) => toneColor(p.$tone)(p)};
  opacity: ${({ $tone }) => ($tone === "notStarted" ? 0.45 : 1)};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  transition: flex-basis 0.4s ease;
`;

const Legend = styled.ul`
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
`;

const LegendRow = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const Dot = styled.span<{ $tone: Tone }>`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => toneColor(p.$tone)(p)};
  opacity: ${({ $tone }) => ($tone === "notStarted" ? 0.45 : 1)};
`;

const LegendText = styled.div`
  flex: 1;
  min-width: 0;
`;

const LegendLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 600;
`;

const LegendHint = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
`;

const LegendValue = styled.p`
  margin: 0;
  flex-shrink: 0;
  text-align: right;
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 700;

  span {
    margin-left: 6px;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.75rem;
    font-weight: 500;
  }
`;

const Empty = styled.p`
  margin: 16px 0 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
`;

const SEGMENTS: { key: Tone; label: string; hint: string }[] = [
  {
    key: "candidates",
    label: "Candidates",
    hint: "Finished the Mbopo registration",
  },
  {
    key: "applicants",
    label: "Applicants",
    hint: "Started the registration, not yet submitted",
  },
  {
    key: "notStarted",
    label: "Not started",
    hint: "Signed up but haven't begun registration",
  },
];

export interface ParticipantsBreakdownChartProps {
  counts: ParticipantCounts | undefined;
  title?: string;
}

export function ParticipantsBreakdownChart({
  counts,
  title = "Participants breakdown",
}: ParticipantsBreakdownChartProps) {
  const total = counts?.participants ?? 0;
  const pctOf = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <Wrapper>
      <Header>
        <Title>{title}</Title>
        <Total>
          {counts
            ? `${counts.participants.toLocaleString()} participants`
            : "—"}
        </Total>
      </Header>

      <Track role="img" aria-label={title}>
        {counts &&
          SEGMENTS.map(({ key }) => {
            const value = counts[key];
            if (value === 0) return null;
            const pct = pctOf(value);
            return (
              <Segment key={key} $pct={pct} $tone={key}>
                {pct >= 8 ? value.toLocaleString() : null}
              </Segment>
            );
          })}
      </Track>

      {counts && total === 0 && <Empty>No participants yet.</Empty>}

      <Legend>
        {SEGMENTS.map(({ key, label, hint }) => {
          const value = counts?.[key];
          return (
            <LegendRow key={key}>
              <Dot $tone={key} />
              <LegendText>
                <LegendLabel>{label}</LegendLabel>
                <LegendHint>{hint}</LegendHint>
              </LegendText>
              <LegendValue>
                {value == null ? "—" : value.toLocaleString()}
                {value != null && <span>{Math.round(pctOf(value))}%</span>}
              </LegendValue>
            </LegendRow>
          );
        })}
      </Legend>
    </Wrapper>
  );
}
