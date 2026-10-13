import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { DASHBOARD_STATS as S } from "../data/mock-dashboard";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function CustomerServiceDashboard() {
  return (
    <>
      <PageHeader
        title="Support desk"
        description="Complaints from contestants and the public."
      />
      <StatGrid>
        <StatTile
          label="Open"
          value={S.openComplaints}
          hint="Waiting for a first reply"
        />
        <StatTile label="In progress" value={S.inProgressComplaints} />
        <StatTile label="Resolved" value={S.resolvedComplaints} />
      </StatGrid>

      <Section title="Go to">
        <QuickLinks
          links={[
            {
              to: "/complaints",
              title: "Complaints inbox",
              text: "Reply to and resolve tickets.",
              icon: LifeBuoy,
            },
          ]}
        />
      </Section>

      <NoteBox>
        Your access is limited to complaints. User accounts, judging, voting
        content and pricing are handled by other roles.
      </NoteBox>
    </>
  );
}
