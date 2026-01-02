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
      ERROR_SOURCE: "[Sign in failed]: The username or password is incorrect",
      SUCCESS_MESSAGE: "Sign in successfully",
    },
  });
};
