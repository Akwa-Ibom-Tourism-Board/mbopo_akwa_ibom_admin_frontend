import { Gavel, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { useJudgeSummary } from "../judgeSummary";
import { count } from "../hooks";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function JudgeDashboard() {
  const s = useJudgeSummary();
  const live = !s.loading ? s.live : undefined;

  return (
    <>
      <PageHeader
        title="Judging panel"
        description={
          s.loading
            ? "Loading…"
            : s.live
              ? `Live stage: ${s.title}`
              : "No stage is open right now. An Admin opens the next one."
        }
      />
      <StatGrid>
        <StatTile
          label="Candidates to score"
          value={live ? count(s.inField) : "—"}
        />
        <StatTile
          label="Fully scored by you"
          value={live ? count(s.fullyScored) : "—"}
        />
        <StatTile
          label="Draft scores"
          value={live ? count(s.drafts) : "—"}
          hint="Saved but not submitted"
        />
      </StatGrid>

      <Section title="Go to">
        <QuickLinks
          links={[
            {
              to: live ? `/stages/${live}` : "/judging",
              title: "Live stage",
              text: "Score candidates or disqualify rule-breakers, singly or in bulk.",
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
        Scores can be saved as drafts and corrected while the stage is open.
        Once the Head Judge closes it, scores are locked. You can see other
        judges' scores on the leaderboard but only ever change your own.
      </NoteBox>
    </>
  );
}
