// Mirrors AKWA_IBOM_LGAS in mbopo_akwa_ibom_design (and the backend) —
// names must match character-for-character.
export const AKWA_IBOM_LGAS = [
  "Abak",
  "Eastern Obolo",
  "Eket",
  "Esit Eket",
  "Essien Udim",
  "Etim Ekpo",
  "Etinan",
  "Ibeno",
  "Ibesikpo Asutan",
  "Ibiono Ibom",
  "Ika",
  "Ikono",
  "Ikot Abasi",
  "Ikot Ekpene",
  "Ini",
  "Itu",
  "Mbo",
  "Mkpat Enin",
  "Nsit Atai",
  "Nsit Ibom",
  "Nsit Ubium",
  "Obot Akara",
  "Okobo",
  "Onna",
  "Oron",
  "Oruk Anam",
  "Udung Uko",
  "Ukanafun",
  "Uruan",
  "Urue-Offong/Oruko",
  "Uyo",
] as const;

export type Lga = (typeof AKWA_IBOM_LGAS)[number];

export const SENATORIAL_DISTRICTS = [
  "Akwa Ibom North-East",
  "Akwa Ibom North-West",
  "Akwa Ibom South",
] as const;

export type SenatorialDistrict = (typeof SENATORIAL_DISTRICTS)[number];

// Reference data compiled from public sources (BUILD_ME.md §8) — verify
// against the State's official list before relying on it for real results.
export const LGA_TO_DISTRICT: Record<Lga, SenatorialDistrict> = {
  Etinan: "Akwa Ibom North-East",
  "Ibesikpo Asutan": "Akwa Ibom North-East",
  "Ibiono Ibom": "Akwa Ibom North-East",
  Itu: "Akwa Ibom North-East",
  "Nsit Atai": "Akwa Ibom North-East",
  "Nsit Ibom": "Akwa Ibom North-East",
  "Nsit Ubium": "Akwa Ibom North-East",
  Uruan: "Akwa Ibom North-East",
  Uyo: "Akwa Ibom North-East",
  Abak: "Akwa Ibom North-West",
  "Essien Udim": "Akwa Ibom North-West",
  "Etim Ekpo": "Akwa Ibom North-West",
  Ika: "Akwa Ibom North-West",
  Ikono: "Akwa Ibom North-West",
  "Ikot Ekpene": "Akwa Ibom North-West",
  Ini: "Akwa Ibom North-West",
  "Obot Akara": "Akwa Ibom North-West",
  "Oruk Anam": "Akwa Ibom North-West",
  Ukanafun: "Akwa Ibom North-West",
  "Eastern Obolo": "Akwa Ibom South",
  Eket: "Akwa Ibom South",
  "Esit Eket": "Akwa Ibom South",
  Ibeno: "Akwa Ibom South",
  "Ikot Abasi": "Akwa Ibom South",
  Mbo: "Akwa Ibom South",
  "Mkpat Enin": "Akwa Ibom South",
  Okobo: "Akwa Ibom South",
  Onna: "Akwa Ibom South",
  Oron: "Akwa Ibom South",
  "Udung Uko": "Akwa Ibom South",
  "Urue-Offong/Oruko": "Akwa Ibom South",
};
