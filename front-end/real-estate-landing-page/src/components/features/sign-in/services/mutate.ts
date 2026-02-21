import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import SignInService from "./service";

export const useSignIn = (): UseMutationResult<
  IResp<void>,
  Error,
  ISignInService.IBodySignIn,
  void
> => {
  return useMutation({
    mutationFn: (data: ISignInService.IBodySignIn) => {
      return SignInService.signIn(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.signInFailed",
      SUCCESS_MESSAGE: "notifications.signInSuccess",
    },
  });
};

export const useSignInPasskey = (): UseMutationResult<
  IResp<void>,
  Error,
  ISignInService.IBodySignInPasskey,
  void
> => {
  return useMutation({
    mutationFn: (data: ISignInService.IBodySignInPasskey) => {
      return SignInService.signInPasskey(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.signInPasskeyFailed",
      SUCCESS_MESSAGE: "notifications.signInSuccess",
    },
  });
};
