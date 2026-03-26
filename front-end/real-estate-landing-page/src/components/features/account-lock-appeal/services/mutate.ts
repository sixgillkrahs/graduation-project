import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import AccountLockAppealService from "./service";

export const useSubmitAccountLockAppeal = (): UseMutationResult<
  IResp<{ success: boolean }>,
  Error,
  IAccountLockAppealService.SubmitPayload,
  void
> => {
  return useMutation({
    mutationFn: (payload) => AccountLockAppealService.submit(payload),
    meta: {
      ERROR_SOURCE: "Could not submit account lock appeal",
    },
  });
};
