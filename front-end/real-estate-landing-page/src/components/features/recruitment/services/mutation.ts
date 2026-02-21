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
      ERROR_SOURCE: "notifications.extractIdFailed",
      SUCCESS_MESSAGE: "notifications.extractIdSuccess",
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
      ERROR_SOURCE: "notifications.registrationFailed",
      SUCCESS_MESSAGE: "notifications.registrationSuccess",
    },
  });
};

export const useUploadImage = (): UseMutationResult<
  {
    filename: string;
    message: string;
    success: boolean;
    url: string;
  },
  Error,
  FormData,
  void
> => {
  return useMutation({
    mutationFn: (file: FormData) => {
      return ExtractService.UploadImage(file) as any;
    },
    meta: {
      ERROR_SOURCE: "notifications.uploadImageFailed",
      SUCCESS_MESSAGE: "notifications.uploadImageSuccess",
    },
  });
};
