import { useState } from "react";
import styled from "styled-components";
import { FileText, ImageOff, Maximize2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { Badge } from "@/shared/components";
import { useAuth } from "@/features/auth";
import { formatBytes, formatDateTime } from "@/lib/formatting";
import { media } from "@/theme";
import { DOCUMENT_SLOTS, type DocumentSlot } from "../data/documents";
import type { Candidate, CandidateDocument } from "../types";

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  ${media.md} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${media.xl} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Preview = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  height: 220px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.muted.DEFAULT};

  /* Media fills the box and is cropped, never allowed to size it. */
  img,
  video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }

  .expand {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
  }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px;

  h3 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.8125rem;
  }
`;

const Meta = styled.dl`
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 4px 12px;
  margin: 0;
  font-size: 0.8125rem;

  dt {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }

  dd {
    margin: 0;
    font-weight: 600;
    word-break: break-word;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
`;

// A Super Admin's upload shows as "an administrator" to everyone else.
function uploader(doc: CandidateDocument, viewerRole: string | null) {
  if (doc.uploadedByRole === "super_admin" && viewerRole !== "super_admin") {
    return "An administrator";
  }
  return doc.uploadedBy;
}

function DocumentCard({
  slot,
  doc,
  actions,
}: {
  slot: DocumentSlot;
  doc?: CandidateDocument;
  actions?: (slot: DocumentSlot, doc?: CandidateDocument) => React.ReactNode;
}) {
  const { role } = useAuth();
  const [zoom, setZoom] = useState(false);
  const isPdf =
    doc?.mimeType === "application/pdf" ||
    doc?.url.startsWith("data:application/pdf");

  return (
    <Card>
      <Preview>
        {!doc ? (
          <Empty>
            <ImageOff size={28} />
            Nothing uploaded
          </Empty>
        ) : slot.kind === "video" ? (
          <video
            src={doc.url}
            controls
            preload="metadata"
            aria-label={slot.label}
          />
        ) : isPdf ? (
          <Empty>
            <FileText size={36} />
            PDF document
          </Empty>
        ) : (
          <>
            <img src={doc.url} alt={slot.label} />
            <Button
              className="expand"
              size="icon"
              variant="secondary"
              aria-label={`Enlarge ${slot.label}`}
              onClick={() => setZoom(true)}
            >
              <Maximize2 size={16} />
            </Button>
          </>
        )}
      </Preview>
      <Body>
        <h3>
          {slot.label}
          {!doc && (
            <Badge $tone={slot.requiredAtSubmit ? "danger" : "neutral"}>
              {slot.requiredAtSubmit ? "Required" : "Optional"}
            </Badge>
          )}
        </h3>
        <p>{slot.hint}</p>
        {doc && (
          <Meta>
            <dt>File</dt>
            <dd>{doc.fileName ?? "—"}</dd>
            <dt>Size</dt>
            <dd>{formatBytes(doc.bytes)}</dd>
            <dt>Added</dt>
            <dd>
              {formatDateTime(doc.uploadedAt)} · {uploader(doc, role)}
            </dd>
          </Meta>
        )}
        <Actions>
          {doc && isPdf && (
            <Button asChild size="sm" variant="outline">
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                download={doc.fileName}
              >
                Open PDF
              </a>
            </Button>
          )}
          {actions?.(slot, doc)}
        </Actions>
      </Body>

      {doc && slot.kind !== "video" && !isPdf && (
        <Dialog open={zoom} onOpenChange={setZoom}>
          <DialogContent style={{ maxWidth: 720 }}>
            <DialogHeader>
              <DialogTitle>{slot.label}</DialogTitle>
              <DialogDescription>{doc.fileName}</DialogDescription>
            </DialogHeader>
            <img
              src={doc.url}
              alt={slot.label}
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

// Every file slot the backend keeps for an applicant (UPLOAD_FIELDS), with a
// preview, file details and who added it. Upload/replace actions plug in via
// `actions` once the editing stage lands.
export function DocumentsTab({
  candidate,
  actions,
}: {
  candidate: Candidate;
  actions?: (slot: DocumentSlot, doc?: CandidateDocument) => React.ReactNode;
}) {
  return (
    <Grid>
      {DOCUMENT_SLOTS.map((slot) => (
        <DocumentCard
          key={slot.field}
          slot={slot}
          doc={candidate.documents[slot.field]}
          actions={actions}
        />
      ))}
    </Grid>
  );
}
