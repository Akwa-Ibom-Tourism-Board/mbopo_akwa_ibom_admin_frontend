import type { Round, StageConfig } from "../types";

// Seeded from BUILD_ME.md §5 (transcribed from the selection-process
// document). Rubric criteria and the stage/round structure are complete.
//
// ⚠️ QUESTION BANKS ARE PARTIAL. BUILD_ME.md only quotes or describes a
// handful of the source document's sample questions per bank, and the source
// document itself isn't in this repo. Only questions that BUILD_ME.md names
// are seeded; `expectedCount` records how many the source has so the UI can
// flag the gap. Add the rest from the source document.

const CORE = ["Confidence", "Speech", "Personality", "Composure", "Clarity"];
const KNOWLEDGE = ["Knowledge", "Reasoning", "Composure", "Communication"];

const stage1: Round[] = [
  {
    id: "s1-intro",
    stage: "lga_selection",
    code: "A",
    name: "Introduction",
    durationSeconds: 30,
    prompt:
      "Please introduce yourself to the judges. Tell us your name, what you do, where you are from and one thing that makes you unique.",
    criteria: CORE,
  },
  {
    id: "s1-written",
    stage: "lga_selection",
    code: "W",
    name: "Written examination",
    guidance:
      "Separate IQ / intelligence test. Enter the marked result on the 1–10 scale.",
    criteria: ["Examination score"],
    criteriaNote:
      "The source gives no breakdown for the written exam — modelled as a single 1–10 score. Confirm how exam marks should map onto the scale.",
  },
];

const stage2: Round[] = [
  {
    id: "s2-walk",
    stage: "senatorial_selection",
    code: "B",
    name: "Walk & Presentation",
    durationSeconds: 60,
    prompt: "Candidate enters, walks across the stage, turns and exits.",
    criteria: [
      "Posture",
      "Poise",
      "Elegance",
      "Confidence",
      "Body coordination",
      "Stage awareness",
    ],
  },
  {
    id: "s2-quick",
    stage: "senatorial_selection",
    code: "C",
    name: "Quick Question",
    durationSeconds: 60,
    prompt: "One question per candidate, drawn from the bank.",
    criteria: CORE,
    criteriaNote:
      "No separate criteria in the source — scored on the same core criteria as the Introduction.",
    questionBank: {
      expectedCount: 10,
      questions: [
        "What does beauty mean to you?",
        "What is one problem affecting young people today?",
      ],
    },
  },
  {
    id: "s2-r1",
    stage: "senatorial_selection",
    code: "E1",
    name: "Elimination Round 1 — General Knowledge & Personality",
    guidance:
      "Candidates will not necessarily be eliminated because they don't know a factual answer.",
    criteria: KNOWLEDGE,
    questionBank: {
      expectedCount: 10,
      questions: [
        "What is the capital of Akwa Ibom State?",
        "Who is the current President of Nigeria?",
        "Name a tourist attraction in Akwa Ibom State.",
      ],
    },
  },
  {
    id: "s2-r2",
    stage: "senatorial_selection",
    code: "E2",
    name: "Round 2 — Intelligence & Critical Thinking",
    thinkSeconds: [30, 60],
    guidance: "Give the candidate 30–60 seconds to think before she answers.",
    criteria: KNOWLEDGE,
    criteriaNote:
      "Same four criteria as Round 1 — no separate rubric in the source.",
    questionBank: {
      expectedCount: 10,
      questions: [
        "If you had ₦10 million to improve your community, how would you spend it?",
      ],
    },
  },
  {
    id: "s2-r3",
    stage: "senatorial_selection",
    code: "E3",
    name: "Round 3 — Pressure Questions",
    guidance:
      "The objective is not to embarrass contestants, but to test their composure.",
    criteria: [
      "Avoids panic",
      "Avoids defensiveness",
      "Eye contact",
      "Answers the actual question",
      "Independent thinking",
      "Respectfulness",
    ],
    questionBank: {
      expectedCount: 8,
      questions: [
        "You have 30 seconds. Convince us that you deserve this crown.",
      ],
    },
  },
  {
    id: "s2-r4",
    stage: "senatorial_selection",
    code: "E4",
    name: "Round 4 — Culture & Heritage",
    criteria: KNOWLEDGE,
    criteriaNote:
      "Same four criteria as Rounds 1–2 — no separate rubric in the source.",
    questionBank: {
      expectedCount: 13,
      questions: [
        "Name three things Akwa Ibom is famous for.",
        "What is a traditional dish from your LGA?",
        "What is the name of your Paramount Ruler?",
        "What are the sub-themes under the ARISE Agenda?",
      ],
    },
  },
  {
    id: "s2-r5",
    stage: "senatorial_selection",
    code: "E5",
    name: "Round 5 — Advocacy / Beauty With Purpose",
    durationSeconds: 120,
    prompt:
      "If crowned, what cause would you champion, why does it matter and what practical action would you take?",
    criteria: CORE,
    criteriaNote:
      "No dedicated rubric in the source — scored on the same base criteria as the Introduction.",
    causes: [
      "Girl-child education",
      "Tourism",
      "Mental wellness",
      "Entrepreneurship",
      "Environmental protection",
      "Domestic violence awareness",
      "Skills development",
      "Youth empowerment",
      "Cultural preservation",
      "Disability inclusion",
      "Literacy",
      "Community development",
    ],
  },
];

const stage3: Round[] = [
  {
    id: "s3-final",
    stage: "grand_finale",
    code: "F",
    name: "Grand Finale (placeholder rubric)",
    guidance:
      "Placeholder only — the source says one winner is chosen after the 10-day boot camp but gives no criteria.",
    criteria: ["Overall presence", "Boot camp performance", "Final impression"],
  },
];

export const STAGES: StageConfig[] = [
  {
    id: "lga_selection",
    order: 1,
    name: "Local Government Selections",
    summary: "All eligible applicants per LGA compete; 3 are selected per LGA.",
    advanceTarget: { count: 93, label: "3 per LGA × 31 LGAs" },
    rounds: stage1,
  },
  {
    id: "senatorial_selection",
    order: 2,
    name: "Senatorial District Selections",
    summary: "The 93 LGA selections compete by district; 1 per LGA advances.",
    advanceTarget: { count: 31, label: "1 per LGA" },
    rounds: stage2,
  },
  {
    id: "grand_finale",
    order: 3,
    name: "Grand Finale",
    summary: "The 31 finalists attend a 10-day boot camp; 1 winner is chosen.",
    advanceTarget: { count: 1, label: "1 winner" },
    rounds: stage3,
    rubricPending: true,
  },
];

export const getStageConfig = (id: StageConfig["id"]) =>
  STAGES.find((s) => s.id === id)!;

export const nextStageId = (id: StageConfig["id"]) =>
  STAGES.find((s) => s.order === getStageConfig(id).order + 1)?.id;
