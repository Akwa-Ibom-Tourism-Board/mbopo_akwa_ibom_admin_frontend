import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { useCandidates } from "@/features/candidates/api/hooks";
import { useComplaints } from "@/features/complaints";
import { count } from "../hooks";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";
import { CandidatesByLgaChart } from "./CandidatesByLgaChart";

export function CustomerServiceDashboard() {
  const complaints = useComplaints().data;
  const candidates = useCandidates().data;
  const by = (s: string) => complaints?.filter((c) => c.status === s).length;

  return (
    <>
      <PageHeader
        title="Support desk"
        description="Messages from contestants and the public."
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

      <Section title="">
        <CandidatesByLgaChart candidates={candidates} />
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
