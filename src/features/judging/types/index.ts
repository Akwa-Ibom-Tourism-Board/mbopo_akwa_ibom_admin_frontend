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
  // How many candidates this stage is meant to take through, for the header.
  advanceTarget: { count: number; label: string };
  rounds: Round[];
}

export interface Judge {
  id: string;
  name: string;
  // The Head Judge also scores; they additionally finalize the stage.
  head?: boolean;
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
  // Sum of the judges' stage scores — the figure the Head Judge finalizes on.
  total: number | null;
  // Average across judges who have scored.
  average: number | null;
  // roundId -> judgeId -> round score
  perRound: Record<string, Record<string, number | null>>;
}

// Where a stage stands before the Head Judge can finalize it: who has still to
// finish scoring. Judges-only data (it reveals scoring progress, not scores).
export interface FinalizeStatus {
  phaseId: string;
  stageStatus: "pending" | "open" | "closed";
  fieldCount: number;
  judges: { id: string; name: string; head?: boolean; outstanding: number }[];
  ready: boolean;
}

export const DISQUALIFICATION_REASONS = [
  "Providing false information",
  "Failing age/residency requirements",
  "Failing to submit required documentation",
  "Misrepresentation of qualifications",
  "Serious misconduct during the process",
  "Failing to comply with agreed competition rules",
] as const;
