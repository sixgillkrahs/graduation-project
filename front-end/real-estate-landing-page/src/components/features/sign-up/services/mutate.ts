import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import SignUpService from "./service";

export const useSignUp = (): UseMutationResult<
  IResp<void>,
  Error,
  ISignUpService.IBodySignUp,
  void
> => {
  return useMutation({
    mutationFn: (data: ISignUpService.IBodySignUp) => {
      return SignUpService.signUp(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.signUpFailed",
      SUCCESS_MESSAGE: "notifications.signUpSuccess",
    },
  });
};
