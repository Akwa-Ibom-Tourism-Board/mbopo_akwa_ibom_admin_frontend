import { AKWA_IBOM_LGAS, LGA_TO_DISTRICT } from "@/lib/constants";
import womanA from "@/assets/woman_1.webp";
import womanB from "@/assets/woman_2.webp";
import womanC from "@/assets/woman_3.webp";
import womanD from "@/assets/woman_4.webp";
import womanE from "@/assets/woman_5.webp";
import womanF from "@/assets/woman_6.webp";
import { stageOfPhase, type PhaseId } from "@/lib/phases";
import {
  EDUCATION_LEVELS,
  NIGERIAN_INSTITUTIONS,
  OCCUPATIONS,
} from "@/lib/applicationOptions";
import { buildPublicId } from "./documents";
import { deriveDisplayFields } from "../utils/derive";
import type { Candidate, CandidateDocument, CandidateStatus } from "../types";

// Dummy data only. 3 candidates per LGA × 31 LGAs = 93 — the output of the
// Local Government stage — with a deterministic spread of stages/statuses so
// filtering, the judging queue and the leaderboard have something to show.
const PHOTOS = [womanA, womanB, womanC, womanD, womanE, womanF];

// Placeholder uploads standing in for what Cloudinary would hold: a tiny PDF
// for the certificate and a short public sample clip for the video pitch.
const SAMPLE_PDF = `data:application/pdf;base64,${btoa(
  "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 52>>stream\nBT /F1 16 Tf 20 70 Td (Certificate of Origin) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF",
)}`;
const SAMPLE_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const FIRST = [
  "Ekaette",
  "Idara",
  "Mfon",
  "Nsikak",
  "Utibe",
  "Imaobong",
  "Aniekan",
  "Ifiok",
  "Uduak",
  "Emem",
  "Itoro",
  "Ubong",
  "Affiong",
  "Edidiong",
  "Inemesit",
  "Eno",
  "Mbuk",
  "Nkoyo",
  "Iniobong",
  "Akpan",
  "Ima",
  "Etido",
  "Ukeme",
  "Abasiama",
];
const LAST = [
  "Etim",
  "Udoh",
  "Akpan",
  "Okon",
  "Bassey",
  "Essien",
  "Umoh",
  "Inyang",
  "Effiong",
  "Ekong",
  "Ntia",
  "Asuquo",
  "Ibanga",
  "Edet",
  "Ekanem",
  "Udo",
  "Ita",
  "Ukpong",
  "Nkanta",
  "Archibong",
];
const REASONS = [
  "Providing false information",
  "Failing age/residency requirements",
  "Failing to submit required documentation",
];
const STORIES = [
  "I grew up watching my grandmother weave raffia mats for the Ekombi festival, and I want the world to see the craft that raised me.",
  "Beauty, to me, is service. I have spent three years mentoring girls in my community through after-school reading clubs.",
  "I want to show that Akwa Ibom's culture and its young people are our greatest tourism assets — I am ready to carry that message.",
];

