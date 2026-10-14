import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/shared/ui";
import { Badge, EmptyState, Tabs, type TabItem } from "@/shared/components";
import { phaseTitle } from "@/lib/phases";
import { useCan } from "@/lib/rbac";
import { media } from "@/theme";
import { useCandidate } from "../api/hooks";
import { ActivityTab } from "../components/ActivityTab";
import { ApplicationTab } from "../components/ApplicationTab";
import { EditSectionDialog } from "../components/EditSectionDialog";
import type { SectionId } from "../schemas";
import { PhaseBadge, StatusBadge } from "../components/Badges";
import { CandidateProfilePanel } from "../components/CandidateProfilePanel";
import { DocumentsTab } from "../components/DocumentsTab";
import { OverviewTab } from "../components/OverviewTab";

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;

  ${media.sm} {
    flex-direction: row;
    align-items: center;
  }

  img {
    width: 120px;
    height: 120px;
    border-radius: ${({ theme }) => theme.radii["2xl"]};
    object-fit: cover;
  }

  h2 {
    margin: 0 0 6px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.75rem;
  }
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Reason = styled.p`
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.alpha(theme.colors.destructive.DEFAULT, 0.1)};
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.875rem;
`;

type TabId = "overview" | "application" | "documents" | "profile" | "activity";

const TABS: TabItem<TabId>[] = [
  { id: "overview", label: "Overview" },
  { id: "application", label: "Application" },
  { id: "documents", label: "Documents" },
  { id: "profile", label: "Public profile" },
  { id: "activity", label: "Activity" },
];

export function CandidateDetailPage() {
  const { id } = useParams();
  const { data: c, isLoading } = useCandidate(id);
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const [editing, setEditing] = useState<SectionId | null>(null);
  // The Activity tab is for Admin / Super Admin only.
  const canSeeActivity = can("candidates.viewActivity");
  const tabs = useMemo(
    () => TABS.filter((t) => t.id !== "activity" || canSeeActivity),
    [canSeeActivity],
  );
  const tab = useMemo<TabId>(
    () =>
      tabs.some((t) => t.id === requested) ? (requested as TabId) : "overview",
    [requested, tabs],
  );

  if (isLoading) return <EmptyState>Loading…</EmptyState>;
  if (!c) {
    return (
      <>
        <Back to="/candidates">
          <ArrowLeft size={16} /> All candidates
        </Back>
        <EmptyState>We couldn't find that candidate.</EmptyState>
      </>
    );
  }

  return (
    <>
      <Back to="/candidates">
        <ArrowLeft size={16} /> All candidates
      </Back>

      <Hero>
        <img src={c.photo} alt={c.name} />
        <div>
          <h2>{c.name}</h2>
          <Badges>
            <PhaseBadge phase={c.phase} />
            <StatusBadge status={c.status} />
            <Badge>{c.lga}</Badge>
            <Badge>{c.senatorialDistrict}</Badge>
          </Badges>
          {c.status === "eliminated" && (
            <p style={{ margin: "12px 0 0", fontSize: "0.875rem" }}>
              Eliminated —{" "}
              {c.eliminatedAt ? phaseTitle(c.eliminatedAt) : "not selected"}.
            </p>
          )}
          {c.status === "disqualified" && c.disqualificationReason && (
            <Reason>Disqualified: {c.disqualificationReason}</Reason>
          )}
        </div>
      </Hero>

      <Tabs
        tabs={tabs}
        value={tab}
        onChange={(t) =>
          setParams(t === "overview" ? {} : { tab: t }, { replace: true })
        }
      />

      {tab === "overview" && <OverviewTab candidate={c} />}
      {tab === "application" && (
        <ApplicationTab
          candidate={c}
          editAction={
            can("candidates.editDetails")
              ? (section) => (
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={`Edit ${section}`}
                    onClick={() => setEditing(section as SectionId)}
                  >
                    <Pencil size={14} /> Edit
                  </Button>
                )
              : undefined
          }
        />
      )}
      {tab === "documents" && <DocumentsTab candidate={c} />}
      {tab === "activity" && <ActivityTab candidateId={c.id} />}
      <EditSectionDialog
        candidate={c}
        section={editing}
        onClose={() => setEditing(null)}
      />
      {tab === "profile" && (
        // Keyed so the editor's local form state resets per candidate.
        <CandidateProfilePanel
          key={c.id}
          candidate={c}
          editable={can("candidates.editPublicProfile")}
        />
      )}
    </>
  );
}
