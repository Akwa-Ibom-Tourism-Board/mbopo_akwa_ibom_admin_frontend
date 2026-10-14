import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { Badge, EmptyState } from "@/shared/components";
import { useAuth } from "@/features/auth";
import { useCandidate } from "@/features/candidates/api/hooks";
import {
  PhaseBadge,
  StatusBadge,
} from "@/features/candidates/components/Badges";
import { occupationLabel } from "@/features/candidates/utils/derive";
import { PitchPlayer } from "@/features/candidates/components/MediaPlayers";
import { usePhaseStates } from "@/features/stages/api/hooks";
import { inField as candidateInField } from "@/features/stages/utils/participants";
import { phaseTitle } from "@/lib/phases";
import { YoutubeEmbed } from "@/features/voting-content";
import { media } from "@/theme";
import { CriteriaRubric } from "../components/CriteriaRubric";
import { ScoreForm } from "../components/ScoreForm";
import { roundsOf } from "../data/mock-stages";
import { useMyCandidateScores } from "../api/hooks";

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  font-weight: 600;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  ${media.xl} {
    grid-template-columns: 360px minmax(0, 1fr);
    align-items: start;
  }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  ${media.xl} {
    position: sticky;
    top: 96px;
  }
`;

const Head = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;

  img {
    width: 84px;
    height: 84px;
    border-radius: ${({ theme }) => theme.radii.xl};
    object-fit: cover;
  }

  h2 {
    margin: 0 0 6px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.25rem;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Small = styled.p`
  margin: 0 0 10px;
  font-size: 0.8125rem;
  line-height: 1.55;
`;

const RoundTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 4px;
  overflow-x: auto;
`;

const RoundTab = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  flex-shrink: 0;
  max-width: 200px;
  padding: 10px 14px;
  border: 1.5px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary.DEFAULT : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme, $active }) =>
    $active
      ? theme.alpha(theme.colors.primary.DEFAULT, 0.08)
      : theme.colors.card};
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
`;

const Warn = styled.p`
  display: flex;
  gap: 8px;
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.875rem;
  font-weight: 600;
`;

export function CandidateScoringPage() {
  const { candidateId = "" } = useParams();
  const { user } = useAuth();
  const judgeId = user!.id;
  const { data: c, isLoading } = useCandidate(candidateId);
  const myScores = useMyCandidateScores(judgeId, candidateId);
  const [roundId, setRoundId] = useState<string | null>(null);
  const states = usePhaseStates().data;

  if (isLoading || myScores.isLoading) return <EmptyState>Loading…</EmptyState>;
  if (!c) return <EmptyState>We couldn't find that candidate.</EmptyState>;

  const rounds = roundsOf(c.phase);
  const phaseState = states?.find((st) => st.phaseId === c.phase);
  const index = Math.max(
    0,
    roundId ? rounds.findIndex((r) => r.id === roundId) : 0,
  );
  const round = rounds[index]!;
  const existing = myScores.data?.find((s) => s.roundId === round.id);

  // Scores can only be entered while the candidate's stage is open and they
  // are still competing in it. A closed stage is locked for every judge.
  const stageLocked =
    phaseState?.status === "closed"
      ? `${phaseTitle(c.phase)} is closed — scores are locked.`
      : phaseState?.status === "pending"
        ? `${phaseTitle(c.phase)} hasn't been opened yet.`
        : phaseState?.resultsSubmittedAt
          ? `Results for ${phaseTitle(c.phase)} have been submitted — scores are locked.`
          : undefined;
  const competing = candidateInField(c, c.phase);
  const locked = !phaseState || !!stageLocked || !competing;
  const lockReason =
    c.status === "winner"
      ? "This candidate has been crowned winner; scoring is closed."
      : c.status === "eliminated"
        ? `Eliminated${c.eliminatedAt ? ` (${phaseTitle(c.eliminatedAt)})` : ""}. Scoring is closed.`
        : c.status === "disqualified"
          ? `Disqualified${c.disqualificationReason ? `: ${c.disqualificationReason}` : ""}. Scoring is closed.`
          : (stageLocked ??
            (c.status === "advanced"
              ? `Finalized through ${phaseTitle(c.phase)}. Scoring is closed.`
              : undefined));

  return (
    <>
      <Back to={`/stages/${c.phase}`}>
        <ArrowLeft size={16} /> {phaseTitle(c.phase)}
      </Back>

      <Layout>
        <Side>
          {/* Everything relevant to scoring on one screen — no tab-switching. */}
          <Card>
            <CardContent style={{ paddingTop: 20 }}>
              <Head>
                <img src={c.photo} alt={c.name} />
                <div>
                  <h2>{c.name}</h2>
                  <Tags>
                    <PhaseBadge phase={c.phase} />
                    <StatusBadge status={c.status} />
                    <Badge>{c.lga}</Badge>
                  </Tags>
                </div>
              </Head>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
            </CardHeader>
            <CardContent>
              <Small>
                {occupationLabel(c)} · {c.education}
              </Small>
              <Small>{c.story}</Small>
              {c.videoPitchUrl && (
                <PitchPlayer
                  url={c.videoPitchUrl}
                  title={`${c.name} video pitch`}
                />
              )}
            </CardContent>
          </Card>

          {(c.bio ||
            c.additionalVideos?.length ||
            c.additionalPhotos?.length) && (
            <Card>
              <CardHeader>
                <CardTitle>Public profile</CardTitle>
              </CardHeader>
              <CardContent>
                {c.bio && <Small>{c.bio}</Small>}
                {c.additionalVideos?.map((v, i) => (
                  <YoutubeEmbed key={i} url={v.youtubeUrl} title={v.title} />
                ))}
              </CardContent>
            </Card>
          )}
        </Side>

        <Card>
          <CardHeader>
            <CardTitle>{phaseTitle(c.phase)}</CardTitle>
          </CardHeader>
          <CardContent>
            {locked && lockReason && (
              <Warn>
                <TriangleAlert size={16} />
                {lockReason}
              </Warn>
            )}

            <RoundTabs role="tablist">
              {rounds.map((r) => {
                const s = myScores.data?.find((x) => x.roundId === r.id);
                return (
                  <RoundTab
                    key={r.id}
                    role="tab"
                    aria-selected={r.id === round.id}
                    $active={r.id === round.id}
                    onClick={() => setRoundId(r.id)}
                  >
                    <span>
                      {r.code} · {r.name}
                    </span>
                    <Badge
                      $tone={
                        s?.status === "submitted"
                          ? "primary"
                          : s
                            ? "secondary"
                            : "neutral"
                      }
                    >
                      {s
                        ? s.status === "submitted"
                          ? "Submitted"
                          : "Draft"
                        : "Not scored"}
                    </Badge>
                  </RoundTab>
                );
              })}
            </RoundTabs>

            <CriteriaRubric round={round} />
            <ScoreForm
              key={`${c.id}-${round.id}-${existing?.updatedAt ?? "new"}-${locked}`}
              round={round}
              judgeId={judgeId}
              candidateId={c.id}
              existing={existing}
              disabled={locked}
            />
          </CardContent>
        </Card>
      </Layout>
    </>
  );
}
