import { PageHeader } from "@/shared/components";
import { useCan } from "@/lib/rbac";
import { CandidateTable } from "../components/CandidateTable";
import { MediaCandidateTable } from "../components/MediaCandidateTable";
import { useCandidates } from "../api/hooks";

export function CandidatesPage() {
  const { data, isLoading } = useCandidates();
  const can = useCan();

  // Roles without full candidate access (Media) get a name-only list for
  // working on public profiles.
  if (!can("candidates.viewDetails")) {
    return (
      <>
        <PageHeader
          title="Candidates"
          description="Select a candidate to add or update their bio, photos and videos."
        />
        <MediaCandidateTable candidates={data} isLoading={isLoading} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Every applicant's record in one place. Select a candidate to see their application, judging state and public profile."
      />
      <CandidateTable candidates={data} isLoading={isLoading} />
    </>
  );
}
