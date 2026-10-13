import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { toast } from "sonner";
import { ArrowRightCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/shared/ui";
import {
  Badge,
  ConfirmDialog,
  DataTable,
  PageHeader,
  type DataTableColumn,
} from "@/shared/components";
import { useAuth } from "@/features/auth";
import { StatusBadge } from "@/features/candidates/components/Badges";
import type { Candidate, CandidateStage } from "@/features/candidates/types";
import { BulkActionBar } from "../components/BulkActionBar";
import { StagePicker } from "../components/StagePicker";
import { getStageConfig, nextStageId } from "../data/mock-stages";
import {
  useJudgingQueue,
  useMyStageScores,
  usePromoteAdvanced,
} from "../api/hooks";

const Panel = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  margin-bottom: 20px;
  padding: 16px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Grow = styled.div`
  flex: 1 1 260px;
  font-size: 0.875rem;

  strong {
    display: block;
    font-size: 1rem;
  }

  span {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }
`;

const Pending = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 100%;
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8125rem;
  font-weight: 600;

  svg {
    color: ${({ theme }) => theme.colors.secondary.DEFAULT};
  }
`;

export function JudgingQueuePage() {
  const { user } = useAuth();
  const judgeId = user!.id;
  const [stage, setStage] = useState<CandidateStage>("lga_selection");
  const config = getStageConfig(stage);
  const queue = useJudgingQueue(stage);
  const mine = useMyStageScores(judgeId, stage);
  const promote = usePromoteAdvanced(stage);
  const [promoteOpen, setPromoteOpen] = useState(false);

  const advancedCount =
    queue.data?.filter((c) => c.status === "advanced").length ?? 0;
  const next = nextStageId(stage);

  const progress = useMemo(() => {
    const map = new Map<string, { submitted: number; drafts: number }>();
    for (const s of mine.data ?? []) {
      const p = map.get(s.candidateId) ?? { submitted: 0, drafts: 0 };
      if (s.status === "submitted") p.submitted++;
      else p.drafts++;
      map.set(s.candidateId, p);
    }
    return map;
  }, [mine.data]);

  const columns: DataTableColumn<Candidate>[] = [
    {
      id: "name",
      header: "Candidate",
      sortValue: (c) => c.name,
      cell: (c) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 600,
          }}
        >
          <img
            src={c.photo}
            alt=""
            width={36}
            height={36}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          {c.name}
        </span>
      ),
    },
    { id: "lga", header: "LGA", sortValue: (c) => c.lga, cell: (c) => c.lga },
    {
      id: "district",
      header: "District",
      sortValue: (c) => c.senatorialDistrict,
      cell: (c) => c.senatorialDistrict,
    },
    {
      id: "status",
      header: "Status",
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      id: "progress",
      header: "Your scoring",
      sortValue: (c) => progress.get(c.id)?.submitted ?? 0,
      cell: (c) => {
        const p = progress.get(c.id);
        const total = config.rounds.length;
        if (!p) return <Badge>Not started</Badge>;
        return (
          <Badge $tone={p.submitted === total ? "primary" : "secondary"}>
            {p.submitted}/{total} rounds{p.drafts ? ` · ${p.drafts} draft` : ""}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Judging queue"
        description="Score candidates, then advance or disqualify them — one at a time or by selecting several."
        actions={<StagePicker value={stage} onChange={setStage} />}
      />

      <Panel>
        <Grow>
          <strong>{config.name}</strong>
          <span>{config.summary}</span>
        </Grow>
        <Grow>
          <strong>
            {queue.data?.filter(
              (c) => c.status === "advanced" || c.status === "winner",
            ).length ?? 0}{" "}
            advanced
          </strong>
          <span>
            Target: {config.advanceTarget.count} ({config.advanceTarget.label})
          </span>
        </Grow>
        {next && advancedCount > 0 && (
          <Button variant="secondary" onClick={() => setPromoteOpen(true)}>
            <ArrowRightCircle size={16} /> Open {getStageConfig(next).name} for{" "}
            {advancedCount}
          </Button>
        )}
        {config.rubricPending && (
          <Pending>
            <TriangleAlert size={16} /> Rubric pending confirmation — the real
            Grand Finale criteria need to be supplied before this stage goes
            live.
          </Pending>
        )}
      </Panel>

      <DataTable
        columns={columns}
        rows={queue.data}
        getRowId={(c) => c.id}
        isLoading={queue.isLoading}
        searchText={(c) => `${c.name} ${c.lga}`}
        searchPlaceholder="Search by name or LGA"
        isRowSelectable={(c) =>
          c.status === "active" || c.status === "advanced"
        }
        bulkActions={(selected, clear) => (
          <BulkActionBar selected={selected} stage={stage} clear={clear} />
        )}
        rowActions={(c) => (
          <Button asChild size="sm" variant="outline">
            <Link to={`/judging/${c.id}/score`}>
              {c.status === "disqualified" ? "View" : "Score"}
            </Link>
          </Button>
        )}
        emptyMessage="No candidates in this stage."
      />

      <ConfirmDialog
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        title="Open the next stage?"
        description={`${advancedCount} advanced candidate${advancedCount === 1 ? "" : "s"} will move into ${next ? getStageConfig(next).name : ""}.`}
        confirmLabel="Open stage"
        loading={promote.isPending}
        onConfirm={() =>
          promote.mutate(undefined, {
            onSuccess: (n) => {
              toast.success(`${n} moved to the next stage`);
              setPromoteOpen(false);
            },
          })
        }
      />
    </>
  );
}
