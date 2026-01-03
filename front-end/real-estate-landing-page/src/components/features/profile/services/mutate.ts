import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import ProfileService from "./service";

export const useChangePassword = (): UseMutationResult<
  IResp<void>,
  Error,
  IProfileService.ChangePasswordRequest,
  void
> => {
  return useMutation({
    mutationFn: (data: IProfileService.ChangePasswordRequest) => {
      return ProfileService.changePassword(data);
    },
    meta: {
      ERROR_SOURCE: "[Change password failed]: The old password is incorrect",
      SUCCESS_MESSAGE: "Change password successfully",
    },
  });
};
