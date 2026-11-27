import { useAuth } from "@/features/auth";
import { useCandidates } from "@/features/candidates/api/hooks";
import { useMyPhaseScores } from "@/features/judging/api/hooks";
import { roundsOf } from "@/features/judging/data/mock-stages";
import { usePhaseStates } from "@/features/stages/api/hooks";
import { inField } from "@/features/stages/utils/participants";
import { phaseTitle } from "@/lib/phases";

// A judge's view of the live stage: how many candidates are in it and how far
// through their own scoring they are. Judge roles only (it loads scores).
export function useJudgeSummary() {
  const { user } = useAuth();
  const states = usePhaseStates().data;
  const live = states?.find((s) => s.status === "open")?.phaseId;
  // Bounded by a single phase's roster (never "all contestants ever"), so a
  // generous limit here is fine — this isn't the kind of unbounded list the
  // backend pagination work is about.
  const candidates = useCandidates(
    live ? { phase: live, limit: 500 } : { limit: 1 },
  ).data?.contestants;
  // useMyPhaseScores needs a phase; when none is open its result is ignored.
  const mine = useMyPhaseScores(user!.id, live ?? "lga").data;

  if (!states || !candidates) return { loading: true as const };
  if (!live) return { loading: false as const, live: undefined };

  const rounds = roundsOf(live);
  const field = candidates.filter((c) => inField(c, live));
  const submitted = new Map<string, number>();
  let drafts = 0;
  for (const s of mine ?? []) {
    if (s.status === "draft") drafts++;
    else submitted.set(s.candidateId, (submitted.get(s.candidateId) ?? 0) + 1);
  }
  const fullyScored = field.filter(
    (c) => (submitted.get(c.id) ?? 0) === rounds.length,
  ).length;
  return {
    loading: false as const,
    live,
    title: phaseTitle(live),
    inField: field.length,
    fullyScored,
    drafts,
  };
}
