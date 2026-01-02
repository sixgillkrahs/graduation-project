import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import VerifyEmailService from "./service";

export const useCreatePassword = (): UseMutationResult<
  IResp<void>,
  Error,
  IVerifyEmailService.IBodyCreatePassword,
  void
> => {
  return useMutation({
    mutationFn: (data: IVerifyEmailService.IBodyCreatePassword) => {
      return VerifyEmailService.createPassword(data);
    },
    meta: {
      ERROR_SOURCE:
        "[Create password failed]: The password has been successfully created",
      SUCCESS_MESSAGE: "The password has been successfully created",
    },
  });
};
