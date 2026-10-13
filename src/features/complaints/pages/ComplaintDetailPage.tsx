import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/ui";
import { Badge, EmptyState } from "@/shared/components";
import { useUsers } from "@/features/users";
import { useCan } from "@/lib/rbac";
import { formatDateTime } from "@/lib/formatting";
import { ComplaintThread } from "../components/ComplaintThread";
import { ComplaintStatusBadge } from "../components/StatusFilter";
import {
  useComplaint,
  useReassign,
  useReply,
  useUpdateStatus,
} from "../api/hooks";
import { SOURCE_LABELS, STATUS_LABELS, type ComplaintStatus } from "../types";

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  font-weight: 600;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
  }
`;

const Meta = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
`;

export function ComplaintDetailPage() {
  const { id } = useParams();
  const { data: c, isLoading } = useComplaint(id);
  const users = useUsers();
  const can = useCan();
  const reply = useReply(id ?? "");
  const setStatus = useUpdateStatus(id ?? "");
  const reassign = useReassign(id ?? "");
  const [draft, setDraft] = useState("");

  if (isLoading) return <EmptyState>Loading…</EmptyState>;
  if (!c) {
    return (
      <>
        <Back to="/complaints">
          <ArrowLeft size={16} /> All complaints
        </Back>
        <EmptyState>We couldn't find that complaint.</EmptyState>
      </>
    );
  }

  const support = (users.data ?? []).filter(
    (u) => u.role === "customer_service" && u.active,
  );
  const canRespond = can("complaints.respond");

  return (
    <>
      <Back to="/complaints">
        <ArrowLeft size={16} /> All complaints
      </Back>
      <Card>
        <CardHeader>
          <CardTitle>{c.subject}</CardTitle>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}
          >
            <ComplaintStatusBadge status={c.status} />
            <Badge>{SOURCE_LABELS[c.source]}</Badge>
          </div>
          <Meta>
            {c.complainantName} · {c.complainantEmail} · received{" "}
            {formatDateTime(c.createdAt)}
          </Meta>
        </CardHeader>
        <CardContent>
          <Controls>
            {canRespond && (
              <label>
                Status
                <Select
                  value={c.status}
                  onValueChange={(v) =>
                    setStatus.mutate(v as ComplaintStatus, {
                      onSuccess: () => toast.success("Status updated"),
                    })
                  }
                >
                  <SelectTrigger aria-label="Status" style={{ minWidth: 170 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </label>
            )}
            {can("complaints.reassign") && (
              <label>
                Assigned to
                <Select
                  value={c.assignedToId ?? ""}
                  onValueChange={(v) =>
                    reassign.mutate(v, {
                      onSuccess: () => toast.success("Ticket reassigned"),
                    })
                  }
                >
                  <SelectTrigger
                    aria-label="Assigned to"
                    style={{ minWidth: 220 }}
                  >
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {support.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            )}
          </Controls>

          <ComplaintThread messages={c.messages} />

          {canRespond ? (
            <form
              style={{
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
              onSubmit={(e) => {
                e.preventDefault();
                reply.mutate(draft, {
                  onSuccess: () => {
                    setDraft("");
                    toast.success("Reply sent");
                  },
                  onError: (err) => toast.error(err.message),
                });
              }}
            >
              <Textarea
                aria-label="Your reply"
                rows={4}
                placeholder="Write a reply…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={c.status === "resolved"}
              />
              <div>
                <Button
                  type="submit"
                  disabled={
                    !draft.trim() || reply.isPending || c.status === "resolved"
                  }
                >
                  {reply.isPending ? "Sending…" : "Send reply"}
                </Button>
                {c.status === "resolved" && (
                  <Meta as="span" style={{ marginLeft: 12 }}>
                    Reopen the ticket to reply.
                  </Meta>
                )}
              </div>
            </form>
          ) : (
            <Meta style={{ marginTop: 24 }}>
              Replies are handled by Customer Service. You have read access and
              can reassign this ticket.
            </Meta>
          )}
        </CardContent>
      </Card>
    </>
  );
}
