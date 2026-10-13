import { PageHeader } from "@/shared/components";
import { useCan } from "@/lib/rbac";
import { ComplaintList } from "../components/ComplaintList";
import { useComplaints } from "../api/hooks";

export function ComplaintsPage() {
  const { data, isLoading } = useComplaints();
  const can = useCan();
  return (
    <>
      <PageHeader
        title="Complaints"
        description={
          can("complaints.respond")
            ? "Reply to complaints from contestants and the public."
            : "Read-only oversight of the support inbox. You can reassign a ticket from its page."
        }
      />
      <ComplaintList complaints={data} isLoading={isLoading} />
    </>
  );
}
