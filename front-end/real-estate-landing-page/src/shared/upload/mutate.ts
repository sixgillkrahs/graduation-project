import { IResp } from "@/@types/service";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import UploadService from "./upload.service";

export const useUploadImages = (): UseMutationResult<
  IResp<IUploadService.IUploadResponse>,
  Error,
  File[],
  void
> => {
  return useMutation({
    mutationFn: (data: File[]) => {
      return UploadService.uploadImages(data);
    },
    meta: {
      ERROR_SOURCE: "[Upload images failed]: The old password is incorrect",
      SUCCESS_MESSAGE: "Upload images successfully",
    },
  });
};
