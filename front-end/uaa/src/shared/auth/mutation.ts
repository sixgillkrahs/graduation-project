import AuthService from "./AuthService";
import { queryClient } from "@shared/queryClient";
import type { IResp } from "@shared/types/service";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";

export const useLogout = (): UseMutationResult<IResp<void>, Error, void, unknown> => {
  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.clear();
    },
    meta: {
      ERROR_SOURCE: "[Logout failed]",
      SUCCESS_MESSAGE: "Logged out successfully",
    },
  });
};
