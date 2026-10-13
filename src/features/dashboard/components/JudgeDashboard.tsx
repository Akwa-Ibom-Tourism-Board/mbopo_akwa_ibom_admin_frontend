import { Gavel, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { DASHBOARD_STATS as S } from "../data/mock-dashboard";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function JudgeDashboard() {
  const j = S.judge;
  return (
    <>
      <PageHeader
        title="Judging panel"
        description={`Live stage: ${j.activeStageLabel}`}
      />
      <StatGrid>
        <StatTile label="Candidates in queue" value={j.inQueue} />
        <StatTile label="Scored by you" value={j.scoredByMe} />
        <StatTile
          label="Draft scores"
          value={j.draftScores}
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
        Scores can be saved as drafts and corrected until the round closes.
        Disqualification always needs a recorded reason.
      </NoteBox>
    </>
  );
}
