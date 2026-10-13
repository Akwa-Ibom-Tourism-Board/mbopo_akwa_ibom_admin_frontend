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

export function CustomerServiceDashboard() {
  const complaints = useComplaints().data;
  const by = (s: string) => complaints?.filter((c) => c.status === s).length;

  return (
    <>
      <PageHeader
        title="Support desk"
        description="Complaints from contestants and the public."
      />
      <StatGrid>
        <StatTile
          label="Open"
          value={count(by("open"))}
          hint="Waiting for a first reply"
        />
        <StatTile label="In progress" value={count(by("in_progress"))} />
        <StatTile label="Resolved" value={count(by("resolved"))} />
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
