import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import ProfileService from "./service";
import { RegistrationResponseJSON } from "@simplewebauthn/browser";

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

export const useRegisterPasskey = (): UseMutationResult<
  IResp<{ option: any }>,
  Error,
  void,
  void
> => {
  return useMutation({
    mutationFn: () => {
      return ProfileService.registerPasskey();
    },
    meta: {
      ERROR_SOURCE: "[Register passkey failed]: The old password is incorrect",
      SUCCESS_MESSAGE: "Register passkey successfully",
    },
  });
};

export const useVerifyPasskey = (): UseMutationResult<
  IResp<void>,
  Error,
  RegistrationResponseJSON,
  void
> => {
  return useMutation({
    mutationFn: (data: RegistrationResponseJSON) => {
      return ProfileService.verifyPasskey(data);
    },
    meta: {
      ERROR_SOURCE: "[Verify passkey failed]: The passkey is incorrect",
      SUCCESS_MESSAGE: "Verify passkey successfully",
    },
  });
};
