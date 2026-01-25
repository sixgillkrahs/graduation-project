import { Id } from "@/@types/service";
import { useQuery } from "@tanstack/react-query";
import { ProfileQueryKey } from "./config";
import ProfileService from "./service";

export const useProfile = () => {
  return useQuery({
    queryKey: [ProfileQueryKey.profile],
    queryFn: () => ProfileService.profile(),
  });
};
