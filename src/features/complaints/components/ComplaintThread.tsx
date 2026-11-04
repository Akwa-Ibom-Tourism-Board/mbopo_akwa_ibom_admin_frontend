import styled from "styled-components";
import { Paperclip } from "lucide-react";
import { formatDateTime, formatBytes } from "@/lib/formatting";
import type { ComplaintMessage } from "../types";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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

export function ComplaintThread({
  messages,
}: {
  messages: ComplaintMessage[];
}) {
  return (
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
        </Bubble>
      ))}
    </List>
  );
}
