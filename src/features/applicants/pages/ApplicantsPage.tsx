import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import { PageHeader } from "@/shared/components";
import { useApplicants } from "../api/hooks";
import { ApplicantTable } from "../components/ApplicantTable";
import type { ApplicantFilterStatus } from "../types";

const ALL = "all";

export function ApplicantsPage() {
  const [status, setStatus] = useState<ApplicantFilterStatus | typeof ALL>(ALL);
  const { data, isLoading } = useApplicants({
    limit: 200,
    status: status === ALL ? undefined : status,
  });

  return (
    <>
      <PageHeader
        title="Applicants"
        description="Everyone who has registered, whether or not they've finished applying. Once an application is fully submitted, they also appear under Contestants."
        actions={
          <Select value={status} onValueChange={(v) => setStatus(v as ApplicantFilterStatus | typeof ALL)}>
            <SelectTrigger aria-label="Filter by progress" style={{ minWidth: 180 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All applicants</SelectItem>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <ApplicantTable applicants={data?.applicants} isLoading={isLoading} />
    </>
  );
}
