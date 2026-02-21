import { PropertyQueryKey } from "@/components/features/properties/services/config";
import { queryClient } from "@/lib/react-query/queryClient";
import { useMutation } from "@tanstack/react-query";
import AuthService from "./AuthService";

export const useLogout = () => {
  return useMutation({
    mutationFn: () => AuthService.logout(),
    meta: {
      ERROR_SOURCE: "notifications.logoutFailed",
      SUCCESS_MESSAGE: "notifications.logoutSuccess",
    },
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      queryClient.invalidateQueries({ queryKey: [PropertyQueryKey.onSale] });
    },
  });
};
