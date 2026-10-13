import { Gavel, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { useAuth } from "@/features/auth";
import { useCandidates } from "@/features/candidates/api/hooks";
import { useMyStageScores } from "@/features/judging/api/hooks";
import { STAGES } from "@/features/judging/data/mock-stages";
import { count } from "../hooks";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function HeadJudgeDashboard() {
  const { user } = useAuth();
  const candidates = useCandidates().data;

  // The live stage is the earliest one that still has candidates competing.
  const live =
    STAGES.find((s) =>
      candidates?.some((c) => c.stage === s.id && c.status === "active"),
    ) ?? STAGES[0]!;
  const mine = useMyStageScores(user!.id, live.id).data;

  const inQueue = candidates?.filter(
    (c) => c.stage === live.id && c.status === "active",
  );
  const submitted = new Map<string, number>();
  let drafts = 0;
  for (const s of mine ?? []) {
    if (s.status === "draft") drafts++;
    else submitted.set(s.candidateId, (submitted.get(s.candidateId) ?? 0) + 1);
  }
  const fullyScored = [...submitted.values()].filter(
    (n) => n === live.rounds.length,
  ).length;

  return (
    <>
      <PageHeader
        title="Head Judge panel"
        description={`Live stage: ${live.name}`}
      />
      <StatGrid>
        <StatTile label="Candidates in queue" value={count(inQueue?.length)} />
        <StatTile
          label="Fully scored by you"
          value={count(mine && fullyScored)}
        />
        <StatTile
          label="Draft scores"
          value={count(mine && drafts)}
          hint="Saved but not submitted"
        />
      </StatGrid>

      <Section title="Go to">
        <QuickLinks
          links={[
            {
              to: "/judging",
              title: "Judging queue",
              text: "Score, advance or disqualify — singly or in bulk.",
              icon: Gavel,
            },
            {
              to: "/judging/leaderboard",
              title: "Leaderboard",
              text: "Every judge's scores per candidate. Judges only.",
              icon: Trophy,
            },
            {
              to: "/candidates",
              title: "Candidates",
              text: "Full application and public profile.",
              icon: Users,
            },
          ]}
        />
      </Section>

      <NoteBox>
        You judge like everyone else, and you also finalize: once every judge
        has voted, the scores are added up, you choose who goes through and
        close the stage. Only an Admin or Super Admin can then open the next
        one. Nobody can change another judge's scores — including you.
      </NoteBox>
    </>
  );
}
