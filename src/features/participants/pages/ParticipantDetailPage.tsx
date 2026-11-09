import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft, Pencil, SearchX, UploadCloud } from "lucide-react";
import { Button, LoadingState } from "@/shared/ui";
import { Badge, EmptyState, Tabs, type TabItem } from "@/shared/components";
import { phaseTitle } from "@/lib/phases";
import { useCan } from "@/lib/rbac";
import { media } from "@/theme";
import { useParticipant } from "../api/hooks";
import { participantKind } from "../types";
import { ActivityTab } from "@/features/candidates/components/ActivityTab";
import { ApplicationTab } from "@/features/candidates/components/ApplicationTab";
import { EditSectionDialog } from "@/features/candidates/components/EditSectionDialog";
import type { SectionId } from "@/features/candidates/schemas";
import {
  PhaseBadge,
  StatusBadge,
} from "@/features/candidates/components/Badges";
import { CandidateProfilePanel } from "@/features/candidates/components/CandidateProfilePanel";
import { DocumentsTab } from "@/features/candidates/components/DocumentsTab";
import { UploadDocumentDialog } from "@/features/candidates/components/UploadDocumentDialog";
import type { DocumentSlot } from "@/features/candidates/data/documents";
import { OverviewTab } from "@/features/candidates/components/OverviewTab";

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

const MediaTitle = styled.h2`
  margin: 0 0 20px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.75rem;
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

const ALL_TABS: TabItem<TabId>[] = [
  { id: "overview", label: "Overview" },
  { id: "application", label: "Application" },
  { id: "documents", label: "Documents" },
  { id: "profile", label: "Public profile" },
  { id: "activity", label: "Activity" },
];

export function ParticipantDetailPage() {
  const { id } = useParams();
  const { data: c, isLoading } = useParticipant(id);
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const [editing, setEditing] = useState<SectionId | null>(null);
  const [uploading, setUploading] = useState<DocumentSlot | null>(null);

  const isSubmitted = c?.status === "submitted";
  // Documents exist as soon as registration uploads them (well before
  // submit), so that tab shows for any draft with an Application on file —
  // Profile and Activity are contestant-only concepts (public-profile
  // content and the admin edit trail only ever apply once submitted).
  const hasApplication = !!c?.id;
  const canSeeActivity = can("candidates.viewActivity") && isSubmitted;
  const canEdit = can("candidates.editDetails") && isSubmitted;

  const tabs = useMemo(
    () =>
      ALL_TABS.filter((t) => {
        if (t.id === "documents") return hasApplication;
        if (t.id === "profile") return isSubmitted;
        if (t.id === "activity") return canSeeActivity;
        return true;
      }),
    [hasApplication, isSubmitted, canSeeActivity],
  );
  const tab = useMemo<TabId>(
    () =>
      tabs.some((t) => t.id === requested) ? (requested as TabId) : "overview",
    [requested, tabs],
  );

  // Where "back" goes — the tab this record actually belongs to, not just
  // wherever the browser happened to come from.
  const backTo = `/participants/${
    c
      ? {
          candidate: "candidates",
          applicant: "applicants",
          contestant: "contestants",
        }[participantKind(c.status)]
      : "candidates"
  }`;

  if (isLoading) return <LoadingState />;
  if (!c) {
    return (
      <>
        <Back to="/participants/candidates">
          <ArrowLeft size={16} /> All participants
        </Back>
        <EmptyState
          icon={<SearchX size={26} />}
          title="Participant not found"
          message="We couldn't find that participant."
          action={
            <Button asChild>
              <Link to="/participants/candidates">Back to participants</Link>
            </Button>
          }
        />
      </>
    );
  }

  // Media see a name and the public-profile tools — no stage, status, tabs
  // or application. (Their data is also stripped in the api.)
  if (!can("candidates.viewDetails")) {
    return (
      <>
        <Back to={backTo}>
          <ArrowLeft size={16} /> All participants
        </Back>
        <MediaTitle>{c.name}</MediaTitle>
        <CandidateProfilePanel key={c.applicantId} candidate={c} editable />
      </>
    );
  }

  return (
    <>
      <Back to={backTo}>
        <ArrowLeft size={16} /> All participants
      </Back>

      <Hero>
        <img src={c.photo ?? undefined} alt={c.name} />
        <div>
          <h2>{c.name}</h2>
          <Badges>
            {isSubmitted ? (
              <>
                <PhaseBadge phase={c.phase} />
                <StatusBadge status={c.candidateStatus} />
              </>
            ) : (
              <Badge $tone={c.status === "draft" ? "secondary" : "neutral"}>
                {c.status === "draft"
                  ? "Application in progress"
                  : "Registered — not started"}
              </Badge>
            )}
            {c.lga && <Badge>{c.lga}</Badge>}
            {c.senatorialDistrict && <Badge>{c.senatorialDistrict}</Badge>}
          </Badges>
          {c.candidateStatus === "eliminated" && (
            <p style={{ margin: "12px 0 0", fontSize: "0.875rem" }}>
              Eliminated —{" "}
              {c.eliminatedAtPhase
                ? phaseTitle(c.eliminatedAtPhase)
                : "not selected"}
              .
            </p>
          )}
          {c.candidateStatus === "disqualified" && c.disqualificationReason && (
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
            canEdit
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
      {tab === "documents" && (
        <DocumentsTab
          candidate={c}
          actions={
            canEdit
              ? (slot, url) => (
                  <Button
                    size="sm"
                    variant={url ? "outline" : "default"}
                    onClick={() => setUploading(slot)}
                  >
                    <UploadCloud size={14} /> {url ? "Replace" : "Upload"}
                  </Button>
                )
              : undefined
          }
        />
      )}
      {tab === "activity" && c.id && <ActivityTab candidateId={c.id} />}
      <EditSectionDialog
        candidate={c}
        section={editing}
        onClose={() => setEditing(null)}
      />
      <UploadDocumentDialog
        candidate={c}
        slot={uploading}
        onClose={() => setUploading(null)}
      />
      {tab === "profile" && (
        // Keyed so the editor's local form state resets per candidate.
        <CandidateProfilePanel
          key={c.applicantId}
          candidate={c}
          editable={can("candidates.editPublicProfile")}
        />
      )}
    </>
  );
}
