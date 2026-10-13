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

export function SuperAdminDashboard() {
  return (
    <>
      <PageHeader
        title="Super Admin overview"
        description="Full control of staff accounts, the voting platform and pricing."
      />
      <StatGrid>
        <StatTile
          label="Staff accounts"
          value={S.staffAccounts}
          hint="All non-Super-Admin roles"
        />
        <StatTile label="Candidates" value={S.candidatesTotal} />
        <StatTile
          label="Votes cast"
          value={S.votesCast.toLocaleString("en-NG")}
        />
        <StatTile
          label="Vote revenue"
          value={`₦${S.voteRevenueNaira.toLocaleString("en-NG")}`}
        />
      </StatGrid>

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
              to: "/candidates",
              title: "Candidates",
              text: "Records and public profiles.",
              icon: Users,
            },
            {
              to: "/complaints",
              title: "Complaints",
              text: `${S.openComplaints} open — oversight and reassignment.`,
              icon: LifeBuoy,
            },
            {
              to: "/activity-log",
              title: "Activity log",
              text: "Who did what, and when.",
              icon: Activity,
            },
          ]}
        />
      </Section>

      <Section title="Recent activity">
        <ActivityList items={RECENT_ACTIVITY} />
      </Section>

      <NoteBox>
        Live judge scores and the leaderboard are visible to Judges only — not
        even Super Admin. You can see that a candidate advanced or was
        disqualified, and who decided, in the activity log.
      </NoteBox>
    </>
  );
}
