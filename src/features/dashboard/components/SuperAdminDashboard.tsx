import {
  Activity,
  LifeBuoy,
  Newspaper,
  Handshake,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { PageHeader } from "@/shared/components";
import { useCandidateStats } from "@/features/candidates/api/hooks";
import { useComplaints } from "@/features/complaints";
import { useUsers } from "@/features/users";
import { useVoteTiers } from "@/features/voting-content/api/hooks";
import { formatNaira, formatNumber } from "@/lib/formatting";
import { count, useCurrentStage, useRecentActivity } from "../hooks";
import {
  ActivityList,
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";
import { CandidatesByLgaChart } from "./CandidatesByLgaChart";
import { useParticipantsCount } from "@/features/participants/api/hooks";
import { ParticipantsBreakdownChart } from "./ParticipantsBreakdownChart";

export function SuperAdminDashboard() {
  const stats = useCandidateStats().data;
  const users = useUsers().data;
  const open = useComplaints({ status: "open", limit: 1 }).data?.meta.total;
  const tiers = useVoteTiers().data;
  const activity = useRecentActivity();
  const stage = useCurrentStage();
  const counts = useParticipantsCount().data;

  const votes = stats?.totalVotes;
  const cheapest = tiers?.length
    ? Math.min(...tiers.map((t) => t.priceNaira / t.votes))
    : undefined;

  return (
    <>
      <PageHeader
        title="Super Admin overview"
        description="Full control of staff accounts, the voting platform and pricing."
      />
      <StatGrid>
        <StatTile
          label="Current stage"
          value={stage?.title ?? "—"}
          hint={
            stage?.status === "open"
              ? stage.resultsSubmitted
                ? "Results submitted — ready to close"
                : "Open for judging"
              : stage?.status === "pending"
                ? "Waiting to be opened"
                : undefined
          }
        />
        <StatTile
          label="Active staff accounts"
          value={count(
            users?.filter((u) => u.active && u.role !== "super_admin").length,
          )}
          hint="All roles except Super Admin"
        />
        <StatTile label="Candidates" value={count(stats?.total)} />
        <StatTile
          label="Votes cast"
          value={votes == null ? "—" : formatNumber(votes)}
        />
        <StatTile
          label="Best vote rate"
          value={cheapest == null ? "—" : formatNaira(cheapest)}
          hint={`${tiers?.length ?? 0} vote tiers`}
        />
      </StatGrid>

      <Section title="">
        <CandidatesByLgaChart byLga={stats?.byLga} />
      </Section>

      <Section title="">
        <ParticipantsBreakdownChart counts={counts} />
      </Section>

      <Section title="Manage">
        <QuickLinks
          links={[
            {
              to: "/users",
              title: "Users",
              text: "Create and deactivate Admin, Media, Judges, Customer Service.",
              icon: UserCog,
            },
            {
              to: "/voting/pricing",
              title: "Vote pricing",
              text: "Set the cost of voting.",
              icon: Tag,
            },
            {
              to: "/voting/picture-news",
              title: "Picture news",
              text: "Posts shown on the voting site.",
              icon: Newspaper,
            },
            {
              to: "/voting/sponsors",
              title: "Sponsors",
              text: "Sponsor cards on the voting site.",
              icon: Handshake,
            },
            {
              to: "/participants/contestants",
              title: "Contestants",
              text: "Records and public profiles.",
              icon: Users,
            },
            {
              to: "/messages",
              title: "Messages",
              text: `${count(open)} open — oversight and reassignment.`,
              icon: LifeBuoy,
            },
            {
              to: "/activity-log",
              title: "Event tracker",
              text: "Who did what, and when.",
              icon: Activity,
            },
          ]}
        />
      </Section>

      <Section title="Recent activity">
        <ActivityList items={activity} />
      </Section>

      <NoteBox>
        Live judge scores and the leaderboard are visible to Judges only — not
        even Super Admin. You can see that a candidate advanced or was
        disqualified, and who decided, in the activity log.
      </NoteBox>
    </>
  );
}
