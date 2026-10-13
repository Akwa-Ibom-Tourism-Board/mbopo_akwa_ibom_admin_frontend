import { PageHeader } from "@/shared/components";
import { CandidateTable } from "../components/CandidateTable";
import { useCandidates } from "../api/hooks";

export function CandidatesPage() {
  const { data, isLoading } = useCandidates();
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
