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
import { DASHBOARD_STATS as S, RECENT_ACTIVITY } from "../data/mock-dashboard";
import {
  ActivityList,
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Run staff accounts and the voting platform's content."
      />
      <StatGrid>
        <StatTile
          label="Media, Judges & Support staff"
          value={S.staffAccounts - 2}
        />
        <StatTile
          label="Candidates in LGA stage"
          value={S.candidatesByStage.lga_selection}
        />
        <StatTile label="News posts" value={S.newsPosts} />
        <StatTile label="Open complaints" value={S.openComplaints} />
      </StatGrid>

      <Section title="Manage">
        <QuickLinks
          links={[
            {
              to: "/users",
              title: "Users",
              text: "Create and deactivate Media, Judges, Customer Service.",
              icon: UserCog,
            },
            {
              to: "/voting/pricing",
              title: "Vote pricing",
              text: "Edit the vote tiers.",
              icon: Tag,
            },
            {
              to: "/voting/picture-news",
              title: "Picture news",
              text: "Create, edit and delete posts.",
              icon: Newspaper,
            },
            {
              to: "/voting/sponsors",
              title: "Sponsors",
              text: "Manage sponsor cards.",
              icon: Handshake,
            },
            {
              to: "/candidates",
              title: "Candidates",
              text: "Records and public profiles.",
              icon: Users,
            },
            {
              to: "/complaints",
              title: "Complaints",
              text: "Oversight and reassignment.",
              icon: LifeBuoy,
            },
            {
              to: "/activity-log",
              title: "Activity log",
              text: "Audit trail of every action.",
              icon: Activity,
            },
          ]}
        />
      </Section>

      <Section title="Recent activity">
        <ActivityList items={RECENT_ACTIVITY} />
      </Section>

      <NoteBox>
        Judging is separate from administration. You can see a candidate's
        status once a decision is made, but you cannot score, advance,
        disqualify or view the judges' score breakdown.
      </NoteBox>
    </>
  );
}
