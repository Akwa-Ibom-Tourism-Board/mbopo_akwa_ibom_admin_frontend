import { request } from "@/lib/http";
import type { Candidate } from "@/features/candidates/types";
import type { PhaseId } from "@/lib/phases";
import type { FinalizeStatus, Judge, LeaderboardEntry, Score, StageConfig } from "../types";

export async function getStages(): Promise<StageConfig[]> {
  return request<StageConfig[]>("/admin/judging/stages");
}

export async function getJudges(phase: PhaseId): Promise<Judge[]> {
  return request<Judge[]>(`/admin/judging/judges/${phase}`);
}

interface BackendScore {
  id: string;
  judgeId: string;
  applicationId: string;
  roundId: string;
  values: Record<string, number>;
  status: Score["status"];
  question?: string | null;
  cause?: string | null;
  createdAt: string;
  updatedAt: string;
}

const fromBackendScore = (s: BackendScore): Score => ({
  judgeId: s.judgeId,
  candidateId: s.applicationId,
  roundId: s.roundId,
  values: s.values,
  status: s.status,
  question: s.question ?? undefined,
  cause: s.cause ?? undefined,
  updatedAt: s.updatedAt,
});

// `judgeId` is accepted for the hook's own cache-key purposes only — the
// backend always scopes to the authenticated caller (see save-score.service.ts),
// so there's nothing to pass or check client-side any more.
export async function getMyScores(
  _judgeId: string,
  filter: { candidateId?: string; phase?: PhaseId } = {},
): Promise<Score[]> {
  const params = new URLSearchParams();
  if (filter.candidateId) params.set("applicationId", filter.candidateId);
  if (filter.phase) params.set("phase", filter.phase);
  const query = params.toString();
  const scores = await request<BackendScore[]>(`/admin/judging/my-scores${query ? `?${query}` : ""}`);
  return scores.map(fromBackendScore);
}

export async function saveScore(input: Omit<Score, "updatedAt">): Promise<Score> {
  const saved = await request<BackendScore>("/admin/judging/scores", {
    method: "POST",
    body: JSON.stringify({
      applicationId: input.candidateId,
      roundId: input.roundId,
      values: input.values,
      status: input.status,
      question: input.question,
      cause: input.cause,
    }),
  });
  return fromBackendScore(saved);
}

export async function disqualifyCandidates(ids: string[], reason: string): Promise<Candidate[]> {
  const result = await request<{ contestants: Candidate[] } | Candidate[]>(
    "/admin/judging/disqualify",
    { method: "POST", body: JSON.stringify({ applicationIds: ids, reason }) },
  );
  return Array.isArray(result) ? result : result.contestants;
}

interface BackendLeaderboardEntry {
  candidate: Candidate;
  perJudge: LeaderboardEntry["perJudge"];
  perRound: LeaderboardEntry["perRound"];
  total: number | null;
  average: number | null;
}

export async function getLeaderboard(phase: PhaseId): Promise<LeaderboardEntry[]> {
  return request<BackendLeaderboardEntry[]>(`/admin/judging/leaderboard/${phase}`);
}

export async function getResultsStandings(phase: PhaseId): Promise<LeaderboardEntry[]> {
  return request<BackendLeaderboardEntry[]>(`/admin/judging/results-standings/${phase}`);
}

export async function getFinalizeStatus(phase: PhaseId): Promise<FinalizeStatus> {
  return request<FinalizeStatus>(`/admin/judging/finalize-status/${phase}`);
}

export interface SubmitResultsResult {
  through: number;
  eliminated: number;
}

export async function submitResults(phase: PhaseId, passedIds: string[]): Promise<SubmitResultsResult> {
  return request<SubmitResultsResult>(`/admin/judging/results/${phase}`, {
    method: "POST",
    body: JSON.stringify({ passedIds }),
  });
}

export async function submitResultsAndClose(
  phase: PhaseId,
  passedIds: string[],
): Promise<SubmitResultsResult> {
  return request<SubmitResultsResult>(`/admin/judging/results/${phase}/and-close`, {
    method: "POST",
    body: JSON.stringify({ passedIds }),
  });
}

export async function closeStage(phase: PhaseId): Promise<void> {
  await request(`/admin/stages/${phase}/close`, { method: "POST" });
}

export async function reopenStage(phase: PhaseId): Promise<{ wiped: PhaseId[] }> {
  return request<{ wiped: PhaseId[] }>(`/admin/stages/${phase}/reopen`, { method: "POST" });
}
