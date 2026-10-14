import institutionsData from "./institutions.json";

// Option lists and rules for an applicant's record. These mirror the applicant
// platform (mbopo_akwa_ibom_design) and its backend so what staff enter here
// is always something the applicant could have entered themselves.

// Matches the backend's NIGERIAN_PHONE_REGEX exactly (configurations/constants.ts).
export const NIGERIAN_PHONE_REGEX = /^(0[789][01]\d{8}|234[789][01]\d{8})$/;
export const PHONE_MESSAGE =
  "Enter a valid Nigerian phone number, e.g. 08012345678";

// Backend: MINIMUM_ELIGIBLE_AGE / MAXIMUM_ELIGIBLE_AGE.
export const MINIMUM_ELIGIBLE_AGE = 22;
export const MAXIMUM_ELIGIBLE_AGE = 27;

export const EDUCATION_LEVELS = [
  "HND",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
] as const;

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

// Paired with an "Other" option that reveals a free-text field.
export const OCCUPATIONS = [
  "Student",
  "NYSC Corps Member",
  "Entrepreneur / Business Owner",
  "Civil Servant",
  "Teacher / Educator",
  "Banker / Finance Professional",
  "Accountant",
  "Medical Doctor",
  "Nurse / Healthcare Worker",
  "Pharmacist",
  "Lawyer",
  "Engineer",
  "Software Developer / IT Professional",
  "Architect",
  "Fashion Designer",
  "Make-up Artist",
  "Hair Stylist",
  "Caterer / Chef",
  "Event Planner",
  "Content Creator / Influencer",
  "Model",
  "Actress / Performing Artist",
  "Musician",
  "Journalist / Media Professional",
  "Marketing / PR Professional",
  "Real Estate Professional",
  "Agripreneur / Farmer",
  "Public Servant / Government Worker",
  "Unemployed",
  "Other",
] as const;

// 376 Nigerian universities, polytechnics and colleges (see the applicant
// platform's data/institutions.ts), plus "Other".
export const NIGERIAN_INSTITUTIONS: readonly string[] = institutionsData;
export const INSTITUTION_OPTIONS: readonly string[] = [
  ...NIGERIAN_INSTITUTIONS,
  "Other",
];

export const NEXT_OF_KIN_RELATIONSHIPS = [
  "Mother",
  "Father",
  "Sister",
  "Brother",
  "Aunt",
  "Uncle",
  "Guardian",
  "Spouse",
  "Other relative",
] as const;
