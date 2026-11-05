import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Paperclip, Check, Clock, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { formatDateTime, formatBytes } from "@/lib/formatting";
import { useResendReplyEmail } from "../api/hooks";
import type { ComplaintMessage } from "../types";

// A bounded, independently-scrolling chat panel (not the whole page) so the
// thread reads like WhatsApp/any chat app: oldest at top, newest at the
// bottom, and always opens already scrolled down to the latest message
// instead of leaving staff to scroll past the whole history to find it.
const ThreadPanel = styled.div`
  max-height: min(60vh, 560px);
  overflow-y: auto;
  padding: 4px 4px 4px 2px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.background};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
`;

const Bubble = styled.div<{ $staff: boolean }>`
  max-width: min(100%, 560px);
  align-self: ${({ $staff }) => ($staff ? "flex-end" : "flex-start")};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme, $staff }) =>
    $staff
      ? theme.alpha(theme.colors.primary.DEFAULT, 0.1)
      : theme.colors.muted.DEFAULT};
  font-size: 0.9375rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Meta = styled.p`
  margin: 0 0 6px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
  font-weight: 600;
`;

const Attachments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
`;

const AttachmentLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.primary.DEFAULT};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }

  span {
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-weight: 500;
  }
`;

const EmailStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.75rem;
`;

const EmailStatusLabel = styled.span<{ $tone: "pending" | "sent" | "failed" }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: ${({ theme, $tone }) =>
    $tone === "sent"
      ? theme.colors.primary.DEFAULT
      : $tone === "failed"
        ? theme.colors.destructive.DEFAULT
        : theme.colors.muted.foreground};
`;

// A staff reply's email send is async and can fail after the reply already
// shows as "sent" in the thread — this is how staff find out the
// complainant never actually got it, and retry without retyping anything.
function ReplyEmailStatus({
  complaintId,
  replyId,
  status,
  error,
}: {
  complaintId: string;
  replyId: string;
  status: "pending" | "sent" | "failed";
  error?: string;
}) {
  const resend = useResendReplyEmail(complaintId);

  if (status === "sent") {
    return (
      <EmailStatusRow>
        <EmailStatusLabel $tone="sent">
          <Check size={13} /> Email delivered
        </EmailStatusLabel>
      </EmailStatusRow>
    );
  }

  if (status === "pending") {
    return (
      <EmailStatusRow>
        <EmailStatusLabel $tone="pending">
          <Clock size={13} /> Sending email…
        </EmailStatusLabel>
      </EmailStatusRow>
    );
  }

  return (
    <EmailStatusRow>
      <EmailStatusLabel $tone="failed" title={error}>
        <TriangleAlert size={13} /> Email failed to send
      </EmailStatusLabel>
      <Button
        type="button"
        variant="link"
        size="sm"
        style={{ height: "auto", padding: 0 }}
        disabled={resend.isPending}
        onClick={() =>
          resend.mutate(replyId, {
            onSuccess: () => toast.success("Resending email…"),
            onError: (err) => toast.error(err.message),
          })
        }
      >
        {resend.isPending ? "Resending…" : "Resend"}
      </Button>
    </EmailStatusRow>
  );
}

export function ComplaintThread({
  complaintId,
  messages,
}: {
  complaintId: string;
  messages: ComplaintMessage[];
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Jump straight to the latest message whenever the thread first renders
  // or grows (a new reply comes in) — scrolls only this inner panel (never
  // the surrounding page) to its bottom, exactly like opening a WhatsApp
  // chat already scrolled to the newest message.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [messages.length]);

  return (
    <ThreadPanel ref={panelRef}>
      <List>
        {messages.map((m) => (
          <Bubble key={m.id} $staff={m.from === "staff"}>
            <Meta>
              {m.authorName} · {formatDateTime(m.at)}
            </Meta>
            {m.body}
            {m.attachments && m.attachments.length > 0 && (
              <Attachments>
                {m.attachments.map((a, i) => (
                  <AttachmentLink
                    key={`${m.id}-attachment-${i}`}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Paperclip size={14} />
                    {a.filename} <span>({formatBytes(a.bytes)})</span>
                  </AttachmentLink>
                ))}
              </Attachments>
            )}
            {m.from === "staff" && m.emailStatus && (
              <ReplyEmailStatus
                complaintId={complaintId}
                replyId={m.id}
                status={m.emailStatus}
                error={m.emailError}
              />
            )}
          </Bubble>
        ))}
      </List>
    </ThreadPanel>
  );
}
