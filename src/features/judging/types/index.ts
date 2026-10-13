import type { Candidate, CandidateStage } from "@/features/candidates/types";

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

export interface Round {
  id: string;
  stage: CandidateStage;
  code: string; // "A", "B", … as lettered in the selection document
  name: string;
  durationSeconds?: number;
  // Candidates get a pause to think before answering (Round 2).
  thinkSeconds?: [number, number];
  prompt?: string;
  // Framing the document asks judges to keep in mind.
  guidance?: string;
  criteria: string[];
  // Present when the source didn't give a dedicated rubric for the round.
  criteriaNote?: string;
  questionBank?: { questions: string[]; expectedCount: number };
  // Picklist the candidate chooses from (Advocacy round).
  causes?: string[];
}

export interface StageConfig {
  id: CandidateStage;
  order: number;
  name: string;
  summary: string;
  // cumulative:  every contestant is scored in every round; the stage's
  //              aggregate decides who is selected (stages 1 and 2).
  // elimination: rounds run one after another and the judges cut the field
  //              at the end of each (the Grand Finale).
  mode: "cumulative" | "elimination";
  // How many candidates this stage is meant to advance, for the queue header.
  advanceTarget: { count: number; label: string };
  // Selection quota per LGA, where the document sets one.
  perLgaQuota?: number;
  rounds: Round[];
}

// A round the judges have closed: scores are locked. In an elimination stage
// closing also records the cut.
export interface RoundClosure {
  roundId: string;
  closedAt: string;
  // Present for elimination rounds: who went through the cut.
  passedIds?: string[];
}

export interface Judge {
  id: string;
  name: string;
}

export type ScoreStatus = "draft" | "submitted";

export interface Score {
  judgeId: string;
  candidateId: string;
  roundId: string;
  values: Record<string, number>; // criterion -> SCORE_MIN..SCORE_MAX
  status: ScoreStatus;
  question?: string;
  cause?: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  candidate: Candidate;
  // Stage score per judge (average of that judge's submitted round scores).
  perJudge: Record<string, { score: number; rounds: number } | null>;
  // Average across judges who have scored.
  average: number | null;
  // roundId -> judgeId -> round score
  perRound: Record<string, Record<string, number | null>>;
}

export const DISQUALIFICATION_REASONS = [
  "Providing false information",
  "Failing age/residency requirements",
  "Failing to submit required documentation",
  "Misrepresentation of qualifications",
  "Serious misconduct during the process",
  "Failing to comply with agreed competition rules",
] as const;
