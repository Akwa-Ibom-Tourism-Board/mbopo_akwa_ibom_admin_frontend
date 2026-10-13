import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { toast } from "sonner";
import { ArrowRightCircle } from "lucide-react";
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
import { CloseRoundDialog } from "../components/CloseRoundDialog";
import { RoundTracker } from "../components/RoundTracker";
import { StagePicker } from "../components/StagePicker";
import { getStageConfig, nextStageId } from "../data/mock-stages";
import {
  useClosures,
  useCloseStage,
  useJudgingQueue,
  useMyStageScores,
  useReopenRound,
} from "../api/hooks";
import { currentRoundIndex, fieldForRound } from "../utils/rounds";

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

export function JudgingQueuePage() {
  const { user } = useAuth();
  const judgeId = user!.id;
  const [stage, setStage] = useState<CandidateStage>("lga_selection");
  const config = getStageConfig(stage);
  const elimination = config.mode === "elimination";
  const queue = useJudgingQueue(stage);
  const closuresQ = useClosures(stage);
  const mine = useMyStageScores(judgeId, stage);
  const reopen = useReopenRound();
  const closeStage = useCloseStage();
  const [closingIndex, setClosingIndex] = useState<number | null>(null);
  const [stageOpen, setStageOpen] = useState(false);

  const closures = useMemo(() => closuresQ.data ?? [], [closuresQ.data]);
  const all = useMemo(() => queue.data ?? [], [queue.data]);
  const next = nextStageId(stage);
  const selectedCount = all.filter(
    (c) => c.status === "advanced" || c.status === "winner",
  ).length;
  const allClosed = config.rounds.every((r) =>
    closures.some((c) => c.roundId === r.id),
  );
  const currentIdx = currentRoundIndex(config, closures);
  const currentRound = elimination ? config.rounds[currentIdx] : undefined;

  // The table shows everyone in the stage; in the Grand Finale, "this round"
  // progress is measured against the round now in play.
  const fieldIds = useMemo(
    () =>
      elimination && currentIdx >= 0
        ? new Set(fieldForRound(config, currentIdx, all).map((c) => c.id))
        : null,
    [elimination, currentIdx, config, all],
  );

  const progress = useMemo(() => {
    const map = new Map<string, { submitted: number; drafts: number }>();
    for (const s of mine.data ?? []) {
      if (currentRound && s.roundId !== currentRound.id) continue;
      const p = map.get(s.candidateId) ?? { submitted: 0, drafts: 0 };
      if (s.status === "submitted") p.submitted++;
      else p.drafts++;
      map.set(s.candidateId, p);
    }
    return map;
  }, [mine.data, currentRound]);

  const roundsTotal = currentRound ? 1 : config.rounds.length;

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
      header: currentRound ? `Your ${currentRound.code} score` : "Your scoring",
      sortValue: (c) => progress.get(c.id)?.submitted ?? 0,
      cell: (c) => {
        if (fieldIds && !fieldIds.has(c.id))
          return <Badge>Out of this round</Badge>;
        const p = progress.get(c.id);
        if (!p) return <Badge>Not started</Badge>;
        return (
          <Badge $tone={p.submitted === roundsTotal ? "primary" : "secondary"}>
            {currentRound
              ? p.submitted
                ? "Submitted"
                : "Draft"
              : `${p.submitted}/${roundsTotal} rounds${p.drafts ? ` · ${p.drafts} draft` : ""}`}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Judging queue"
        description={
          elimination
            ? "Score the current round, then close it to cut the field. Disqualify only for rule-breaking."
            : "Score every round, then select who goes through. Select several rows to act in bulk."
        }
        actions={<StagePicker value={stage} onChange={setStage} />}
      />

      <Panel>
        <Grow>
          <strong>{config.name}</strong>
          <span>{config.summary}</span>
        </Grow>
        <Grow>
          <strong>
            {elimination
              ? `${all.filter((c) => c.status === "active").length} still in`
              : `${selectedCount} selected`}
          </strong>
          <span>
            Target: {config.advanceTarget.count} ({config.advanceTarget.label})
          </span>
        </Grow>
        {!elimination && next && (
          <Button
            variant="secondary"
            disabled={!allClosed || selectedCount === 0}
            title={!allClosed ? "Lock every round first" : undefined}
            style={{
              height: "auto",
              maxWidth: "100%",
              whiteSpace: "normal",
              textAlign: "left",
            }}
            onClick={() => setStageOpen(true)}
          >
            <ArrowRightCircle size={16} /> Close stage &amp; open{" "}
            {getStageConfig(next).name}
          </Button>
        )}
      </Panel>

      <RoundTracker
        config={config}
        closures={closures}
        candidates={all}
        onClose={setClosingIndex}
        onReopen={(id) =>
          reopen.mutate(id, { onError: (e) => toast.error(e.message) })
        }
      />

      <DataTable
        columns={columns}
        rows={queue.data}
        getRowId={(c) => c.id}
        isLoading={queue.isLoading}
        searchText={(c) => `${c.name} ${c.lga}`}
        searchPlaceholder="Search by name or LGA"
        isRowSelectable={(c) =>
          (c.status === "active" || c.status === "advanced") &&
          (!fieldIds || fieldIds.has(c.id))
        }
        bulkActions={(selected, clear) => (
          <BulkActionBar
            selected={selected}
            all={all}
            config={config}
            clear={clear}
          />
        )}
        rowActions={(c) => (
          <Button asChild size="sm" variant="outline">
            <Link to={`/judging/${c.id}/score`}>
              {c.status === "disqualified" || c.status === "eliminated"
                ? "View"
                : "Score"}
            </Link>
          </Button>
        )}
        emptyMessage="No candidates in this stage."
      />

      <CloseRoundDialog
        config={config}
        round={
          closingIndex == null ? null : (config.rounds[closingIndex] ?? null)
        }
        open={closingIndex != null}
        onOpenChange={(o) => !o && setClosingIndex(null)}
      />

      <ConfirmDialog
        open={stageOpen}
        onOpenChange={setStageOpen}
        title={`Close ${config.name}?`}
        description={`${selectedCount} selected candidate${selectedCount === 1 ? "" : "s"} move into ${next ? getStageConfig(next).name : "the next stage"}. Everyone else still competing is eliminated. This can't be undone.`}
        confirmLabel="Close stage"
        destructive
        loading={closeStage.isPending}
        onConfirm={() =>
          closeStage.mutate(stage, {
            onSuccess: (r) => {
              toast.success(
                `${r.promoted} moved on, ${r.eliminated} not selected`,
              );
              setStageOpen(false);
            },
            onError: (e) => {
              toast.error(e.message);
              setStageOpen(false);
            },
          })
        }
      />
    </>
  );
}
