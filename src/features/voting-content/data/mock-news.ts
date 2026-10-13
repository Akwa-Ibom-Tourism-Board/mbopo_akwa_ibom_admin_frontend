import type { NewsPost } from "../types";
import heroBg from "@/assets/hero-bg.webp";
import woman6 from "@/assets/woman_6.webp";
import woman5 from "@/assets/woman_5.webp";
import stage from "@/assets/mbopo-hero-1.webp";
import woman3 from "@/assets/woman_3.webp";
import woman1 from "@/assets/woman_1.webp";

export const MOCK_NEWS: NewsPost[] = [
  {
    id: "festival-returns",
    title: "Mbopo Festival returns with a brighter, bolder showcase",
    summary:
      "Akwa Ibom's cultural and tourism experience takes center stage once more as communities, artisans, and investors unite around the next wave of heritage revival.",
    coverImage: heroBg,
    images: [woman6, woman5],
    body: [
      "The Mbopo Akwa Ibom experience is back with renewed energy, spotlighting the state's rich cultural heritage, hospitality, and creative economy.",
      "Stakeholders from the tourism, hospitality, and creative sectors have been working together to create a more immersive platform that not only celebrates culture but also connects visitors to authentic local experiences.",
      "From artisan showcases to destination retail and community storytelling, the festival promises a compelling blend of beauty, heritage, and economic opportunity for families, visitors, and local entrepreneurs alike.",
    ],
    publishedAt: "2026-09-02T09:00:00.000Z",
  },
  {
    id: "coastal-journeys",
    title: "Coastal journeys and hidden gems are attracting new visitors",
    summary:
      "Travelers are discovering the state's beaches, waterways, and cultural landmarks as interest in authentic coastal experiences grows.",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
    ],
    body: [
      "Akwa Ibom's coastal destinations continue to stand out as some of the most compelling spaces for leisure and cultural discovery in the region.",
      "Visitors are increasingly drawn to the state's unique mix of beachside relaxation, live music, local cuisine, and tourism-linked enterprise opportunities.",
      "As more travelers seek experiences that feel personal and rooted in place, the state's tourism identity is gaining greater visibility across domestic and regional audiences.",
    ],
    publishedAt: "2026-08-21T12:00:00.000Z",
  },
  {
    id: "artisan-market",
    title: "Akwa Ibom artisans are turning heritage into opportunity",
    summary:
      "Community-driven enterprise is building momentum as local makers share the stories behind their crafts, fabrics, and culinary traditions.",
    coverImage: stage,
    body: [
      "The state's artisan communities continue to be a cornerstone of the tourism story, creating experiences that are both visually rich and materially rooted in local identities.",
      "Small producers are combining age-old craftsmanship with contemporary presentation, giving visitors the chance to appreciate the value of Akwa Ibom's heritage while also supporting local livelihoods.",
    ],
    publishedAt: "2026-08-12T10:30:00.000Z",
  },
  {
    id: "film-and-culture",
    title: "Film, fashion, and culture are shaping the next tourism chapter",
    summary:
      "Creative storytelling is emerging as a key strategy in drawing attention to the state's landscapes, talent, and cultural narratives.",
    coverImage: woman3,
    body: [
      "Across the state, a new generation of creatives is using media and storytelling to connect urban audiences with the beauty and promise of local communities.",
      "The intersection of film, fashion, and cultural events is turning tourism into a more dynamic and translatable experience — one that visitors can remember and share.",
    ],
    publishedAt: "2026-07-28T14:00:00.000Z",
  },
  {
    id: "hospitality-growth",
    title: "Hospitality projects are driving new confidence in local travel",
    summary:
      "A pipeline of guest experiences and service upgrades is helping raise the standard of welcome across the state.",
    coverImage:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    body: [
      "From accommodation upgrades to curated hospitality experiences, investor confidence is helping build a more visitor-friendly tourist ecosystem.",
      "The change is visible in the quality of service, the attention to detail, and the growing ability of local operators to offer premium but culturally grounded experiences.",
    ],
    publishedAt: "2026-07-15T08:30:00.000Z",
  },
  {
    id: "community-tourism",
    title: "Community tourism is giving more towns a voice on the map",
    summary:
      "Smaller communities are becoming focal points for cultural exchange and destination-building across the state.",
    coverImage: woman1,
    body: [
      "Community-led tourism initiatives are turning local stories, food traditions, and neighborhood hospitality into meaningful visitor experiences.",
      "Their growth matters because it allows more communities to benefit from the broader tourism economy while preserving the authenticity that makes the destination distinct.",
    ],
    publishedAt: "2026-06-30T11:00:00.000Z",
  },
  {
    id: "nature-trails",
    title: "Nature trails and eco-routes are shaping a new travel narrative",
    summary:
      "Visitors are increasingly exploring the state's greener spaces, nature trails, and lesser-known scenic routes.",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Beyond beach and culture experiences, eco-travel is emerging as one of the state's strongest differentiators.",
      "Nature trails and conservation-linked experiences make it possible to slow down, reconnect with local landscapes, and tell a richer story about Akwa Ibom's environmental heritage.",
    ],
    publishedAt: "2026-06-12T15:00:00.000Z",
  },
  {
    id: "food-culture",
    title: "Local food culture is becoming a destination draw in its own right",
    summary:
      "The state's cuisine, hospitality, and event experiences are beginning to shape how people talk about Akwa Ibom travel.",
    coverImage:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Food has long been a powerful connector between visitors and communities, and Akwa Ibom's culinary traditions are increasingly central to how people experience the state.",
      "From street food to signature event menus, food culture gives visitors a direct window into local identity and communal hospitality.",
    ],
    publishedAt: "2026-05-25T17:00:00.000Z",
  },
];
