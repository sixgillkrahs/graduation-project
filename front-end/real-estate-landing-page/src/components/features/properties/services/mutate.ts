import { useMutation } from "@tanstack/react-query";
import PropertyService from "./service";

export const useIncreaseView = () => {
  return useMutation({
    mutationFn: (id: string) => PropertyService.increaseView(id),
  });
};
