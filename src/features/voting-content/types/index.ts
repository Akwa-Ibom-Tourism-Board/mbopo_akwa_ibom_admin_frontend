// Same shapes as mbopo_akwa_ibom_voting's VoteTier / PictureNewsItem /
// Sponsor so the voting site can read what this app writes. One addition:
// NewsPost.videoUrls, since Media attaches YouTube links to posts (§3, §7) —
// the voting site's type needs the same optional field when wired up.
export interface VoteTier {
  votes: number;
  priceNaira: number;
}

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  images?: string[];
  videoUrls?: string[];
  body: string[];
  publishedAt: string; // ISO
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  description: string;
  websiteUrl?: string;
}
