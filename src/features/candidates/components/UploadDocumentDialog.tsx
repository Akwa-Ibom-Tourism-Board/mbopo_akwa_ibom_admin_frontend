import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { AlertTriangle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import type { Participant } from "@/features/participants/types";
import { useUploadCandidateDocument } from "../api/hooks";
import { validateDocumentFile, type DocumentSlot } from "../data/documents";
import { DOCUMENT_URL_FIELDS } from "../types";

const Drop = styled.button<{ $bad: boolean }>`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  border: 1.5px dashed
    ${({ theme, $bad }) => ($bad ? theme.colors.destructive.DEFAULT : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.DEFAULT};
  }
`;

const Preview = styled.div`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};

  img,
  video {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: contain;
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
  }
`;

const Meta = styled.p`
  margin: 8px 0 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.muted.foreground};
`;

const Err = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.8125rem;
  font-weight: 600;
`;

const Warn = styled.p`
  display: flex;
  gap: 8px;
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.12)};
  font-size: 0.8125rem;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

// Choose a file for one document slot, see it checked against the backend's
// format and size rules and previewed, then confirm. The upload itself goes
// straight to Cloudinary via a signature the backend issues for this exact
// slot — replacing keeps the same public_id, so the old asset is overwritten.
export function UploadDocumentDialog({
  candidate,
  slot,
  onClose,
}: {
  candidate: Participant;
  slot: DocumentSlot | null;
  onClose: () => void;
}) {
  const upload = useUploadCandidateDocument(candidate.id ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    setFile(null);
    setError(null);
  }, [slot?.field]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!slot) return null;
  const existingUrl = candidate[DOCUMENT_URL_FIELDS[slot.field]] as
    string | null | undefined;

  const choose = (picked: File | undefined) => {
    if (!picked) return;
    setError(null);
    const problem = validateDocumentFile(slot.field, {
      fileName: picked.name,
      mimeType: picked.type,
      bytes: picked.size,
    });
    if (problem) {
      setError(problem);
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const save = () =>
    file &&
    upload.mutate(
      { field: slot.field, file },
      {
        onSuccess: () => {
          toast.success(
            `${slot.label} ${existingUrl ? "replaced" : "uploaded"}`,
          );
          onClose();
        },
        onError: (e) => setError(e.message),
      },
    );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader>
          <DialogTitle>
            {existingUrl ? "Replace" : "Upload"} {slot.label.toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            {slot.formats.map((f) => f.toUpperCase()).join(", ")} · up to{" "}
            {Math.round(slot.maxBytes / (1024 * 1024))}MB
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={slot.formats.map((f) => `.${f}`).join(",")}
          onChange={(e) => {
            choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {!file ? (
          <Drop
            type="button"
            $bad={!!error}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud size={26} />
            Choose a file
          </Drop>
        ) : (
          <>
            <Preview>
              {slot.kind === "video" ? (
                <video src={previewUrl!} controls preload="metadata" />
              ) : (
                <img src={previewUrl!} alt="New file preview" />
              )}
            </Preview>
            <Meta>New: {file.name}</Meta>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              style={{ marginTop: 6 }}
              onClick={() => inputRef.current?.click()}
            >
              Choose a different file
            </Button>
          </>
        )}
        {error && <Err role="alert">{error}</Err>}

        {slot.field === "videoPitch" &&
          existingUrl &&
          candidate.status === "submitted" && (
            <Warn>
              <AlertTriangle size={15} />
              This application is already submitted, and applicants can't change
              their video pitch after that. Replacing it is recorded in the
              activity trail.
            </Warn>
          )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!file || upload.isPending}
            onClick={save}
          >
            {upload.isPending
              ? "Uploading…"
              : existingUrl
                ? `Replace ${slot.label.toLowerCase()}`
                : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
