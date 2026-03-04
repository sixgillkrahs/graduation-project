import { PropertyQueryKey } from "@/components/features/properties/services/config";
import { queryClient } from "@/lib/react-query/queryClient";
import { useMutation } from "@tanstack/react-query";
import AuthService from "./AuthService";
import { store } from "@/store";
import { clearProfile } from "@/store/profile.store";
import { logout } from "@/store/auth.store";

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
      store.dispatch(clearProfile());
      store.dispatch(logout());
    },
  });
};
