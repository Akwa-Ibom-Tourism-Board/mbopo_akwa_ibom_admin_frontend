import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import type { Candidate } from "@/features/candidates/types";
import { useJudges, useLeaderboard } from "../api/hooks";
import { formatScore } from "../utils/scoring";

// Judges-only block for the candidate detail page. Callers must gate it with
// can("judging.leaderboard") — it fetches scores on mount.
export function CandidateScoreCard({ candidate }: { candidate: Candidate }) {
  const board = useLeaderboard(candidate.phase);
  const judges = useJudges(candidate.phase);
  const entry = board.data?.find((e) => e.candidate.id === candidate.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Judges' scores</CardTitle>
      </CardHeader>
      <CardContent>
        {!entry ? (
          <p style={{ margin: 0 }}>No submitted scores yet.</p>
        ) : (
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "8px 16px",
              margin: 0,
              fontSize: "0.875rem",
            }}
          >
            {judges.data?.map((j) => (
              <div key={j.id} style={{ display: "contents" }}>
                <dt>{j.name}</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>
                  {formatScore(entry.perJudge[j.id]?.score)}
                </dd>
              </div>
            ))}
            <dt>
              <strong>Average</strong>
            </dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>
              {formatScore(entry.average)}
            </dd>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
