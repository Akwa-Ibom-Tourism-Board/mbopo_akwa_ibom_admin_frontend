import { Gavel, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { useJudgeSummary } from "../judgeSummary";
import { useFinalizeStatus } from "@/features/judging/api/hooks";
import { count } from "../hooks";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function HeadJudgeDashboard() {
  const s = useJudgeSummary();
  const live = !s.loading ? s.live : undefined;
  const fin = useFinalizeStatus(live ?? "lga", !!live).data;
  const finished = fin?.judges.filter((j) => j.outstanding === 0).length;

  return (
    <>
      <PageHeader
        title="Head Judge panel"
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
        You judge like everyone else, and you also finalize: once every judge
        has voted, the scores are added up, you choose who goes through and
        close the stage. Only an Admin can then open the next one. Nobody can
        change another judge's scores — including you.
      </NoteBox>
    </>
  );
}
