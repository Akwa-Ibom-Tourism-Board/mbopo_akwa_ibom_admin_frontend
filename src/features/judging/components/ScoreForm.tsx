import { useMemo, useState } from "react";
import styled from "styled-components";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { Badge } from "@/shared/components";
import { SCORE_MAX, SCORE_MIN, type Round, type Score } from "../types";
import { formatScore, isComplete, roundScore } from "../utils/scoring";
import { useSaveScore } from "../api/hooks";

const Row = styled.div`
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const CriterionName = styled.p`
  margin: 0 0 8px;
  font-size: 0.9375rem;
  font-weight: 600;
`;

const Scale = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(10, 1fr);
  }
`;

const Pip = styled.button<{ $on: boolean }>`
  height: 40px;
  border: 1.5px solid
    ${({ theme, $on }) => ($on ? theme.colors.primary.DEFAULT : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $on }) => ($on ? theme.colors.primary.DEFAULT : theme.colors.card)};
  color: ${({ theme, $on }) => ($on ? theme.colors.primary.foreground : theme.colors.foreground)};
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Picker = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Total = styled.p`
  margin: 0 auto 0 0;
  font-size: 0.9375rem;
  font-weight: 700;
`;

const Question = styled.p`
  flex: 1 1 100%;
  margin: 0;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.1)};
  font-weight: 600;
`;

export interface ScoreFormProps {
  round: Round;
  judgeId: string;
  candidateId: string;
  existing?: Score;
  disabled?: boolean;
}

// One round's scoring form. The parent keys it by (candidate, round) so local
// state resets when either changes. Drafts allow partial entries and can be
// reopened and corrected; submitting needs every criterion filled in.
export function ScoreForm({
  round,
  judgeId,
  candidateId,
  existing,
  disabled,
}: ScoreFormProps) {
  const save = useSaveScore();
  const [values, setValues] = useState<Record<string, number>>(
    existing?.values ?? {},
  );
  const [question, setQuestion] = useState(existing?.question ?? "");
  const [cause, setCause] = useState(existing?.cause ?? "");

  const live = useMemo(
    () => roundScore(values, round.criteria),
    [values, round],
  );
  const complete = isComplete(values, round.criteria);
  const needsCause = !!round.causes;

  const persist = (status: Score["status"]) =>
    save.mutate(
      {
        judgeId,
        candidateId,
        roundId: round.id,
        values,
        status,
        question: question || undefined,
        cause: cause || undefined,
      },
      {
        onSuccess: () =>
          toast.success(status === "draft" ? "Draft saved" : "Score submitted"),
        onError: () => toast.error("Couldn't save the score"),
      },
    );

  const bank = round.questionBank;
  const drawQuestion = () => {
    if (!bank?.questions.length) return;
    setQuestion(
      bank.questions[Math.floor(Math.random() * bank.questions.length)]!,
    );
  };

  return (
    <div>
      {bank && (
        <Picker>
          <Question>{question || "No question drawn yet."}</Question>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={drawQuestion}
            disabled={disabled}
          >
            <Shuffle size={14} /> Draw a question
          </Button>
          <Select
            value={question}
            onValueChange={setQuestion}
            disabled={disabled}
          >
            <SelectTrigger
              aria-label="Choose a question"
              style={{ flex: "1 1 220px" }}
            >
              <SelectValue placeholder="…or choose one" />
            </SelectTrigger>
            <SelectContent>
              {bank.questions.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {bank.questions.length < bank.expectedCount && (
            <Badge $tone="secondary">
              Question bank incomplete: {bank.questions.length} of{" "}
              {bank.expectedCount} loaded
            </Badge>
          )}
        </Picker>
      )}

      {needsCause && (
        <Picker>
          <Select value={cause} onValueChange={setCause} disabled={disabled}>
            <SelectTrigger
              aria-label="Candidate's chosen cause"
              style={{ maxWidth: 360 }}
            >
              <SelectValue placeholder="Cause the candidate chose" />
            </SelectTrigger>
            <SelectContent>
              {round.causes!.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Picker>
      )}

      {round.criteria.map((crit) => (
        <Row key={crit}>
          <CriterionName>{crit}</CriterionName>
          <Scale role="radiogroup" aria-label={`${crit} score`}>
            {Array.from(
              { length: SCORE_MAX - SCORE_MIN + 1 },
              (_, i) => SCORE_MIN + i,
            ).map((n) => (
              <Pip
                key={n}
                type="button"
                role="radio"
                aria-checked={values[crit] === n}
                $on={values[crit] === n}
                disabled={disabled}
                onClick={() => setValues((v) => ({ ...v, [crit]: n }))}
              >
                {n}
              </Pip>
            ))}
          </Scale>
        </Row>
      ))}

      <Footer>
        <Total>
          Round score: {formatScore(live)} / {SCORE_MAX}
        </Total>
        {existing && (
          <Badge
            $tone={existing.status === "submitted" ? "primary" : "secondary"}
          >
            {existing.status === "submitted" ? "Submitted" : "Draft"}
          </Badge>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={
            disabled || save.isPending || Object.keys(values).length === 0
          }
          onClick={() => persist("draft")}
        >
          Save draft
        </Button>
        <Button
          type="button"
          disabled={disabled || save.isPending || !complete}
          onClick={() => persist("submitted")}
        >
          {existing?.status === "submitted" ? "Update score" : "Submit score"}
        </Button>
      </Footer>
    </div>
  );
}
