import { z } from "zod";
import { AKWA_IBOM_LGAS } from "@/lib/constants";
import {
  EDUCATION_LEVELS,
  INSTITUTION_OPTIONS,
  NEXT_OF_KIN_RELATIONSHIPS,
  NIGERIAN_PHONE_REGEX,
  NIGERIAN_STATES,
  OCCUPATIONS,
  PHONE_MESSAGE,
} from "@/lib/applicationOptions";
import {
  CONTAINS_LETTER_MESSAGE,
  CONTAINS_LETTER_REGEX,
  NAME_MESSAGE,
  NAME_REGEX,
  wordCount,
} from "@/lib/validation";

// The parts of an application staff can correct. Names, gender, date of birth,
// NIN, VIN, email and the profile photo come from the applicant's verified
// identity and are deliberately NOT here — they can't be edited at all.
// Limits mirror the backend's Joi draft schema (application.routes.ts).
export type SectionId =
  "personal" | "origin" | "residence" | "kin" | "work" | "about";

export const SECTION_LABELS: Record<SectionId, string> = {
  personal: "Personal & contact",
  origin: "Identity & origin",
  residence: "Residence",
  kin: "Next of kin",
  work: "Education & work",
  about: "About the applicant",
};

const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}`)
    .max(max, `Keep this under ${max} characters`);

const place = (label: string, max: number) =>
  text(label, max).regex(CONTAINS_LETTER_REGEX, CONTAINS_LETTER_MESSAGE);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .or(z.literal(""));

const phone = z.string().trim().regex(NIGERIAN_PHONE_REGEX, PHONE_MESSAGE);

const oneOf = <T extends readonly string[]>(options: T, message: string) =>
  z.string().refine((v) => options.includes(v), message);

const shapes = {
  personal: {
    phone,
    socialMedia: optionalText(200),
  },
  origin: {
    lga: oneOf(AKWA_IBOM_LGAS, "Choose a valid Akwa Ibom local government"),
    ward: optionalText(100),
    village: place("a village", 150),
  },
  residence: {
    residenceState: oneOf(NIGERIAN_STATES, "Choose a state"),
    city: place("a city", 100),
    address: text("an address", 500),
  },
  kin: {
    nextOfKin: text("a name", 100).regex(NAME_REGEX, NAME_MESSAGE),
    nextOfKinRelationship: text("a relationship", 50).regex(
      NAME_REGEX,
      NAME_MESSAGE,
    ),
    nextOfKinPhone: phone,
  },
  work: {
    education: oneOf(EDUCATION_LEVELS, "Choose an education level"),
    institution: oneOf(INSTITUTION_OPTIONS, "Choose an institution"),
    institutionOther: optionalText(150),
    occupation: oneOf(OCCUPATIONS, "Choose an occupation"),
    occupationOther: optionalText(100),
  },
  about: {
    talents: text("talents", 1000),
    languages: text("languages", 300),
    initiative: optionalText(2000),
    why: text("her story", 3000).refine(
      (v) => wordCount(v) >= 10 && wordCount(v) <= 300,
      "Use between 10 and 300 words",
    ),
  },
} as const;

// "Other" in a dropdown requires the typed value beside it (backend: Joi
// .when("occupation"/"institution", is: "Other")).
const workSchema = z.object(shapes.work).superRefine((v, ctx) => {
  if (v.institution === "Other" && !v.institutionOther?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["institutionOther"],
      message: "Enter the institution",
    });
  }
  if (v.occupation === "Other" && !v.occupationOther?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["occupationOther"],
      message: "Enter the occupation",
    });
  }
});

export const sectionSchemas = {
  personal: z.object(shapes.personal),
  origin: z.object(shapes.origin),
  residence: z.object(shapes.residence),
  kin: z.object(shapes.kin),
  work: workSchema,
  about: z.object(shapes.about),
} as const;

export type SectionValues<S extends SectionId> = z.infer<
  (typeof sectionSchemas)[S]
>;

// ── Form field definitions: drive the edit dialogs ────────────────────────
export interface FieldDef {
  name: string;
  label: string;
  kind: "text" | "tel" | "textarea" | "select" | "combobox";
  options?: readonly string[];
  suggestions?: readonly string[];
  rows?: number;
  hint?: string;
  optional?: boolean;
  // Only show when another field has this value ("Other" free-text fields).
  showWhen?: { field: string; equals: string };
  placeholder?: string;
}

export const SECTION_FIELDS: Record<SectionId, FieldDef[]> = {
  personal: [
    { name: "phone", label: "Phone", kind: "tel", placeholder: "08012345678" },
    {
      name: "socialMedia",
      label: "Social media",
      kind: "text",
      optional: true,
      hint: "Handle or link (optional)",
    },
  ],
  origin: [
    {
      name: "lga",
      label: "Local government",
      kind: "select",
      options: AKWA_IBOM_LGAS,
    },
    { name: "ward", label: "Ward", kind: "text", optional: true },
    { name: "village", label: "Village", kind: "text" },
  ],
  residence: [
    {
      name: "residenceState",
      label: "State of residence",
      kind: "select",
      options: NIGERIAN_STATES,
    },
    { name: "city", label: "City", kind: "text" },
    { name: "address", label: "Address", kind: "textarea", rows: 3 },
  ],
  kin: [
    { name: "nextOfKin", label: "Name", kind: "text" },
    {
      name: "nextOfKinRelationship",
      label: "Relationship",
      kind: "text",
      suggestions: NEXT_OF_KIN_RELATIONSHIPS,
    },
    {
      name: "nextOfKinPhone",
      label: "Phone",
      kind: "tel",
      placeholder: "08012345678",
    },
  ],
  work: [
    {
      name: "education",
      label: "Education",
      kind: "select",
      options: EDUCATION_LEVELS,
    },
    {
      name: "institution",
      label: "Institution",
      kind: "combobox",
      options: INSTITUTION_OPTIONS,
    },
    {
      name: "institutionOther",
      label: "Institution (other)",
      kind: "text",
      showWhen: { field: "institution", equals: "Other" },
    },
    {
      name: "occupation",
      label: "Occupation",
      kind: "select",
      options: OCCUPATIONS,
    },
    {
      name: "occupationOther",
      label: "Occupation (other)",
      kind: "text",
      showWhen: { field: "occupation", equals: "Other" },
    },
  ],
  about: [
    { name: "talents", label: "Talents", kind: "textarea", rows: 3 },
    { name: "languages", label: "Languages", kind: "text" },
    {
      name: "initiative",
      label: "Initiative",
      kind: "textarea",
      rows: 3,
      optional: true,
    },
    {
      name: "why",
      label: "Why she should be Mbopo",
      kind: "textarea",
      rows: 7,
      hint: "10–300 words",
    },
  ],
};

// Free-text fields the backend sentence-cases on every save
// (application.helpers.ts SENTENCE_CASE_FIELDS). Dropdown values and codes are
// never touched.
export const SENTENCE_CASE_FIELDS = [
  "nextOfKin",
  "nextOfKinRelationship",
  "village",
  "city",
  "address",
  "talents",
  "languages",
  "initiative",
  "why",
  "occupationOther",
  "institutionOther",
] as const;
