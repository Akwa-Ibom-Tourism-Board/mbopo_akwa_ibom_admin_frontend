import { AKWA_IBOM_LGAS, LGA_TO_DISTRICT } from "@/lib/constants";
import womanA from "@/assets/woman_1.webp";
import womanB from "@/assets/woman_2.webp";
import womanC from "@/assets/woman_3.webp";
import womanD from "@/assets/woman_4.webp";
import womanE from "@/assets/woman_5.webp";
import womanF from "@/assets/woman_6.webp";
import type { Candidate, CandidateStage, CandidateStatus } from "../types";

// Dummy data only. 3 candidates per LGA × 31 LGAs = 93 — the output of the
// Local Government stage — with a deterministic spread of stages/statuses so
// filtering, the judging queue and the leaderboard have something to show.
const PHOTOS = [womanA, womanB, womanC, womanD, womanE, womanF];

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
const EDUCATION = [
  "SSCE / WAEC",
  "OND",
  "HND",
  "BSc (in view)",
  "BSc",
  "MSc (in view)",
];
const OCCUPATIONS = [
  "Student",
  "NYSC Corps Member",
  "Entrepreneur",
  "Teacher",
  "Nurse",
  "Content Creator",
  "Fashion Designer",
  "Civil Servant",
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

const SENATORIAL_LGA_INDEXES = new Set([0, 4, 8, 12, 16, 20, 24, 28]);
const FINALE_LGA_INDEXES = new Set([0, 4]);

function build(lgaIndex: number, k: number): Candidate {
  const i = lgaIndex * 3 + k;
  const lga = AKWA_IBOM_LGAS[lgaIndex]!;
  const first = FIRST[i % FIRST.length]!;
  const last = LAST[(i * 7 + lgaIndex) % LAST.length]!;

  let stage: CandidateStage = "lga_selection";
  let status: CandidateStatus = "active";
  let disqualificationReason: string | undefined;

  if (SENATORIAL_LGA_INDEXES.has(lgaIndex)) {
    stage = "senatorial_selection";
    if (k === 0) status = "advanced";
  }
  if (FINALE_LGA_INDEXES.has(lgaIndex) && k === 0) {
    stage = "grand_finale";
    status = "active";
  }
  if (stage === "lga_selection" && lgaIndex % 5 === 1 && k === 0) {
    status = "advanced";
  }
  if (stage === "lga_selection" && i % 29 === 5) {
    status = "disqualified";
    disqualificationReason = REASONS[Math.floor(i / 29) % REASONS.length];
  }

  const hasProfile = i % 3 !== 0;
  const photo = PHOTOS[i % PHOTOS.length]!;

  return {
    id: `cand-${String(i + 1).padStart(3, "0")}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    phone: `+23480${String(30000000 + i * 137911).slice(0, 8)}`,
    dateOfBirth: `${1998 + (i % 9)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    lga,
    senatorialDistrict: LGA_TO_DISTRICT[lga],
    education: EDUCATION[i % EDUCATION.length]!,
    occupation: OCCUPATIONS[(i * 3) % OCCUPATIONS.length]!,
    ninStatus: i % 17 === 4 ? "pending" : "verified",
    vinStatus: i % 13 === 6 ? "pending" : "verified",
    photo,
    applicantPhotos: [photo, PHOTOS[(i + 1) % PHOTOS.length]!],
    videoPitchUrl:
      i % 4 === 0 ? undefined : "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    story: STORIES[i % STORIES.length]!,
    appliedAt: `2026-0${(i % 3) + 6}-${String((i % 27) + 1).padStart(2, "0")}T10:00:00.000Z`,
    stage,
    status,
    disqualificationReason,
    bio: hasProfile
      ? `${first} is a ${OCCUPATIONS[(i * 3) % OCCUPATIONS.length]!.toLowerCase()} from ${lga}, passionate about culture, community and Beauty with Purpose.`
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
  };
}

export const MOCK_CANDIDATES: Candidate[] = AKWA_IBOM_LGAS.flatMap(
  (_, lgaIndex) => [0, 1, 2].map((k) => build(lgaIndex, k)),
);
