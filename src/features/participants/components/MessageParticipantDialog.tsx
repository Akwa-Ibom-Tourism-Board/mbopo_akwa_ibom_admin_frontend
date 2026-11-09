import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@/shared/ui";
import { useMessageParticipant } from "../api/hooks";

// Starts a direct email conversation with a participant — opening this
// dialog is the only new UI Stage 4 needed, since the resulting thread is
// just a normal Messages-inbox entry (channel: "admin"): sending here
// hands off straight to the existing ComplaintDetailPage/ComplaintThread for
// everything that follows (replies, email-delivery status, resend).
export function MessageParticipantDialog({
  participantId,
  participantName,
  open,
  onOpenChange,
}: {
  participantId: string;
  participantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const mutation = useMessageParticipant(participantId);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const reset = () => {
    setSubject("");
    setBody("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message {participantName}</DialogTitle>
          <DialogDescription>
            Sent directly to their email. Their reply (and yours after that)
            shows up as a normal conversation in Messages.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="message-subject">Subject</Label>
            <Input
              id="message-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Your Mbopo application"
              maxLength={200}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="message-body">Message</Label>
            <Textarea
              id="message-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message…"
              maxLength={5000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!subject.trim() || !body.trim() || mutation.isPending}
            onClick={() =>
              mutation.mutate(
                { subject: subject.trim(), body: body.trim() },
                {
                  onSuccess: ({ messageId }) => {
                    reset();
                    onOpenChange(false);
                    toast.success("Message sent");
                    navigate(`/messages/${messageId}`);
                  },
                  onError: (err) => toast.error(err.message),
                },
              )
            }
          >
            {mutation.isPending ? "Sending…" : "Send message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
