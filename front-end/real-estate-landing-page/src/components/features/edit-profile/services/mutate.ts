import { IResp } from "@/@types/service";
import { queryClient } from "@/lib/react-query/queryClient";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { ProfileQueryKey } from "../../profile/services/config";
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
      ERROR_SOURCE: "notifications.editProfileFailed",
      SUCCESS_MESSAGE: "notifications.editProfileSuccess",
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [ProfileQueryKey.profile],
      });
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });
};
