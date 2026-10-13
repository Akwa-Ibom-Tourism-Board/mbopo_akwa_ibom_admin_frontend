import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { Badge, EmptyState } from "@/shared/components";
import { YoutubeEmbed } from "@/features/voting-content";
import { useCan } from "@/lib/rbac";
import { formatDate } from "@/lib/formatting";
import { parseYoutubeId } from "@/lib/youtube";
import { media } from "@/theme";
import { useCandidate } from "../api/hooks";
import { StageBadge, StatusBadge } from "../components/Badges";
import { CandidateProfilePanel } from "../components/CandidateProfilePanel";
import type { VerificationStatus } from "../types";

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;

  ${media.sm} {
    flex-direction: row;
    align-items: center;
  }

  img {
    width: 120px;
    height: 120px;
    border-radius: ${({ theme }) => theme.radii["2xl"]};
    object-fit: cover;
  }

  h2 {
    margin: 0 0 6px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.75rem;
  }
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Layout = styled.div`
  display: grid;
  gap: 20px;

  ${media.xl} {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Facts = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 10px 20px;
  margin: 0;
  font-size: 0.875rem;

  dt {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }

  dd {
    margin: 0;
    font-weight: 600;
    word-break: break-word;
  }
`;

const Reason = styled.p`
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.alpha(theme.colors.destructive.DEFAULT, 0.1)};
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.875rem;
`;

const Photos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;

  img {
    width: 96px;
    height: 96px;
    border-radius: ${({ theme }) => theme.radii.lg};
    object-fit: cover;
  }
`;

const verificationBadge = (s: VerificationStatus) => (
  <Badge
    $tone={s === "verified" ? "primary" : s === "failed" ? "danger" : "neutral"}
  >
    {s[0]!.toUpperCase() + s.slice(1)}
  </Badge>
);

export function CandidateDetailPage() {
  const { id } = useParams();
  const { data: c, isLoading } = useCandidate(id);
  const can = useCan();

  if (isLoading) return <EmptyState>Loading…</EmptyState>;
  if (!c) {
    return (
      <>
        <Back to="/candidates">
          <ArrowLeft size={16} /> All candidates
        </Back>
        <EmptyState>We couldn't find that candidate.</EmptyState>
      </>
    );
  }

  const pitchIsYoutube = c.videoPitchUrl && parseYoutubeId(c.videoPitchUrl);

  return (
    <>
      <Back to="/candidates">
        <ArrowLeft size={16} /> All candidates
      </Back>

      <Hero>
        <img src={c.photo} alt={c.name} />
        <div>
          <h2>{c.name}</h2>
          <Badges>
            <StageBadge stage={c.stage} />
            <StatusBadge status={c.status} />
            <Badge>{c.lga}</Badge>
            <Badge>{c.senatorialDistrict}</Badge>
          </Badges>
          {c.status === "disqualified" && c.disqualificationReason && (
            <Reason>Disqualified: {c.disqualificationReason}</Reason>
          )}
        </div>
      </Hero>

      <Layout>
        <Column>
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
            </CardHeader>
            <CardContent>
              <Facts>
                <dt>Email</dt>
                <dd>{c.email}</dd>
                <dt>Phone</dt>
                <dd>{c.phone}</dd>
                <dt>Date of birth</dt>
                <dd>{formatDate(c.dateOfBirth)}</dd>
                <dt>Education</dt>
                <dd>{c.education}</dd>
                <dt>Occupation</dt>
                <dd>{c.occupation}</dd>
                <dt>NIN</dt>
                <dd>{verificationBadge(c.ninStatus)}</dd>
                <dt>VIN</dt>
                <dd>{verificationBadge(c.vinStatus)}</dd>
                <dt>Applied</dt>
                <dd>{formatDate(c.appliedAt)}</dd>
                <dt>Votes</dt>
                <dd>{(c.voteCount ?? 0).toLocaleString("en-NG")}</dd>
              </Facts>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidate story</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ margin: 0 }}>{c.story}</p>
              {c.applicantPhotos.length > 0 && (
                <Photos>
                  {c.applicantPhotos.map((src, i) => (
                    <img key={i} src={src} alt="" />
                  ))}
                </Photos>
              )}
            </CardContent>
          </Card>

          {c.videoPitchUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Video pitch</CardTitle>
              </CardHeader>
              <CardContent>
                {pitchIsYoutube ? (
                  <YoutubeEmbed
                    url={c.videoPitchUrl}
                    title={`${c.name} video pitch`}
                  />
                ) : (
                  <a href={c.videoPitchUrl} target="_blank" rel="noreferrer">
                    Open video pitch
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </Column>

        <Column>
          {/* Keyed so the editor's local form state resets per candidate. */}
          <CandidateProfilePanel
            key={c.id}
            candidate={c}
            editable={can("candidates.editPublicProfile")}
          />
        </Column>
      </Layout>
    </>
  );
}
