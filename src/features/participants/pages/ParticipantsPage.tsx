import { useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageHeader, Tabs, type TabItem } from "@/shared/components";
import { useCan } from "@/lib/rbac";
import { useApplicants } from "@/features/applicants/api/hooks";
import { ApplicantTable } from "@/features/applicants/components/ApplicantTable";
import { useCandidates } from "@/features/candidates/api/hooks";
import { CandidateTable } from "@/features/candidates/components/CandidateTable";
import { MediaCandidateTable } from "@/features/candidates/components/MediaCandidateTable";

type TabId = "candidates" | "applicants" | "contestants";

const TABS: TabItem<TabId>[] = [
  { id: "candidates", label: "Candidates" },
  { id: "applicants", label: "Applicants" },
  { id: "contestants", label: "Contestants" },
];

const DESCRIPTIONS: Record<TabId, string> = {
  candidates:
    "Everyone who has registered on the platform, whatever stage they're at.",
  applicants:
    "Started an application but haven't submitted it yet. Once submitted, they move to Contestants.",
  contestants: "Every fully-submitted application, in one place.",
};

function CandidatesTab() {
  const { data, isLoading } = useApplicants({ limit: 200 });
  return <ApplicantTable applicants={data?.applicants} isLoading={isLoading} />;
}

function ApplicantsTab() {
  // Hardcoded to in-progress — a candidate who hasn't started at all belongs
  // on the Candidates tab, one who's submitted belongs on Contestants.
  const { data, isLoading } = useApplicants({
    limit: 200,
    status: "in_progress",
  });
  return <ApplicantTable applicants={data?.applicants} isLoading={isLoading} />;
}

function ContestantsTab() {
  const { data, isLoading } = useCandidates();
  const can = useCan();
  if (!can("candidates.viewDetails")) {
    return <MediaCandidateTable candidates={data} isLoading={isLoading} />;
  }
  return <CandidateTable candidates={data} isLoading={isLoading} />;
}

export function ParticipantsPage() {
  // Not a route param — the three tabs are literal paths (see routes.tsx),
  // so /participants/candidates etc. don't collide with a real
  // /participants/:id in React Router's matching.
  const tab = useLocation().pathname.split("/")[2];
  const navigate = useNavigate();
  const can = useCan();

  const canSeeApplicantTabs = can("applicants.view");
  const canSeeContestants = can("candidates.view");
  const tabs = useMemo(
    () =>
      TABS.filter((t) =>
        t.id === "contestants" ? canSeeContestants : canSeeApplicantTabs,
      ),
    [canSeeApplicantTabs, canSeeContestants],
  );

  const activeTab = tabs.some((t) => t.id === tab)
    ? (tab as TabId)
    : tabs[0]?.id;

  if (!activeTab) {
    // Shouldn't happen — the route is itself gated behind participants.view
    // — but fall back gracefully rather than render an empty shell.
    return <Navigate to="/dashboard" replace />;
  }
  if (tab !== activeTab) {
    return <Navigate to={`/participants/${activeTab}`} replace />;
  }

  return (
    <>
      <PageHeader title="Participants" description={DESCRIPTIONS[activeTab]} />
      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={(t) => navigate(`/participants/${t}`)}
      />
      {activeTab === "candidates" && <CandidatesTab />}
      {activeTab === "applicants" && <ApplicantsTab />}
      {activeTab === "contestants" && <ContestantsTab />}
    </>
  );
}
