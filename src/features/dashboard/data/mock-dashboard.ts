// PLACEHOLDER figures for the role dashboards. Later stages replace these
// with values derived from each feature's own api/ (candidates, complaints,
// users, activity) — they're static here only so each dashboard can be built
// and clicked through before those features exist.
export const DASHBOARD_STATS = {
  staffAccounts: 14,
  candidatesTotal: 93,
  candidatesByStage: {
    lga_selection: 93,
    senatorial_selection: 0,
    grand_finale: 0,
  },
  votesCast: 18420,
  voteRevenueNaira: 1842000,
  openComplaints: 5,
  inProgressComplaints: 3,
  resolvedComplaints: 12,
  profilesMissingBio: 41,
  newsPosts: 8,
  sponsors: 6,
  judge: {
    activeStageLabel: "Local Government Selections",
    inQueue: 93,
    draftScores: 4,
    scoredByMe: 27,
  },
} as const;

export const RECENT_ACTIVITY = [
  {
    id: "a1",
    text: "Utibe Akpan created a Judge account",
    when: "2 hours ago",
  },
  {
    id: "a2",
    text: "Mfon Bassey published a picture news post",
    when: "5 hours ago",
  },
  {
    id: "a3",
    text: "Vote pricing updated: 10 votes for ₦1,000",
    when: "Yesterday",
  },
  { id: "a4", text: "A judge advanced 3 candidates (Uyo)", when: "Yesterday" },
] as const;
