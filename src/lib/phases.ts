// The competition is a fixed sequence of "stages of elimination". Each one is
// opened by an Admin or Super Admin, judged, then finalized and closed by the
// Head Judge before the next can be opened:
//   Local Government → Senatorial → Grand Finale Round 1 … Round 5
// (The Grand Finale is one stage in the selection document, split here into
// its five rounds because each round cuts the field.)
export type CandidateStage =
  "lga_selection" | "senatorial_selection" | "grand_finale";

export type PhaseId =
  "lga" | "senatorial" | "gf-r1" | "gf-r2" | "gf-r3" | "gf-r4" | "gf-r5";

export interface PhaseDef {
  id: PhaseId;
  label: string;
  stage: CandidateStage;
  // Sidebar/title grouping for the Grand Finale rounds.
  group?: string;
  path: string;
}

const defs: Omit<PhaseDef, "path">[] = [
  { id: "lga", label: "Local Government", stage: "lga_selection" },
  { id: "senatorial", label: "Senatorial", stage: "senatorial_selection" },
  {
    id: "gf-r1",
    label: "Round 1",
    stage: "grand_finale",
    group: "Grand Finale",
  },
  {
    id: "gf-r2",
    label: "Round 2",
    stage: "grand_finale",
    group: "Grand Finale",
  },
  {
    id: "gf-r3",
    label: "Round 3",
    stage: "grand_finale",
    group: "Grand Finale",
  },
  {
    id: "gf-r4",
    label: "Round 4",
    stage: "grand_finale",
    group: "Grand Finale",
  },
  {
    id: "gf-r5",
    label: "Round 5",
    stage: "grand_finale",
    group: "Grand Finale",
  },
];

export const PHASES: readonly PhaseDef[] = defs.map((d) => ({
  ...d,
  path: `/stages/${d.id}`,
}));

export const isPhaseId = (value: string | undefined): value is PhaseId =>
  PHASES.some((p) => p.id === value);

export const phaseIndex = (id: PhaseId) => PHASES.findIndex((p) => p.id === id);

export const getPhaseDef = (id: PhaseId) => PHASES[phaseIndex(id)]!;

export const prevPhaseId = (id: PhaseId): PhaseId | undefined =>
  PHASES[phaseIndex(id) - 1]?.id;

export const nextPhaseId = (id: PhaseId): PhaseId | undefined =>
  PHASES[phaseIndex(id) + 1]?.id;

export const stageOfPhase = (id: PhaseId) => getPhaseDef(id).stage;

// "Local Government", "Senatorial", "Grand Finale · Round 2"
export const phaseTitle = (id: PhaseId) => {
  const p = getPhaseDef(id);
  return p.group ? `${p.group} · ${p.label}` : p.label;
};
