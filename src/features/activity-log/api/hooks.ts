import { useQuery } from "@tanstack/react-query";
import { getActivity } from ".";

export const useActivity = () =>
  useQuery({ queryKey: ["activity"], queryFn: getActivity });