// Seed pool: 4 per LGA × 31 LGAs = 124. Local Government is already closed:
//   • 3 per LGA (93) were finalized through and now wait, "advanced", for an
//     Admin to open Senatorial;
//   • the 4th in each LGA was not selected — or, in a few LGAs, was
//     disqualified (a recorded rule-break, not a normal cut).
function build(lgaIndex: number, k: number): Candidate {
  const i = lgaIndex * 4 + k;
  const lga = AKWA_IBOM_LGAS[lgaIndex]!;
  const first = FIRST[i % FIRST.length]!;
  const last = LAST[(i * 7 + lgaIndex) % LAST.length]!;

  const phase: PhaseId = "lga";
  let status: CandidateStatus = "advanced";
  let disqualificationReason: string | undefined;
  let eliminatedAt: PhaseId | undefined;
  let disqualifiedAt: PhaseId | undefined;

  if (k === 3) {
    if (lgaIndex % 6 === 2) {
      status = "disqualified";
      disqualifiedAt = "lga";
      disqualificationReason =
        REASONS[Math.floor(lgaIndex / 6) % REASONS.length] ?? REASONS[0];
    } else {
      status = "eliminated";
      eliminatedAt = "lga";
    }
  }
  const stage = stageOfPhase(phase);

  const hasProfile = i % 3 !== 0;
  const photo = PHOTOS[i % PHOTOS.length]!;
  const appliedMonth = (i % 3) + 6;
  const appliedAt = `2026-0${appliedMonth}-${String((i % 27) + 1).padStart(2, "0")}T10:00:00.000Z`;
  const submittedAt = `2026-0${appliedMonth}-${String((i % 27) + 2).padStart(2, "0")}T10:00:00.000Z`;
  const id = `cand-${String(i + 1).padStart(3, "0")}`;
  const occupation = OCCUPATIONS[(i * 3) % OCCUPATIONS.length]!;
  const institution =
    i % 11 === 0
      ? "Other"
      : NIGERIAN_INSTITUTIONS[(i * 13) % NIGERIAN_INSTITUTIONS.length]!;
  const livesInLagos = i % 9 === 0;
  const city = livesInLagos ? "Ikeja" : lga;
  const kin = FIRST[(i + 7) % FIRST.length]! + " " + last;

  const upload = (
    field: Parameters<typeof buildPublicId>[1],
    url: string,
    fileName: string,
    mimeType: string,
    bytes: number,
  ): CandidateDocument => ({
    url,
    publicId: buildPublicId(id, field),
    fileName,
    mimeType,
    bytes,
    uploadedAt: field === "avatar" ? appliedAt : submittedAt,
    uploadedBy: "Applicant",
    uploadedByRole: "applicant",
  });

  return deriveDisplayFields({
    id,
    // Account identity
    firstName: first,
    lastName: last,
    middleName: i % 4 === 0 ? FIRST[(i + 5) % FIRST.length] : undefined,
    gender: "female",
    // Ages 22–27 on the document's eligibility band.
    dateOfBirth: `${1999 + (i % 5)}-${String((i % 9) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    nin: String(20000000000 + i * 7377131),
    vin: `AK${String(10000000000000000 + i * 1299721).slice(0, 17)}`,
    ward: `Ward ${(i % 12) + 1}`,
    lga,
    senatorialDistrict: LGA_TO_DISTRICT[lga],
    identityVerified: true,
    isVinVerified: i % 23 === 7 ? false : true,
    vinVerificationFailedReason:
      i % 23 === 7 ? "VIN does not match the NIN record" : undefined,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    emailVerified: true,
    // Application
    phone: `0${7 + (i % 3)}${i % 2}${String(10000000 + i * 137911).slice(0, 8)}`,
    socialMedia:
      i % 3 === 0 ? `@${first.toLowerCase()}.${last.toLowerCase()}` : undefined,
    nextOfKin: kin,
    nextOfKinPhone: `0${7 + ((i + 1) % 3)}${(i + 1) % 2}${String(20000000 + i * 91123).slice(0, 8)}`,
    nextOfKinRelationship: [
      "Mother",
      "Father",
      "Sister",
      "Brother",
      "Aunt",
      "Guardian",
    ][i % 6]!,
    village: `${last} Village`,
    residenceState: livesInLagos ? "Lagos" : "Akwa Ibom",
    city,
    address: `${(i % 40) + 1} ${last} Road, ${city}`,
    education: EDUCATION_LEVELS[i % EDUCATION_LEVELS.length]!,
    institution,
    institutionOther:
      institution === "Other" ? "Heritage College of Arts" : undefined,
    occupation,
    occupationOther: occupation === "Other" ? "Beauty therapist" : undefined,
    talents: [
      "Singing and public speaking",
      "Traditional dance",
      "Poetry and drama",
      "Fashion styling",
    ][i % 4]!,
    languages: i % 2 === 0 ? "English, Ibibio" : "English, Efik, Annang",
    initiative:
      i % 2 === 0
        ? "Runs a monthly reading club for girls in the community."
        : undefined,
    why: STORIES[i % STORIES.length]!,
    declarationIdentity: true,
    declarationAccuracy: true,
    declarationTerms: true,
    applicationStatus: "submitted",
    referenceCode: `MBP-2026-${String(i + 1).padStart(5, "0")}`,
    submittedAt,
    appliedAt,
    documents: {
      avatar: upload("avatar", photo, "profile.jpg", "image/jpeg", 184_000),
      certificateOfOrigin: upload(
        "certificateOfOrigin",
        SAMPLE_PDF,
        "certificate-of-origin.pdf",
        "application/pdf",
        21_000,
      ),
      fullImage: upload(
        "fullImage",
        PHOTOS[(i + 1) % PHOTOS.length]!,
        "full-length-1.jpg",
        "image/jpeg",
        356_000,
      ),
      fullImage2: upload(
        "fullImage2",
        PHOTOS[(i + 2) % PHOTOS.length]!,
        "full-length-2.jpg",
        "image/jpeg",
        342_000,
      ),
      videoPitch: upload(
        "videoPitch",
        SAMPLE_VIDEO,
        "video-pitch.mp4",
        "video/mp4",
        1_050_000,
      ),
    },
    // Derived display fields — filled in by deriveDisplayFields below.
    name: "",
    photo,
    applicantPhotos: [],
    story: "",
    // Judging state
    phase,
    stage,
    status,
    disqualificationReason,
    eliminatedAt,
    disqualifiedAt,
    // Public profile
    bio: hasProfile
      ? `${first} is a ${occupation.toLowerCase()} from ${lga}, passionate about culture, community and Beauty with Purpose.`
      : undefined,
    additionalPhotos: hasProfile ? [PHOTOS[(i + 2) % PHOTOS.length]!] : [],
    additionalVideos:
      i % 5 === 0
        ? [
            {
              title: "Meet the candidate",
              youtubeUrl: "https://youtu.be/jNQXAC9IVRw",
            },
          ]
        : [],
    voteCount: ((i * 797) % 1900) + 25,
  });
}

export const MOCK_CANDIDATES: Candidate[] = AKWA_IBOM_LGAS.flatMap(
  (_, lgaIndex) => [0, 1, 2, 3].map((k) => build(lgaIndex, k)),
);
