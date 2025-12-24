import { useMutation, UseMutationResult } from "@tanstack/react-query";
import ExtractService from "./service";
import { IResp } from "@/@types/service";

export const useExtractID = (): UseMutationResult<
  IResp<string>,
  Error,
  FormData,
  void
> => {
  return useMutation({
    mutationFn: (file: FormData) => {
      return ExtractService.ExtractID(file);
    },
    meta: {
      ERROR_SOURCE: "[Extract ID failed]",
      SUCCESS_MESSAGE: "The ID has been successfully extracted",
    },
  });
};

export const useRegistration = (): UseMutationResult<
  IResp<string>,
  Error,
  IExtractService.IRegistrationRequest,
  void
> => {
  return useMutation({
    mutationFn: (data: IExtractService.IRegistrationRequest) => {
      return ExtractService.registration(data);
    },
    meta: {
      ERROR_SOURCE: "[Registration failed]",
      SUCCESS_MESSAGE: "The agent has been successfully registered",
    },
  });
};
