import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNewsPost,
  deleteSponsor,
  getNewsPosts,
  getSponsors,
  getVoteTiers,
  saveNewsPost,
  saveSponsor,
  saveVoteTiers,
} from ".";

const keys = {
  tiers: ["voting-content", "tiers"] as const,
  news: ["voting-content", "news"] as const,
  sponsors: ["voting-content", "sponsors"] as const,
};

function useMutate<A, R>(fn: (arg: A) => Promise<R>, key: readonly string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export const useVoteTiers = () =>
  useQuery({ queryKey: keys.tiers, queryFn: getVoteTiers });
export const useSaveVoteTiers = () => useMutate(saveVoteTiers, keys.tiers);

export const useNewsPosts = () =>
  useQuery({ queryKey: keys.news, queryFn: getNewsPosts });
export const useSaveNewsPost = () => useMutate(saveNewsPost, keys.news);
export const useDeleteNewsPost = () => useMutate(deleteNewsPost, keys.news);

export const useSponsors = () =>
  useQuery({ queryKey: keys.sponsors, queryFn: getSponsors });
export const useSaveSponsor = () => useMutate(saveSponsor, keys.sponsors);
export const useDeleteSponsor = () => useMutate(deleteSponsor, keys.sponsors);
