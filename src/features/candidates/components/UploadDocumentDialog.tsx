import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AlertTriangle, FileText, UploadCloud } from "lucide-react";
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
import { formatBytes } from "@/lib/formatting";
import { useUploadCandidateDocument } from "../api/hooks";
import { validateDocumentFile, type DocumentSlot } from "../data/documents";
import type { Candidate } from "../types";

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

  .doc {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px;
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

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// Choose a file for one document slot, see it checked against the backend's
// format and size rules and previewed, then confirm. Replacing keeps the same
// public_id, so the old asset is overwritten.
export function UploadDocumentDialog({
  candidate,
  slot,
  onClose,
}: {
  candidate: Candidate;
  slot: DocumentSlot | null;
  onClose: () => void;
}) {
  const upload = useUploadCandidateDocument(candidate.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{
    url: string;
    fileName: string;
    mimeType: string;
    bytes: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start fresh every time the dialog is opened for a slot.
  useEffect(() => {
    setPicked(null);
    setError(null);
  }, [slot?.field]);

  if (!slot) return null;
  const existing = candidate.documents[slot.field];

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setPicked(null);
    const meta = { fileName: file.name, mimeType: file.type, bytes: file.size };
    const problem = validateDocumentFile(slot.field, meta);
    if (problem) {
      setError(problem);
      return;
    }
    setPicked({ ...meta, url: await readAsDataUrl(file) });
  };

  const save = () =>
    picked &&
    upload.mutate(
      { field: slot.field, file: picked },
      {
        onSuccess: () => {
          toast.success(`${slot.label} ${existing ? "replaced" : "uploaded"}`);
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
            {existing ? "Replace" : "Upload"} {slot.label.toLowerCase()}
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
            void choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {!picked ? (
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
                <video src={picked.url} controls preload="metadata" />
              ) : picked.mimeType === "application/pdf" ? (
                <div className="doc">
                  <FileText size={28} /> {picked.fileName}
                </div>
              ) : (
                <img src={picked.url} alt="New file preview" />
              )}
            </Preview>
            <Meta>
              New: {picked.fileName} · {formatBytes(picked.bytes)}
              {existing && (
                <>
                  <br />
                  Replaces: {existing.fileName ?? "current file"} ·{" "}
                  {formatBytes(existing.bytes)}
                </>
              )}
            </Meta>
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
          existing &&
          candidate.applicationStatus === "submitted" && (
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
            disabled={!picked || upload.isPending}
            onClick={save}
          >
            {upload.isPending
              ? "Uploading…"
              : existing
                ? `Replace ${slot.label.toLowerCase()}`
                : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
