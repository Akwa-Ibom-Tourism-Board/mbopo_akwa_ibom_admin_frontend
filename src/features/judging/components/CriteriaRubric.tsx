import styled from "styled-components";
import { Info } from "lucide-react";
import type { Round } from "../types";
import { CountdownTimer } from "./CountdownTimer";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const Prompt = styled.blockquote`
  margin: 0;
  padding: 12px 16px;
  border-left: 4px solid ${({ theme }) => theme.colors.secondary.DEFAULT};
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9375rem;
`;

const Guidance = styled.p`
  display: flex;
  gap: 8px;
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
  font-weight: 600;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.secondary.DEFAULT};
  }
`;

const Note = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

const Timers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

// What the judge needs to know about the round before scoring it: the prompt,
// the document's guidance (e.g. the elimination principle), timers and any
// caveat about where the criteria came from.
export function CriteriaRubric({ round }: { round: Round }) {
  return (
    <Wrap>
      {round.prompt && <Prompt>{round.prompt}</Prompt>}
      {round.guidance && (
        <Guidance>
          <Info size={16} />
          {round.guidance}
        </Guidance>
      )}
      {(round.durationSeconds || round.thinkSeconds) && (
        <Timers>
          {round.thinkSeconds && (
            <CountdownTimer
              seconds={round.thinkSeconds[1]}
              label={`Think time (${round.thinkSeconds[0]}–${round.thinkSeconds[1]}s)`}
            />
          )}
          {round.durationSeconds && (
            <CountdownTimer
              seconds={round.durationSeconds}
              label={round.thinkSeconds ? "Answer" : "Time"}
            />
          )}
        </Timers>
      )}
      {round.criteriaNote && <Note>{round.criteriaNote}</Note>}
    </Wrap>
  );
}
