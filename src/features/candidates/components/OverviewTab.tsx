import styled from "styled-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { Badge, EmailLink, PhoneLink } from "@/shared/components";
import { CandidateScoreCard } from "@/features/judging";
import { useCan } from "@/lib/rbac";
import { formatDate } from "@/lib/formatting";
import { media } from "@/theme";
import type { Participant } from "@/features/participants/types";
import { DOCUMENT_SLOTS } from "../data/documents";
import { DOCUMENT_URL_FIELDS, type Candidate } from "../types";
import {
  educationLabel,
  eligibility,
  institutionLabel,
  maritalFlag,
  occupationLabel,
} from "../utils/derive";
import { FactCard } from "./Facts";
import { PitchPlayer } from "./MediaPlayers";

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  ${media.xl} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

// The at-a-glance view: key facts, the applicant's own words and pitch video,
// and — judges only — the added-up scores.
export function OverviewTab({ candidate: c }: { candidate: Participant }) {
  const can = useCan();
  const elig = eligibility(c.dateOfBirth);
  const marital = maritalFlag(c.maritalStatus);
  const onFile = DOCUMENT_SLOTS.filter((s) =>
    Boolean(c[DOCUMENT_URL_FIELDS[s.field]]),
  ).length;
  const emptyLabel = c.status === "submitted" ? "—" : "Pending";

  return (
    <Layout>
      <Column>
        <FactCard
          title="At a glance"
          emptyLabel={emptyLabel}
          facts={[
            { label: "Local government", value: c.lga },
            { label: "District", value: c.senatorialDistrict },
            {
              label: "Age",
              value:
                elig.age === null ? (
                  "—"
                ) : (
                  <>
                    {elig.age}{" "}
                    <Badge $tone={elig.eligible ? "primary" : "danger"}>
                      {elig.eligible
                        ? `Within ${elig.band}`
                        : `Outside ${elig.band}`}
                    </Badge>
                  </>
                ),
            },
            {
              label: "Marital status",
              value: !marital ? undefined : (
                <>
                  {marital.status}{" "}
                  {!marital.eligible && (
                    <Badge $tone="danger">Not single</Badge>
                  )}
                </>
              ),
            },
            { label: "Education", value: educationLabel(c) },
            { label: "Institution", value: institutionLabel(c) },
            { label: "Occupation", value: occupationLabel(c) },
            {
              label: "Email",
              value: <EmailLink value={c.email} fallback={emptyLabel} />,
            },
            {
              label: "Phone",
              value: <PhoneLink value={c.phone} fallback={emptyLabel} />,
            },
            { label: "Reference", value: c.referenceCode },
            {
              label: "Documents",
              value: (
                <Badge
                  $tone={
                    onFile === DOCUMENT_SLOTS.length ? "primary" : "secondary"
                  }
                >
                  {onFile} of {DOCUMENT_SLOTS.length} on file
                </Badge>
              ),
            },
            {
              label: "Submitted",
              value: c.submittedAt ? formatDate(c.submittedAt) : undefined,
            },
            {
              label: "Votes",
              value: c.voteCount.toLocaleString("en-NG"),
            },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Why she should be Mbopo</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ margin: 0, lineHeight: 1.65 }}>{c.why || emptyLabel}</p>
            {(() => {
              const photos = [c.fullImageUrl, c.fullImageUrl2].filter(
                (src): src is string => Boolean(src),
              );
              return (
                photos.length > 0 && (
                  <Photos>
                    {photos.map((src, i) => (
                      <img key={i} src={src} alt="" />
                    ))}
                  </Photos>
                )
              );
            })()}
          </CardContent>
        </Card>
      </Column>

      <Column>
        {can("judging.leaderboard") && c.status === "submitted" && (
          // Safe: judges can only ever reach a submitted record through the
          // unified Participants view (enforced server-side in
          // admin/participants/services/get-one.service.ts), and the status
          // check above already confirms it for this specific render.
          <CandidateScoreCard candidate={c as Candidate} />
        )}
        {c.videoPitchUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Video pitch</CardTitle>
            </CardHeader>
            <CardContent>
              <PitchPlayer
                url={c.videoPitchUrl}
                title={`${c.name} video pitch`}
              />
            </CardContent>
          </Card>
        )}
      </Column>
    </Layout>
  );
}
