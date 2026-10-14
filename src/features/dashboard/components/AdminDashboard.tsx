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
import { useCandidates } from "@/features/candidates/api/hooks";
import { useComplaints } from "@/features/complaints";
import { useUsers } from "@/features/users";
import { useNewsPosts } from "@/features/voting-content/api/hooks";
import { count, useCurrentStage, useRecentActivity } from "../hooks";
import {
  ActivityList,
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function AdminDashboard() {
  const candidates = useCandidates().data;
  const users = useUsers().data;
  const complaints = useComplaints().data;
  const news = useNewsPosts().data;
  const activity = useRecentActivity();
  const stage = useCurrentStage();

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Run staff accounts and the voting platform's content."
      />
      <StatGrid>
        <StatTile
          label="Current stage"
          value={stage?.title ?? "—"}
          hint={
            stage?.status === "open"
              ? "Open for judging"
              : stage?.status === "pending"
                ? "Waiting to be opened"
                : undefined
          }
        />
        <StatTile
          label="Media, Judges & Support staff"
          value={count(
            users?.filter(
              (u) => u.active && !["super_admin", "admin"].includes(u.role),
            ).length,
          )}
          hint="Active accounts you manage"
        />
        <StatTile
          label="Candidates still competing"
          value={count(candidates?.filter((c) => c.status === "active").length)}
          hint="Status only — no scores"
        />
        <StatTile label="News posts" value={count(news?.length)} />
        <StatTile
          label="Open complaints"
          value={count(complaints?.filter((c) => c.status === "open").length)}
        />
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
              title: "Event tracker",
              text: "Audit trail of every action.",
              icon: Activity,
            },
          ]}
        />
      </Section>

      <Section title="Recent activity">
        <ActivityList items={activity} />
      </Section>

      <NoteBox>
        Judging is separate from administration. You can see a candidate's
        status once a decision is made, but you cannot score, advance,
        disqualify or view the judges' score breakdown.
      </NoteBox>
    </>
  );
}
