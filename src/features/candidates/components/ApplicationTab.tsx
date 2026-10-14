import styled from "styled-components";
import { Badge } from "@/shared/components";
import { useCan } from "@/lib/rbac";
import { formatDate } from "@/lib/formatting";
import { media } from "@/theme";
import type { Candidate } from "../types";
import {
  eligibility,
  institutionLabel,
  maskId,
  occupationLabel,
} from "../utils/derive";
import { FactCard, type Fact } from "./Facts";

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  ${media.xl} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
`;

const Wide = styled.div`
  ${media.xl} {
    grid-column: 1 / -1;
  }
`;

const Prose = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  white-space: pre-wrap;
`;

// The full application, grouped the way the applicant platform's form is —
// Personal, Identity & origin, Education, Pitch, Your story — plus the
// next-of-kin and residence blocks. NIN/VIN are masked unless the signed-in
// role may see identity numbers; the VIN check outcome is shown to everyone
// who can see candidates (it is a judges' signal in the backend).
export function ApplicationTab({
  candidate: c,
  editAction,
}: {
  candidate: Candidate;
  // Per-section "Edit" buttons arrive with the editing stage.
  editAction?: (section: string) => React.ReactNode;
}) {
  const can = useCan();
  const seeIdentity = can("candidates.viewIdentity");
  const elig = eligibility(c.dateOfBirth);

  const vinOutcome =
    c.isVinVerified === true ? (
      <Badge $tone="primary">VIN verified</Badge>
    ) : c.isVinVerified === false ? (
      <>
        <Badge $tone="danger">VIN check failed</Badge>
        {c.vinVerificationFailedReason && (
          <span style={{ display: "block", marginTop: 4, fontWeight: 400 }}>
            {c.vinVerificationFailedReason}
          </span>
        )}
      </>
    ) : (
      <Badge>Not checked yet</Badge>
    );

  const personal: Fact[] = [
    {
      label: "Full name",
      locked: true,
      value: [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" "),
    },
    {
      label: "Gender",
      locked: true,
      value: c.gender === "female" ? "Female" : "Male",
    },
    {
      label: seeIdentity ? "Date of birth" : "Age",
      locked: true,
      value: (
        <>
          {seeIdentity ? `${formatDate(c.dateOfBirth)} · ` : ""}
          {elig.age} years{" "}
          <Badge $tone={elig.eligible ? "primary" : "danger"}>
            {elig.eligible ? `Within ${elig.band}` : `Outside ${elig.band}`}
          </Badge>
        </>
      ),
    },
    {
      label: "Email",
      locked: true,
      value: (
        <>
          {c.email}{" "}
          <Badge $tone={c.emailVerified ? "primary" : "neutral"}>
            {c.emailVerified ? "Verified" : "Unverified"}
          </Badge>
        </>
      ),
    },
    { label: "Phone", value: c.phone },
    { label: "Social media", value: c.socialMedia },
  ];

  const identity: Fact[] = [
    {
      label: "Identity check",
      locked: true,
      value: (
        <Badge $tone={c.identityVerified ? "primary" : "danger"}>
          {c.identityVerified ? "NIN verified" : "Not verified"}
        </Badge>
      ),
    },
    { label: "NIN", locked: true, value: seeIdentity ? c.nin : maskId(c.nin) },
    { label: "VIN", locked: true, value: seeIdentity ? c.vin : maskId(c.vin) },
    { label: "VIN check", locked: true, value: vinOutcome },
    { label: "Local government", value: c.lga },
    { label: "Senatorial district", value: c.senatorialDistrict },
    { label: "Ward", value: c.ward },
    { label: "Village", value: c.village },
  ];

  const residence: Fact[] = [
    { label: "State", value: c.residenceState },
    { label: "City", value: c.city },
    { label: "Address", value: c.address },
  ];

  const kin: Fact[] = [
    { label: "Name", value: c.nextOfKin },
    { label: "Relationship", value: c.nextOfKinRelationship },
    { label: "Phone", value: c.nextOfKinPhone },
  ];

  const work: Fact[] = [
    { label: "Education", value: c.education },
    { label: "Institution", value: institutionLabel(c) },
    { label: "Occupation", value: occupationLabel(c) },
  ];

  const record: Fact[] = [
    { label: "Reference code", value: c.referenceCode },
    {
      label: "Status",
      value: (
        <Badge
          $tone={c.applicationStatus === "submitted" ? "primary" : "secondary"}
        >
          {c.applicationStatus === "submitted" ? "Submitted" : "Draft"}
        </Badge>
      ),
    },
    { label: "Started", value: formatDate(c.appliedAt) },
    {
      label: "Submitted",
      value: c.submittedAt ? formatDate(c.submittedAt) : undefined,
    },
    {
      label: "Declarations",
      value: [
        c.declarationIdentity && "Identity",
        c.declarationAccuracy && "Accuracy",
        c.declarationTerms && "Terms",
      ]
        .filter(Boolean)
        .join(" · "),
    },
  ];

  const edit = (id: string) => editAction?.(id);

  return (
    <Grid>
      <FactCard
        title="Personal & contact"
        facts={personal}
        action={edit("personal")}
        note={
          editAction
            ? "Locked fields come from the verified identity and can't be edited."
            : undefined
        }
      />
      <FactCard
        title="Identity & origin"
        facts={identity}
        action={edit("origin")}
      />
      <FactCard
        title="Residence"
        facts={residence}
        action={edit("residence")}
      />
      <FactCard title="Next of kin" facts={kin} action={edit("kin")} />
      <FactCard title="Education & work" facts={work} action={edit("work")} />
      <FactCard title="Application record" facts={record} />
      <Wide>
        <FactCard
          title="About the applicant"
          action={edit("about")}
          facts={[
            { label: "Talents", value: c.talents },
            { label: "Languages", value: c.languages },
            { label: "Initiative", value: c.initiative },
            { label: "Why she should be Mbopo", value: <Prose>{c.why}</Prose> },
          ]}
        />
      </Wide>
    </Grid>
  );
}
