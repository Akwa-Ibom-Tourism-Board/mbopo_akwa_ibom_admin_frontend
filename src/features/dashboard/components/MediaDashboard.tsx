import { Handshake, Newspaper, Users } from "lucide-react";
import { PageHeader } from "@/shared/components";
import { DASHBOARD_STATS as S } from "../data/mock-dashboard";
import {
  NoteBox,
  QuickLinks,
  Section,
  StatGrid,
  StatTile,
} from "./DashboardParts";

export function MediaDashboard() {
  return (
    <>
      <PageHeader
        title="Media desk"
        description="Keep the public voting site's content fresh."
      />
      <StatGrid>
        <StatTile
          label="Profiles missing a bio"
          value={S.profilesMissingBio}
          hint="Candidates with no public bio yet"
        />
        <StatTile label="Picture news posts" value={S.newsPosts} />
        <StatTile label="Sponsors" value={S.sponsors} />
      </StatGrid>

      <Section title="Your work">
        <QuickLinks
          links={[
            {
              to: "/candidates",
              title: "Candidate profiles",
              text: "Add bios, photos and YouTube videos.",
              icon: Users,
            },
            {
              to: "/voting/picture-news",
              title: "Picture news",
              text: "Upload images and link videos.",
              icon: Newspaper,
            },
            {
              to: "/voting/sponsors",
              title: "Sponsors",
              text: "Logos, descriptions and links.",
              icon: Handshake,
            },
          ]}
        />
      </Section>

      <NoteBox>
        Images upload directly (up to 5MB). For videos, upload to the Mbopo Akwa
        Ibom YouTube channel yourself, then paste the link here — it is embedded
        on the voting site.
      </NoteBox>
    </>
  );
}
