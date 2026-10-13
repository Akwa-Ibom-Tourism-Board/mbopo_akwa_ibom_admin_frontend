import type { VoteTier } from "../types";

// Matches the voting site's seed: flat ₦100 per vote.
export const BASE_VOTE_PRICE_NAIRA = 100;

export const MOCK_VOTE_TIERS: VoteTier[] = [1, 5, 10, 20, 50, 100].map(
  (votes) => ({
    votes,
    priceNaira: votes * BASE_VOTE_PRICE_NAIRA,
  }),
);
