import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { useComplaints } from "@/features/complaints";
import { count } from "../hooks";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";
import { ParticipantsBreakdownChart } from "./ParticipantsBreakdownChart";
import { useParticipantsCount } from "@/features/participants/api/hooks";

// Each of these asks the backend for just the count (limit: 1, read
// meta.total) rather than fetching every complaint to tally client-side.
export function CustomerServiceDashboard() {
  const open = useComplaints({ status: "open", limit: 1 }).data?.meta.total;
  const inProgress = useComplaints({ status: "in_progress", limit: 1 }).data
    ?.meta.total;
  const resolved = useComplaints({ status: "resolved", limit: 1 }).data?.meta
    .total;
  const counts = useParticipantsCount().data;

  return (
    <>
      <PageHeader
        title="Support desk"
        description="Messages from contestants and the public."
      />
      <StatGrid>
        <StatTile
          label="Open"
          value={count(open)}
          hint="Waiting for a first reply"
        />
        <StatTile label="In progress" value={count(inProgress)} />
        <StatTile label="Resolved" value={count(resolved)} />
      </StatGrid>

      <Section title="">
        <ParticipantsBreakdownChart counts={counts} />
      </Section>

      <Section title="Go to">
        <QuickLinks
          links={[
            {
              to: "/messages",
              title: "Messages inbox",
              text: "Reply to and resolve tickets.",
              icon: LifeBuoy,
            },
          ]}
        />
      </Section>

      <NoteBox>
        Your access is limited to messages. User accounts, judging, voting
        content and pricing are handled by other roles.
      </NoteBox>
    </>
  );
}
