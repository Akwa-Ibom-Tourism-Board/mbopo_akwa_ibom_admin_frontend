import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui";
import { Badge, type DataTableColumn } from "@/shared/components";
import { useAuth } from "@/features/auth";
import { StageCandidateTable } from "@/features/stages/components/StageCandidateTable";
import type { PhaseState } from "@/features/stages/types";
import {
  inField,
  type Participant,
} from "@/features/stages/utils/participants";
import type { PhaseId } from "@/lib/phases";
import { roundsOf } from "../data/mock-stages";
import { useMyPhaseScores } from "../api/hooks";
import { BulkActionBar } from "./BulkActionBar";

// The judges' working view of a stage: the candidate list plus each judge's
// own scoring progress, a Score button and bulk disqualify. Mounted only for
// judge roles (the stage page decides), so no scores load for anyone else.
export function JudgeStageTable({
  phaseId,
  state,
  rows,
}: {
  phaseId: PhaseId;
  state: PhaseState;
  rows: Participant[];
}) {
  const { user } = useAuth();
  const mine = useMyPhaseScores(user!.id, phaseId);
  const rounds = roundsOf(phaseId);
  const open = state.status === "open";

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

  const columns: DataTableColumn<Participant>[] = [
    {
      id: "progress",
      header: "Your scoring",
      sortValue: (r) => progress.get(r.candidate.id)?.submitted ?? 0,
      cell: ({ candidate: c }) => {
        if (state.status === "pending") return <Badge>—</Badge>;
        const p = progress.get(c.id);
        if (!p) return <Badge>Not started</Badge>;
        return (
          <Badge
            $tone={p.submitted === rounds.length ? "primary" : "secondary"}
          >
            {p.submitted}/{rounds.length} rounds
            {p.drafts ? ` · ${p.drafts} draft` : ""}
          </Badge>
        );
      },
    },
  ];

  return (
    <StageCandidateTable
      rows={rows}
      extraColumns={columns}
      isRowSelectable={(r) => open && inField(r.candidate, phaseId)}
      bulkActions={
        open
          ? (selected, clear) => (
              <BulkActionBar
                selected={selected.map((r) => r.candidate)}
                clear={clear}
              />
            )
          : undefined
      }
      rowActions={(r) =>
        state.status === "pending" ? null : (
          <Button asChild size="sm" variant="outline">
            <Link to={`/judging/${r.candidate.id}/score`}>
              {open && inField(r.candidate, phaseId) ? "Score" : "View"}
            </Link>
          </Button>
        )
      }
    />
  );
}
