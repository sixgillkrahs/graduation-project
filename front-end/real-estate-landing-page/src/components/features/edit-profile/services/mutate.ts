import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import EditProfileService from "./service";

export const useEditProfile = (): UseMutationResult<
  IResp<void>,
  Error,
  IEditProfileService.IFormData,
  void
> => {
  return useMutation({
    mutationFn: (data: IEditProfileService.IFormData) => {
      return EditProfileService.editProfile(data);
    },
    meta: {
      ERROR_SOURCE:
        "[Edit profile failed]: The profile has been successfully updated",
      SUCCESS_MESSAGE: "The profile has been successfully updated",
    },
  });
};
