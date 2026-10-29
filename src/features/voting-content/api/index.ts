import { request } from "@/lib/http";
import type { NewsPost, Sponsor, VoteTier } from "../types";

export async function getVoteTiers(): Promise<VoteTier[]> {
  return request<VoteTier[]>("/admin/voting-content/pricing");
}

export async function saveVoteTiers(next: VoteTier[]): Promise<VoteTier[]> {
  return request<VoteTier[]>("/admin/voting-content/pricing", {
    method: "PUT",
    body: JSON.stringify({ tiers: next }),
  });
}

interface BackendNewsPost {
  id: string;
  title: string;
  summary: string;
  body: string[];
  coverImageUrl: string | null;
  images: string[];
  videoUrls: string[];
  publishedAt: string;
}

const fromBackendNews = (p: BackendNewsPost): NewsPost => ({
  id: p.id,
  title: p.title,
  summary: p.summary,
  coverImage: p.coverImageUrl ?? "",
  images: p.images,
  videoUrls: p.videoUrls,
  body: p.body,
  publishedAt: p.publishedAt,
});

export async function getNewsPosts(): Promise<NewsPost[]> {
  const posts = await request<BackendNewsPost[]>("/admin/voting-content/news");
  return posts.map(fromBackendNews);
}

export async function saveNewsPost(post: Omit<NewsPost, "id"> & { id?: string }): Promise<NewsPost> {
  const saved = await request<BackendNewsPost>("/admin/voting-content/news", {
    method: "POST",
    body: JSON.stringify({
      id: post.id,
      title: post.title,
      summary: post.summary,
      body: post.body,
      coverImageUrl: post.coverImage || null,
      images: post.images,
      videoUrls: post.videoUrls,
      publishedAt: post.publishedAt,
    }),
  });
  return fromBackendNews(saved);
}

export async function deleteNewsPost(id: string): Promise<void> {
  await request(`/admin/voting-content/news/${id}`, { method: "DELETE" });
}

interface BackendSponsor {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
}

const fromBackendSponsor = (s: BackendSponsor): Sponsor => ({
  id: s.id,
  name: s.name,
  logo: s.logoUrl ?? "",
  description: s.description ?? "",
  websiteUrl: s.websiteUrl ?? undefined,
});

export async function getSponsors(): Promise<Sponsor[]> {
  const sponsors = await request<BackendSponsor[]>("/admin/voting-content/sponsors");
  return sponsors.map(fromBackendSponsor);
}

export async function saveSponsor(sponsor: Omit<Sponsor, "id"> & { id?: string }): Promise<Sponsor> {
  const saved = await request<BackendSponsor>("/admin/voting-content/sponsors", {
    method: "POST",
    body: JSON.stringify({
      id: sponsor.id,
      name: sponsor.name,
      description: sponsor.description || null,
      websiteUrl: sponsor.websiteUrl || null,
      logoUrl: sponsor.logo || null,
    }),
  });
  return fromBackendSponsor(saved);
}

export async function deleteSponsor(id: string): Promise<void> {
  await request(`/admin/voting-content/sponsors/${id}`, { method: "DELETE" });
}
