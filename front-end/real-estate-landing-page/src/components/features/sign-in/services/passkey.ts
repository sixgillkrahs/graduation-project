import { RegistrationResponseJSON } from "@simplewebauthn/browser";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { IResp } from "@/@types/service";
import SignInService from "./service";

export const useRegisterPasskeyAfterLogin = (): UseMutationResult<
  IResp<any>,
  Error,
  void,
  void
> => {
  return useMutation({
    mutationFn: () => {
      return SignInService.registerPasskey();
    },
  });
};

export const useVerifyPasskeyAfterLogin = (): UseMutationResult<
  IResp<void>,
  Error,
  RegistrationResponseJSON,
  void
> => {
  return useMutation({
    mutationFn: (credential: RegistrationResponseJSON) => {
      return SignInService.verifyPasskey(credential);
    },
  });
};
