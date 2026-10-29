import { useState } from "react";
import styled from "styled-components";
import { ImageOff, Maximize2 } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui";
import { Badge } from "@/shared/components";
import { media } from "@/theme";
import { DOCUMENT_SLOTS, type DocumentSlot } from "../data/documents";
import { DOCUMENT_URL_FIELDS, type Candidate } from "../types";

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

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
`;

function DocumentCard({
  slot,
  url,
  actions,
}: {
  slot: DocumentSlot;
  url: string | null | undefined;
  actions?: (slot: DocumentSlot, url: string | null | undefined) => React.ReactNode;
}) {
  const [zoom, setZoom] = useState(false);

  return (
    <Card>
      <Preview>
        {!url ? (
          <Empty>
            <ImageOff size={28} />
            Nothing uploaded
          </Empty>
        ) : slot.kind === "video" ? (
          <video src={url} controls preload="metadata" aria-label={slot.label} />
        ) : (
          <>
            <img src={url} alt={slot.label} />
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
          {!url && (
            <Badge $tone={slot.requiredAtSubmit ? "danger" : "neutral"}>
              {slot.requiredAtSubmit ? "Required" : "Optional"}
            </Badge>
          )}
        </h3>
        <p>{slot.hint}</p>
        <Actions>{actions?.(slot, url)}</Actions>
      </Body>

      {url && slot.kind !== "video" && (
        <Dialog open={zoom} onOpenChange={setZoom}>
          <DialogContent style={{ maxWidth: 720 }}>
            <DialogHeader>
              <DialogTitle>{slot.label}</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <img src={url} alt={slot.label} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }} />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

// The 4 file slots the backend keeps for a submitted application, each a
// plain URL (no upload metadata is tracked server-side — see types/index.ts's
// note on Candidate). Upload/replace actions plug in via `actions`.
export function DocumentsTab({
  candidate,
  actions,
}: {
  candidate: Candidate;
  actions?: (slot: DocumentSlot, url: string | null | undefined) => React.ReactNode;
}) {
  return (
    <Grid>
      {DOCUMENT_SLOTS.map((slot) => (
        <DocumentCard
          key={slot.field}
          slot={slot}
          url={candidate[DOCUMENT_URL_FIELDS[slot.field]] as string | null | undefined}
          actions={actions}
        />
      ))}
    </Grid>
  );
}
