import { MOCK_NEWS } from "../data/mock-news";
import { MOCK_SPONSORS } from "../data/mock-sponsors";
import { MOCK_VOTE_TIERS } from "../data/mock-tiers";
import type { NewsPost, Sponsor, VoteTier } from "../types";

// Dummy data layer: async signatures a real API would have, in-memory state.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));
const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

let tiers: VoteTier[] = MOCK_VOTE_TIERS.map((t) => ({ ...t }));
let news: NewsPost[] = MOCK_NEWS.map((n) => ({ ...n }));
let sponsors: Sponsor[] = MOCK_SPONSORS.map((s) => ({ ...s }));

export async function getVoteTiers(): Promise<VoteTier[]> {
  await delay();
  return tiers.map((t) => ({ ...t }));
}

// Replaces the whole tier list (the editor saves it as one unit).
export async function saveVoteTiers(next: VoteTier[]): Promise<VoteTier[]> {
  await delay();
  const valid =
    next.length > 0 &&
    next.every(
      (t) =>
        Number.isInteger(t.votes) &&
        t.votes > 0 &&
        Number.isInteger(t.priceNaira) &&
        t.priceNaira > 0,
    ) &&
    new Set(next.map((t) => t.votes)).size === next.length;
  if (!valid) throw new Error("Tiers must be unique, positive whole numbers.");
  tiers = [...next].sort((a, b) => a.votes - b.votes).map((t) => ({ ...t }));
  return tiers.map((t) => ({ ...t }));
}

export async function getNewsPosts(): Promise<NewsPost[]> {
  await delay();
  return [...news].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function saveNewsPost(
  post: Omit<NewsPost, "id"> & { id?: string },
): Promise<NewsPost> {
  await delay();
  const saved: NewsPost = { ...post, id: post.id ?? newId("news") };
  news = post.id
    ? news.map((n) => (n.id === post.id ? saved : n))
    : [saved, ...news];
  return saved;
}

export async function deleteNewsPost(id: string): Promise<void> {
  await delay();
  news = news.filter((n) => n.id !== id);
}

export async function getSponsors(): Promise<Sponsor[]> {
  await delay();
  return sponsors.map((s) => ({ ...s }));
}

export async function saveSponsor(
  sponsor: Omit<Sponsor, "id"> & { id?: string },
): Promise<Sponsor> {
  await delay();
  const saved: Sponsor = { ...sponsor, id: sponsor.id ?? newId("sponsor") };
  sponsors = sponsor.id
    ? sponsors.map((s) => (s.id === sponsor.id ? saved : s))
    : [...sponsors, saved];
  return saved;
}

export async function deleteSponsor(id: string): Promise<void> {
  await delay();
  sponsors = sponsors.filter((s) => s.id !== id);
}
