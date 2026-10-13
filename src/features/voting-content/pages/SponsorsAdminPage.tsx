import { useState } from "react";
import styled from "styled-components";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, CardContent } from "@/shared/ui";
import { ConfirmDialog, EmptyState, PageHeader } from "@/shared/components";
import { SponsorEditor } from "../components/SponsorEditor";
import { useDeleteSponsor, useSponsors } from "../api/hooks";
import type { Sponsor } from "../types";

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;

const Logo = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const Name = styled.h3`
  margin: 14px 0 6px;
  font-size: 1rem;
`;

const Text = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export function SponsorsAdminPage() {
  const { data, isLoading } = useSponsors();
  const remove = useDeleteSponsor();
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Sponsor | null>(null);

  return (
    <>
      <PageHeader
        title="Sponsors"
        description="Sponsor cards shown on the public voting site."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus size={16} /> Add sponsor
          </Button>
        }
      />
      {isLoading ? (
        <EmptyState>Loading…</EmptyState>
      ) : !data?.length ? (
        <EmptyState>No sponsors yet.</EmptyState>
      ) : (
        <Grid>
          {data.map((s) => (
            <Card key={s.id}>
              <CardContent style={{ paddingTop: 20 }}>
                <Logo src={s.logo} alt={`${s.name} logo`} />
                <Name>{s.name}</Name>
                <Text>{s.description}</Text>
                <Row>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${s.name}`}
                    onClick={() => {
                      setEditing(s);
                      setOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${s.name}`}
                    onClick={() => setDeleting(s)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  {s.websiteUrl && (
                    <Button asChild size="icon" variant="ghost">
                      <a
                        href={s.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${s.name} website`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    </Button>
                  )}
                </Row>
              </CardContent>
            </Card>
          ))}
        </Grid>
      )}
      <SponsorEditor sponsor={editing} open={open} onOpenChange={setOpen} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this sponsor?"
        description={
          deleting
            ? `${deleting.name} will be removed from the voting site.`
            : undefined
        }
        destructive
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Sponsor deleted");
              setDeleting(null);
            },
          })
        }
      />
    </>
  );
}
